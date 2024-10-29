import { Constants, VoiceChannel } from "eris";
import { TofuCommand } from "@/core/command";
import { TofuYoutubeUtils, TofuSong } from "@/core/modules/music";
import { emojis } from "@/utils/emojis";
import { ErisUtils } from "@/utils/eris";
import { StringUtils } from "@/utils/string";

export const playCommand: TofuCommand = {
    config: {
        name: "play",
        description: "Play a song.",
        options: [
            {
                name: "terms",
                description: "Search terms.",
                type: Constants.ApplicationCommandOptionTypes.STRING,
                required: true,
                autocomplete: true,
            },
        ],
    },
    autocomplete: async (tofu, interaction) => {
        const voiceChannelId = interaction.member?.voiceState?.channelID;
        if (!voiceChannelId) {
            return;
        }
        const terms = ErisUtils.getAutocompleteInteractionStringOptionValue(
            interaction,
            "terms",
        );
        if (!terms || terms.length < 3) {
            return;
        }
        const videos = await tofu.music.utils.search(terms);
        return videos.slice(0, 5).map((x) => ({
            name: StringUtils.overflow(`${x.title} (By ${x.author.name})`),
            value: TofuYoutubeUtils.constructVideoURL(x.id),
        }));
    },
    invoke: async (tofu, interaction) => {
        const guildID = interaction.guildID!;
        const voiceChannelId = interaction.member?.voiceState?.channelID;
        if (!voiceChannelId) {
            return {
                message: ErisUtils.failureMessage(
                    "You must be in a voice channel to use this command.",
                ),
            };
        }
        const memberId = interaction.member!.id;
        const terms = ErisUtils.getCommandInteractionStringOptionValue(
            interaction,
            "terms",
        );
        if (!terms) {
            return {
                message: ErisUtils.failureMessage(
                    "You did not provide a value for `terms`.",
                ),
            };
        }
        let title = "";
        let url = "";
        const songs: TofuSong[] = [];
        if (TofuYoutubeUtils.isWatchURL(terms)) {
            const video = await tofu.music.utils.getVideo(terms);
            if (video) {
                const metadata =
                    TofuYoutubeUtils.convertVideoInfoToSongMetadata(video);
                title = metadata.title;
                url = metadata.url;
                songs.push({
                    metadata,
                    addedBy: memberId,
                });
            }
        } else if (TofuYoutubeUtils.isPlaylistURL(terms)) {
            const playlist = await tofu.music.utils.getPlaylist(terms);
            if (playlist) {
                title = playlist.info.title ?? "?";
                url = terms;
                const mapped = playlist.supportedVideos.map((x) => ({
                    metadata:
                        TofuYoutubeUtils.convertPlaylistVideoToSongMetadata(x),
                    addedBy: memberId,
                }));
                songs.push(...mapped);
            }
        } else {
            const [searchVideo] = await tofu.music.utils.search(terms);
            if (searchVideo) {
                const metadata =
                    TofuYoutubeUtils.convertSearchVideoToSongMetadata(
                        searchVideo,
                    );
                title = metadata.title;
                url = metadata.url;
                songs.push({
                    metadata,
                    addedBy: memberId,
                });
            }
        }
        if (songs.length === 0) {
            return {
                message: ErisUtils.failureMessage(
                    `No results for \`${terms}\`.`,
                ),
            };
        }
        const voiceChannel = tofu.bot.getChannel(
            voiceChannelId,
        ) as VoiceChannel;
        const voiceChannelPermissions = voiceChannel.permissionsOf(
            tofu.bot.user.id,
        );
        if (
            !voiceChannelPermissions.has("viewChannel") ||
            !voiceChannelPermissions.has("voiceConnect") ||
            !voiceChannelPermissions.has("voiceSpeak")
        ) {
            return {
                message: ErisUtils.failureMessage(
                    `I do not have permissions to connect or speak in <#${voiceChannelId}>.`,
                ),
            };
        }
        const connection = await tofu.music.createOrGetConnection(
            guildID,
            voiceChannelId,
        );
        if (connection.voiceChannelId !== voiceChannelId) {
            return {
                message: ErisUtils.failureMessage(
                    `You must be in <#${connection.voiceChannelId}> to use this command.`,
                ),
            };
        }
        connection.addToQueue(songs);
        if (!connection.playing) {
            connection.index = connection.songs.length - 1;
            await connection.play();
            return {
                message: ErisUtils.prettyMessage(
                    emojis.music,
                    `Playing [**${title}**](${url})!`,
                ),
            };
        }
        return {
            message: ErisUtils.successMessage(
                `Enqueued [**${title}**](${url}).`,
            ),
        };
    },
};
