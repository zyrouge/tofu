import { TofuEvent } from "@/core/event";
import { log } from "@/utils/log";

export const errorEvent: TofuEvent<"error"> = {
    config: {
        name: "error",
        type: "on",
    },
    action: async (_, err) => {
        log.error(`Bot encountered an error. (${log.errorColor(`${err}`)})`);
    },
};
