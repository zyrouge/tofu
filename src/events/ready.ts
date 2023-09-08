import { MisoEvent } from "@/core/event";
import { log } from "@/utils/log";

export const readyEvent: MisoEvent<"ready"> = {
    config: {
        name: "ready",
        type: "once",
    },
    action: async (miso) => {
        log.success(
            `Logged in as ${log.successColor(
                `${miso.bot.user.username}#${miso.bot.user.discriminator}`
            )}!`
        );
        await miso.loadCommands();
    },
};
