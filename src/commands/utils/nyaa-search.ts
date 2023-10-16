import { Constants, EmbedOptions } from "eris";
import { TofuCommand } from "@/core/command";
import { colors } from "@/utils/colors";
import { emojis } from "@/utils/emojis";
import { ErisUtils } from "@/utils/eris";
import { Nyaa, NyaaSearchResult } from "@/utils/nyaa";

export const nyaaSearchCommand: TofuCommand = {
    config: {
        name: "nyaa-search",
        description: "Fetches search results Nyaa.si.",
        options: [
            {
                name: "terms",
                description: "Search terms.",
                type: Constants.ApplicationCommandOptionTypes.STRING,
                required: true,
            },
        ],
    },
    invoke: async (_, interaction) => {
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
        const result = await Nyaa.search(terms);
        if (result.items.length === 0) {
            return {
                message: ErisUtils.prettyMessage(emojis.frown, "No results."),
            };
        }
        return {
            message: {
                embeds: [createEmbed(result)],
            },
        };
    },
};

function createEmbed(result: NyaaSearchResult) {
    const count = result.items.length;
    const embed: EmbedOptions = {
        author: {
            name: `Results for "${result.terms}"`,
            icon_url: Nyaa.faviconUrl,
            url: result.url,
        },
        fields: result.items.map((x, i) => {
            const prettyIndex = i + 1;
            return {
                name: `${prettyIndex}. ${x.title}`,
                value: [
                    [
                        `\`${emojis.id} ${x.id}\``,
                        `[View](${x.url})`,
                        `[Torrent](${x.torrent})`,
                        `\`${emojis.pushPin} ${x.category}\``,
                    ].join(" | "),
                    [
                        `\`${emojis.package} ${x.size}\``,
                        `\`${emojis.calendar} ${x.date}\``,
                        `\`${emojis.upArrow} ${x.seeders} (${x.leechers})\``,
                        `\`${emojis.downArrow} ${x.downloads}\``,
                    ].join(" | "),
                    prettyIndex != count ? "\u200b" : "",
                ].join("\n"),
            };
        }),
        color: colors.nyaaBlue,
    };
    return embed;
}
