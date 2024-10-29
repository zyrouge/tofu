import { Constants, EmbedOptions } from "eris";
import { TofuCommand } from "@/core/command";
import { Anilist } from "@/utils/anilist/base";
import { AnilistMedia, AnilistMediaResult } from "@/utils/anilist/media";
import { AnilistSearch } from "@/utils/anilist/search";
import { ArrayUtils } from "@/utils/array";
import { colors } from "@/utils/colors";
import { emojis } from "@/utils/emojis";
import { ErisUtils } from "@/utils/eris";
import { StringUtils } from "@/utils/string";

const mediaTypeValuesAutocomplete = ["Anime", "Manga"].map((x) => ({
    name: x,
    value: x,
}));

export const anilistCommand: TofuCommand = {
    config: {
        name: "anilist",
        description: "Browse AniList.",
        options: [
            {
                name: "type",
                description: "Media type.",
                type: Constants.ApplicationCommandOptionTypes.STRING,
                required: true,
                autocomplete: true,
            },
            {
                name: "terms",
                description: "Search terms.",
                type: Constants.ApplicationCommandOptionTypes.STRING,
                required: true,
                autocomplete: true,
            },
            {
                name: "adult",
                description: "Filter adult only.",
                type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
                required: false,
                // TODO: weird type issue
                channel_types: undefined as never,
            },
        ],
    },
    autocomplete: async (_, interaction) => {
        const focused = interaction.data.options.find(
            (x) => "focused" in x && x.focused,
        );
        if (!focused) {
            return [];
        }
        if (focused?.name === "type") {
            return mediaTypeValuesAutocomplete;
        }
        const type = ErisUtils.getAutocompleteInteractionStringOptionValue(
            interaction,
            "type",
        )?.toUpperCase();
        if (!type) {
            return [];
        }
        const terms = ErisUtils.getAutocompleteInteractionStringOptionValue(
            interaction,
            "terms",
        );
        if (!terms || terms.length < 3) {
            return;
        }
        const isAdult =
            ErisUtils.getAutocompleteInteractionBooleanOptionValue(
                interaction,
                "adult",
            ) ?? false;
        const result = await AnilistSearch.search({
            terms,
            type,
            isAdult,
            page: 1,
            perPage: 5,
        });
        return result.Page.media.map((x) => ({
            name: StringUtils.overflow(stringifyMediaTitle(x.title)),
            value: x.siteUrl,
        }));
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
        const id = Anilist.parseIdFromSiteUrl(terms);
        if (!id) {
            return {
                message: ErisUtils.failureMessage(
                    "You did not provide a valid media id.",
                ),
            };
        }
        const { Media: media } = await AnilistMedia.get({ id });
        return {
            message: {
                embeds: [createEmbed(media)],
            },
        };
    },
};

function stringifyMediaTitle(title: AnilistMediaResult["Media"]["title"]) {
    return [title.english, title.romaji, title.native]
        .filter((x) => typeof x === "string")
        .join(" / ");
}

function stringifyMediaDate(date: AnilistMediaResult["Media"]["startDate"]) {
    if (date.day && date.month && date.year) {
        return `${date.day}-${date.month}-${date.year}`;
    }
    return "?";
}

const mediaPrettyFormats: Record<string, string> = {
    TV: "TV",
    TV_SHORT: "TV Short",
    OVA: "OVA",
    ONA: "ONA",
};

function prettyMediaFormat(format: string) {
    return mediaPrettyFormats[format] ?? StringUtils.normalizeText(format);
}

const htmlToMarkdownReplacers: Record<string, string> = {
    br: "\n",
    i: "_",
    cite: "_",
    b: "*",
    strong: "*",
    u: "__",
};

function prettyDescription(text: string) {
    return text
        .replaceAll(
            /<\/?(\w+)>/g,
            (_, tag) => htmlToMarkdownReplacers[tag] ?? "",
        )
        .replaceAll(/\n{2,}/g, "\n\n");
}

function createEmbed(media: AnilistMediaResult["Media"]): EmbedOptions {
    let title = media.title.english ?? media.title.romaji ?? media.title.native;
    if (media.isAdult) {
        title += ` ${emojis.nsfw}`;
    }
    return {
        author: {
            name: title,
            icon_url: Anilist.faviconUrl,
            url: media.siteUrl,
        },
        thumbnail: {
            url: media.coverImage.large,
        },
        image: {
            url: media.bannerImage,
        },
        fields: ArrayUtils.filterTruthy([
            {
                name: "Title",
                value: [
                    `\`EN\` ${media.title.english ?? "?"}`,
                    `\`RO\` ${media.title.romaji ?? "?"}`,
                    `\`JP\` ${media.title.native}`,
                ].join("\n"),
            },
            typeof media.description === "string" && {
                name: "Description",
                value: prettyDescription(media.description),
            },
            {
                name: "Type",
                value: `${StringUtils.normalizeText(media.type)} (${
                    typeof media.format === "string"
                        ? prettyMediaFormat(media.format)
                        : "?"
                })`,
            },
            {
                name: "Status",
                value: StringUtils.normalizeText(media.status),
            },
            {
                name: "Start & End Date",
                value: `${stringifyMediaDate(
                    media.startDate,
                )} to ${stringifyMediaDate(media.endDate)}`,
            },
            {
                name: "Average Score",
                value: media.averageScore ? `${media.averageScore}%` : "?",
            },
            typeof media.episodes === "number" && {
                name: "Episodes",
                value: `${media.episodes} (${media.duration ?? "?"} mins.)`,
            },
            typeof media.chapters === "number" && {
                name: "Chapters",
                value: media.chapters.toString(),
            },
            typeof media.volumes === "number" && {
                name: "Volumes",
                value: media.volumes.toString(),
            },
            {
                name: "Genres",
                value: media.genres.join(", "),
            },
        ]),
        color: colors.anilistBlue,
    };
}
