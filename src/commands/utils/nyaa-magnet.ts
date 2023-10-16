import { Constants, EmbedOptions } from "eris";
import { TofuCommand } from "@/core/command";
import { colors } from "@/utils/colors";
import { emojis } from "@/utils/emojis";
import { ErisUtils } from "@/utils/eris";
import { Nyaa, NyaaMagnetResult } from "@/utils/nyaa";

export const nyaaMagnetCommand: TofuCommand = {
    config: {
        name: "nyaa-magnet",
        description: "Fetches magnet link from Nyaa.si.",
        options: [
            {
                name: "id",
                description: "Nyaa ID.",
                type: Constants.ApplicationCommandOptionTypes.STRING,
                required: true,
            },
        ],
    },
    invoke: async (_, interaction) => {
        const id = ErisUtils.getCommandInteractionStringOptionValue(
            interaction,
            "id",
        );
        if (!id) {
            return {
                message: ErisUtils.failureMessage(
                    "You did not provide a value for `id`.",
                ),
            };
        }
        const result = await Nyaa.magnet(id);
        return {
            message: {
                embeds: [createEmbed(result)],
            },
        };
    },
};

function createEmbed(result: NyaaMagnetResult) {
    const embed: EmbedOptions = {
        author: {
            name: result.title,
            icon_url: Nyaa.faviconUrl,
            url: result.url,
        },
        fields: [
            {
                name: `${emojis.magnet} Magnet`,
                value: `\`\`\`${result.magnet}\`\`\``,
            },
        ],
        color: colors.nyaaBlue,
    };
    return embed;
}
