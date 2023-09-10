import { TofuCommand } from "@/core/command";
import { ErisUtils } from "@/utils/eris";
import { emojis } from "@/utils/emojis";
import { colors } from "@/utils/colors";

export const nowPlayingCommand: TofuCommand = {
    config: {
        name: "nowplaying",
        description: "View current playing song.",
    },
    invoke: async (tofu, interaction) => {
        const guildID = interaction.guildID!;
        const connection = tofu.music.getConnection(guildID);
        const song = connection?.songs[connection?.index];
        if (!connection || !song) {
            return {
                message: ErisUtils.robotMessage(`Nothing is being played.`),
            };
        }
        return {
            message: {
                embeds: [
                    {
                        title: ErisUtils.prettyMessage(
                            emojis.music,
                            "Now Playing"
                        ),
                        description: [
                            `Title: **${song.metadata.title}**`,
                            `Channel: **${song.metadata.channel}**`,
                            `Added by: <@${song.addedBy}>`,
                            `Position: ${connection.index + 1} of ${
                                connection.songs.length
                            }`,
                        ].join("\n"),
                        image: {
                            url: song.metadata.thumbnail,
                        },
                        color: colors.cyan500,
                    },
                ],
            },
        };
    },
};
