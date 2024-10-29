import { Tofu } from "@/core/tofu";

export class TofuFilteredGuilds {
    whitelistedByDefault = false;
    whitelisted = new Map<string, true>();

    constructor(public readonly tofu: Tofu) {
        this.loadCache();
    }

    loadCache() {
        const { filteredGuilds } = this.tofu.config;
        if (!filteredGuilds) {
            return;
        }
        this.whitelistedByDefault = filteredGuilds.mode === "blacklisted";
        filteredGuilds.ids.forEach((x) => {
            this.whitelisted.set(x, true);
        });
    }

    isWhitelisted(guildId: string) {
        return this.whitelistedByDefault || this.whitelisted.has(guildId);
    }

    isBlacklisted(guildId: string) {
        return !this.isWhitelisted(guildId);
    }
}
