import Undici from "undici";

export class Anilist {
    static apiUrl = "https://graphql.anilist.co";
    static faviconUrl = "https://anilist.co/img/icons/favicon-32x32.png";

    static siteUrlIdRegex = /https:\/\/anilist\.co\/\w+\/(\d+)/;

    static parseIdFromSiteUrl(siteUrl: string) {
        const id = siteUrl.match(this.siteUrlIdRegex)?.[1];
        return typeof id === "string" ? parseInt(id) : undefined;
    }

    static async query<Variables extends object, Result extends object>(
        query: string,
        variables: Variables,
    ) {
        const resp = await Undici.request(this.apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                query,
                variables,
            }),
        });
        const json = await resp.body.json();
        return (json as Record<string, unknown>).data as Result;
    }
}
