import { Constants } from "eris";
import * as GeniusLyrics from "genius-lyrics";
import { TofuCommand } from "@/core/command";
import { emojis } from "@/utils/emojis";
import { ErisUtils } from "@/utils/eris";
import { StringUtils } from "@/utils/string";
import { log } from "@/utils/log";
import { colors } from "@/utils/colors";

const genius = new GeniusLyrics.Client();

export const geniusCommand: TofuCommand = {
    config: {
        name: "genius",
        description: "Fetches song information and lyrics from Genius.com.",
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
        const terms = ErisUtils.getAutocompleteInteractionStringOptionValue(
            interaction,
            "terms"
        );
        if (!terms || terms.length < 3) return;
        const songs = await genius.songs.search(terms);
        const filtered: GeniusLyrics.Song[] = [];
        for (const x of songs) {
            if (filtered.length >= 5) break;
            if (x.url.length >= 100) continue;
            filtered.push(x);
        }
        return filtered.map((x) => ({
            name: StringUtils.overflow(x.fullTitle),
            value: x.url,
        }));
    },
    invoke: async (_, interaction) => {
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
        let url: string | undefined;
        if (StringUtils.isUrl(terms)) {
            url = terms;
        } else {
            try {
                const [song] = await genius.songs.search(terms);
                url = song?.url;
            } catch (err) {
                log.error(
                    `Unable to generate Genius search results for "${terms}" (${log.errorColor(
                        `${err}`
                    )})`
                );
            }
        }
        if (!url) {
            return {
                message: ErisUtils.failureMessage(
                    `No results for \`${terms}\`.`
                ),
            };
        }
        let song: GeniusLyrics.ScrapedSong | undefined;
        try {
            song = await genius.songs.scrape(url);
        } catch (err) {
            log.error(
                `Unable to scrape Genius information from "${url}" (${log.errorColor(
                    `${err}`
                )})`
            );
        }
        if (!song) {
            return {
                message: ErisUtils.failureMessage(
                    `Unable to scrape information from \`${url}\`.`
                ),
            };
        }
        const info: Extract<
            GeniusLyrics.ScrapedSongData["entities"]["songs"][string],
            { fullTitle: string }
        > = song.data.entities.songs[song.data.songPage.song]! as any;
        const artist = song.data.entities.artists[info.primaryArtist]!;
        const lyrics = song.lyrics() || "[No lyrics]";
        const [chunk1, ...chunks] = StringUtils.chunk(lyrics);
        const totalPages = 1 + chunks.length;
        const footerPrefix = ErisUtils.prettyMessage(
            emojis.memo,
            "genius-lyrics"
        );
        await interaction.createMessage({
            embeds: [
                {
                    title: info.title,
                    url: info.url,
                    author: {
                        name: artist.name,
                        icon_url: artist.imageUrl,
                        url: artist.url,
                    },
                    thumbnail: {
                        url: info.songArtImageUrl,
                    },
                    color: colors.geniusYellow,
                    description: chunk1!,
                    footer: {
                        text: `${footerPrefix} | Page 1/${totalPages}`,
                    },
                },
            ],
        });
        let i = 2;
        for (const x of chunks) {
            await interaction.channel.createMessage({
                embeds: [
                    {
                        color: colors.geniusYellow,
                        description: x,
                        footer: {
                            text: `${footerPrefix} | Page ${i}/${totalPages}`,
                        },
                    },
                ],
            });
            i++;
        }
    },
};
