import p from "path";

export const isProduction = () => process.env.NODE_ENV === "production";
export const getEnvMode = () => process.env.NODE_ENV ?? "unknown";

export const ensureEnvPath = () => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const ffmpeg = require("ffmpeg-static") as string | null;
        if (typeof ffmpeg !== "string") {
            return;
        }
        const ffmpegDir = p.dirname(ffmpeg);
        process.env.PATH = `${process.env.PATH}:${ffmpegDir}`;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty
    } catch (_) {}
};
