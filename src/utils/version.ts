import { readFile } from "fs-extra";
import p from "path";
import { paths } from "@/utils/paths";

let version: string | undefined;

export const getVersion = async () => {
    if (!version) {
        const path = p.join(paths.rootDir, "package.json");
        const content = await readFile(path, "utf-8");
        version = content.match(/"version":\s+"([^"]+)",/)?.[1] ?? "0.0.0";
    }
    return version;
};
