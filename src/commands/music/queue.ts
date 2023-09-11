import { Constants } from "eris";
import { TofuCommand } from "@/core/command";
import { ErisUtils } from "@/utils/eris";
import { emojis } from "@/utils/emojis";
import { StringUtils } from "@/utils/string";

export const queueCommand: TofuCommand = {
    config: {
        name: "queue",
        description: "View songs queue.",
        options: [
            {
                name: "page",
                description: "Page number.",
                type: Constants.ApplicationCommandOptionTypes.NUMBER,
            },
        ],
    },
    invoke: async (tofu, interaction) => {
        const guildID = interaction.guildID!;
        const page =
            ErisUtils.getCommandInteractionNumberOptionValue(
                interaction,
                "page"
            ) ?? 1;
        const connection = tofu.music.getConnection(guildID);
        if (!connection) {
            return {
                message: ErisUtils.robotMessage("Nothing is being played."),
            };
        }
        const perPage = 10;
        const offsetStart = (page - 1) * perPage;
        const offsetEnd = offsetStart + perPage;
        const totalPages = Math.ceil(connection.songs.length / perPage);
        const songs = connection.songs.slice(offsetStart, offsetEnd);
        let content = "";
        content += `${ErisUtils.prettyMessage(
            emojis.music,
            `**Queue** (${page}/${totalPages})`
        )}`;
        content += "\n";
        if (songs.length > 0) {
            const statusEmoji = connection.paused ? emojis.pause : emojis.play;
            content += songs
                .map((x, i) => {
                    const offsetIndex = offsetStart + i;
                    const isCurrentPlaying = offsetIndex === connection.index;
                    const prefix = isCurrentPlaying ? `${statusEmoji} **` : "";
                    const suffix = isCurrentPlaying ? `**` : "";
                    return `${
                        offsetIndex + 1
                    }. ${prefix}[${StringUtils.overflow(x.metadata.title)}](<${
                        x.metadata.url
                    }>)${suffix} (Added by <@${x.addedBy}>)`;
                })
                .join("\n");
        } else {
            content += "[Empty]";
        }
        return {
            message: {
                content,
                allowedMentions: {
                    users: [],
                },
            },
        };
    },
};
