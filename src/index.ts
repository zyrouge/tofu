import { Tofu } from "@/core/tofu";
import { getEnvMode, ensureEnvPath } from "@/utils/env";
import { log } from "@/utils/log";

const start = async () => {
    const mode = getEnvMode();
    log.info(`Running in ${log.infoColor(mode)} mode...`);
    ensureEnvPath();
    const tofu = await Tofu.create(mode);
    await tofu.start();
};

start();
