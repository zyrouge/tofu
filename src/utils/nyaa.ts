import { parse as parseHtml } from "node-html-parser";
import { request } from "undici";

export type NyaaSearchItemStatus = "success" | "default" | "danger";

export interface NyaaSearchItem {
    id: string;
    status: NyaaSearchItemStatus;
    category: string;
    title: string;
    url: string;
    torrent: string;
    magnet: string;
    size: string;
    date: string;
    seeders: number;
    leechers: number;
    downloads: number;
}

export interface NyaaSearchResult {
    url: string;
    terms: string;
    items: NyaaSearchItem[];
}

export interface NyaaMagnetResult {
    id: string;
    title: string;
    url: string;
    magnet: string;
}

export class Nyaa {
    static baseUrl = "https://nyaa.si";
    static faviconUrl = "https://nyaa.si/static/favicon.png";

    static async search(terms: string) {
        const url = `${this.baseUrl}/?q=${encodeURIComponent(
            terms,
        )}&s=seeders&o=desc`;
        const resp = await request(url);
        const html = await resp.body.text();
        const document = parseHtml(html);
        const rows = document.querySelectorAll(".torrent-list tbody tr");
        const items = rows.slice(0, 5).map((x) => {
            const [
                category,
                name,
                links,
                size,
                date,
                seeders,
                leechers,
                downloads,
            ] = x.querySelectorAll("td");
            const nameAnchor = name!.querySelectorAll("a").at(-1);
            const linkAnchors = links!.querySelectorAll("a");
            const url = this.baseUrl + nameAnchor!.getAttribute("href")!;
            const result: NyaaSearchItem = {
                id: this.parseIdFromViewUrl(url),
                status: x.classList.value[0] as NyaaSearchItemStatus,
                category:
                    category?.querySelector("a")?.getAttribute("title") ?? "?",
                title: nameAnchor!.getAttribute("title")!,
                url: url,
                torrent: this.baseUrl + linkAnchors[0]!.getAttribute("href")!,
                magnet: linkAnchors[1]!.getAttribute("href")!,
                size: size?.textContent ?? "?",
                date: date?.textContent ?? "?",
                seeders: parseInt(seeders?.textContent ?? "") || 0,
                leechers: parseInt(leechers?.textContent ?? "") || 0,
                downloads: parseInt(downloads?.textContent ?? "") || 0,
            };
            return result;
        });
        const result: NyaaSearchResult = {
            url,
            terms,
            items,
        };
        return result;
    }

    static async magnet(id: string) {
        const url = `${this.baseUrl}/view/${id}`;
        const resp = await request(url);
        const html = await resp.body.text();
        const document = parseHtml(html);
        const panel = document.querySelector(".container .panel")!;
        const title = panel.querySelector(".panel-title")!.textContent.trim();
        const magnet = panel
            .querySelector(".panel-footer .card-footer-item")!
            .getAttribute("href")!;
        const result: NyaaMagnetResult = {
            id,
            title,
            url,
            magnet,
        };
        return result;
    }

    static parseIdFromViewUrl(url: string) {
        return url.match(/(\d+)$/)![1]!;
    }
}
