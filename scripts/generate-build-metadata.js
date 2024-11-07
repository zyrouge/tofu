/* eslint-disable @typescript-eslint/no-require-imports */
const p = require("path");
const { writeFile, ensureDir } = require("fs-extra");
const { promisify } = require("util");
const { exec } = require("child_process");

const BUILD_METADATA_PATH = p.resolve(
    __dirname,
    "../dist/utils/build-metadata.json",
);

const execAsync = promisify(exec);

const start = async () => {
    /**
     * @type {import("../src/utils/build-metadata").TofuBuildMetadata}
     */
    const buildMetadata = {
        latestCommit: (await execAsync("git rev-parse HEAD")).stdout.trim(),
        builtAt: Date.now(),
    };
    await ensureDir(p.dirname(BUILD_METADATA_PATH));
    await writeFile(BUILD_METADATA_PATH, JSON.stringify(buildMetadata));
};

start();
