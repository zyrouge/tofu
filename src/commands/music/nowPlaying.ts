import { TofuCommand } from "@/core/command";
import { ErisUtils } from "@/utils/eris";
import { emojis } from "@/utils/emojis";
import { colors } from "@/utils/colors";
import { DurationUtils } from "@/utils/duration";

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
                message: ErisUtils.robotMessage("Nothing is being played."),
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
                            "",
                            createProgressBar(
                                connection.playedDuration / 1000,
                                parseDuration(song.metadata.duration)
                            ),
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

const progressBarMaxCount = 10;
const progressBarPavement = emojis.blackSmallSquare;
const progressBarMarker = emojis.radioButton;

const createProgressBar = (current?: number, total?: number) => {
    const ratio = current && total ? current / total : 0;
    const pavement = Array(progressBarMaxCount).fill(progressBarPavement);
    pavement.splice(
        Math.floor(ratio * progressBarMaxCount),
        0,
        progressBarMarker
    );
    const bar = `\`${pavement.join("")}\``;
    return `${prettyDuration(current)} ${bar} ${prettyDuration(total)}`;
};

const parseDuration = (value?: string) => {
    if (!value) return;
    const parsed = DurationUtils.parseShortFormatted(value);
    if (!parsed) return;
    return DurationUtils.durationToSeconds(parsed);
};

const prettyDuration = (value?: number) => {
    const pretty =
        typeof value === "number"
            ? DurationUtils.prettySeconds(value, "short")
            : "-";
    return `\`${pretty}\``;
};
