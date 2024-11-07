import { exists, readFile } from "fs-extra";
import p from "path";

export interface TofuBuildMetadata {
    latestCommit?: string;
    builtAt?: number;
}

let cache: TofuBuildMetadata | undefined;

export const getBuildMetadata = async () => {
    if (!cache) {
        cache = {};
        const path = p.join(__dirname, "build-metadata.json");
        if (await exists(path)) {
            cache = JSON.parse(await readFile(path, "utf-8"));
        }
    }
    return cache;
};
