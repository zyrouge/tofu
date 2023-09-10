import { Tofu } from "@/core/tofu";
import { log } from "@/utils/log";

const start = async () => {
    const mode = process.env.NODE_ENV ?? "dev";
    log.info(`Running in ${log.infoColor(mode)} mode...`);
    const tofu = await Tofu.create(mode);
    await tofu.start();
};

start();
