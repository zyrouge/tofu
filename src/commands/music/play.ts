import { Constants, VoiceChannel } from "eris";
import * as ytext from "youtube-ext";
import { TofuCommand } from "@/core/command";
import { ErisUtils } from "@/utils/eris";
import { TofuMusicUtils, TofuSong } from "@/core/modules/music";
import { StringUtils } from "@/utils/string";
import { emojis } from "@/utils/emojis";

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
    autocomplete: async (_, interaction) => {
        const voiceChannelId = interaction.member?.voiceState?.channelID;
        if (!voiceChannelId) return;
        const terms = ErisUtils.getAutocompleteInteractionStringOptionValue(
            interaction,
            "terms"
        );
        if (!terms || terms.length < 3) return;
        const videos = await TofuMusicUtils.search(terms);
        return videos.slice(0, 5).map((x) => ({
            name: StringUtils.overflow(`${x.title} (By ${x.channel.name})`),
            value: TofuMusicUtils.shortenVideoURL(x.url),
        }));
    },
    invoke: async (tofu, interaction) => {
        const guildID = interaction.guildID!;
        const voiceChannelId = interaction.member?.voiceState?.channelID;
        if (!voiceChannelId) {
            return {
                message: ErisUtils.failureMessage(
                    "You must be in a voice channel to use this command."
                ),
            };
        }
        const memberId = interaction.member!.id;
        const terms = ErisUtils.getCommandInteractionStringOptionValue(
            interaction,
            "terms"
        );
        if (!terms) {
            return {
                message: ErisUtils.failureMessage(
                    "You did not provide a value for `terms`."
                ),
            };
        }
        let title = "";
        let url = "";
        const songs: TofuSong[] = [];
        if (ytext.utils.isYoutubeWatchURL(terms)) {
            const video = await TofuMusicUtils.getVideo(terms);
            if (video) {
                title = video.title;
                url = video.url;
                songs.push({
                    metadata:
                        TofuMusicUtils.convertVideoInfoToSongMetadata(video),
                    addedBy: memberId,
                });
            }
        } else if (ytext.utils.isYoutubePlaylistURL(terms)) {
            const playlist = await TofuMusicUtils.getPlaylist(terms);
            if (playlist) {
                title = playlist.title;
                url = playlist.url;
                const mapped = playlist.videos.map((x) => ({
                    metadata:
                        TofuMusicUtils.convertPlaylistVideoToSongMetadata(x),
                    addedBy: memberId,
                }));
                songs.push(...mapped);
            }
        } else {
            const [searchVideo] = await TofuMusicUtils.search(terms);
            if (searchVideo) {
                title = searchVideo.title;
                url = searchVideo.url;
                songs.push({
                    metadata:
                        TofuMusicUtils.convertSearchVideoToSongMetadata(
                            searchVideo
                        ),
                    addedBy: memberId,
                });
            }
        }
        if (songs.length === 0) {
            return {
                message: ErisUtils.failureMessage(
                    `No results for \`${terms}\`.`
                ),
            };
        }
        const voiceChannel = tofu.bot.getChannel(
            voiceChannelId
        ) as VoiceChannel;
        const voiceChannelPermissions = voiceChannel.permissionsOf(
            tofu.bot.user.id
        );
        if (
            !voiceChannelPermissions.has("voiceConnect") ||
            !voiceChannelPermissions.has("voiceSpeak")
        ) {
            return {
                message: ErisUtils.failureMessage(
                    `I do not have permissions to connect or speak in <#${voiceChannelId}>.`
                ),
            };
        }
        const connection = await tofu.music.createOrGetConnection(
            guildID,
            voiceChannelId
        );
        if (connection.voiceChannelId !== voiceChannelId) {
            return {
                message: ErisUtils.failureMessage(
                    `You must be in <#${connection.voiceChannelId}> to use this command.`
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
                    `Playing [**${title}**](${url})!`
                ),
            };
        }
        return {
            message: ErisUtils.successMessage(
                `Enqueued [**${title}**](${url}).`
            ),
        };
    },
};
