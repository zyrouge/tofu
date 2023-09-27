import { Anilist } from "@/utils/anilist/base";

export interface AnilistMediaVariables {
    id: number;
}

export interface AnilistMediaResult {
    Media: {
        id: number;
        title: {
            romaji?: string;
            english?: string;
            native: string;
        };
        siteUrl: string;
        description?: string;
        startDate: {
            year?: number;
            month?: number;
            day?: number;
        };
        endDate: {
            year?: number;
            month?: number;
            day?: number;
        };
        season?: string;
        seasonYear?: number;
        type: "ANIME" | "MANGA";
        format?: string;
        status: string;
        episodes?: number;
        duration?: number;
        chapters?: number;
        volumes?: number;
        isAdult: boolean;
        genres: string[];
        averageScore?: number;
        popularity?: number;
        coverImage: {
            large?: string;
        };
        bannerImage?: string;
    };
}

export class AnilistMedia {
    static query = `query ($id: Int) {
        Media(id: $id) {
          id
          title {
            romaji
            english
            native
          }
          siteUrl
          description
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          season
          seasonYear
          type
          format
          status
          episodes
          duration
          chapters
          volumes
          isAdult
          genres
          averageScore
          popularity
          coverImage {
            large
          }
          bannerImage
        }
      }
    `;

    static async get(options: AnilistMediaVariables) {
        return Anilist.query<AnilistMediaVariables, AnilistMediaResult>(
            this.query,
            options,
        );
    }
}
