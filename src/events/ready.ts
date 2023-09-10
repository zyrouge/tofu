import { TofuEvent } from "@/core/event";
import { log } from "@/utils/log";
import { Constants } from "eris";

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
            status?.activity?.text
                ? { name: status.activity.text, type: status.activity.type }
                : undefined
        );
        Constants.ActivityTypes;
    },
};
