import p from "path";

const rootDir = p.resolve(__dirname, "../..");

export const paths = {
    rootDir,
    configDir: p.join(rootDir, "config"),
};
