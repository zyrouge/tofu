import { TofuEvent } from "@/core/event";
import { log } from "@/utils/log";
import { Constants } from "eris";

export const readyEvent: TofuEvent<"ready"> = {
    config: {
        name: "ready",
        type: "once",
    },
    action: async (tofu) => {
        log.success(
            `Logged in as ${log.successColor(
                `${tofu.bot.user.username}#${tofu.bot.user.discriminator}`
            )}!`
        );
        await tofu.loadCommands();
        const status = tofu.config.discordStatus;
        tofu.bot.editStatus(
            status?.type ?? "online",
            status?.activity?.text
                ? { name: status.activity.text, type: status.activity.type }
                : undefined
        );
        Constants.ActivityTypes;
    },
};
