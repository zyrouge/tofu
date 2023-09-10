import { TofuEvent } from "@/core/event";
import { log } from "@/utils/log";

export const readyEvent: TofuEvent<"ready"> = {
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
        const status = miso.config.discordStatus;
        miso.bot.editStatus(
            status?.type ?? "online",
            status?.text ? { name: status.text } : undefined
        );
    },
};
