import p from "path";

const rootDir = p.resolve(__dirname, "../..");
const configDir = p.resolve(rootDir, "config");
const dataDir = p.resolve(rootDir, "data");

export const paths = {
    rootDir,
    configDir,
    dataDir,
};
