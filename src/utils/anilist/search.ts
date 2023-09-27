import { Anilist } from "@/utils/anilist/base";

export interface AnilistSearchVariables {
    terms: string;
    type: string;
    isAdult: boolean;
    page: number;
    perPage: number;
}

export interface AnilistSearchResult {
    Page: {
        media: {
            id: number;
            title: {
                romaji?: string;
                english?: string;
                native: string;
            };
            siteUrl: string;
        }[];
    };
}

export class AnilistSearch {
    static query = `query ($terms: String, $type: MediaType, $isAdult: Boolean, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          media(search: $terms, type: $type, isAdult: $isAdult) {
            id
            title {
              romaji
              english
              native
            }
            siteUrl
          }
        }
    }`;

    static async search(options: AnilistSearchVariables) {
        return Anilist.query<AnilistSearchVariables, AnilistSearchResult>(
            this.query,
            options,
        );
    }
}
