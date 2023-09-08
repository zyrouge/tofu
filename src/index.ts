import { Miso } from "@/core/miso";
import { log } from "@/utils/log";

const start = async () => {
    const mode = process.env.NODE_ENV ?? "dev";
    log.info(`Running in ${log.infoColor(mode)} mode...`);
    const miso = await Miso.create(mode);
    await miso.start();
};

start();
