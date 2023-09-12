import { TofuCommand } from "@/core/command";
import { PrettyDuration } from "@/utils/duration";
import { ErisUtils } from "@/utils/eris";

export const uptimeCommand: TofuCommand = {
    config: {
        name: "uptime",
        description: "Check bot's uptime.",
    },
    invoke: async (tofu, __) => {
        return {
            message: ErisUtils.robotMessage(
                `I've been up and running for **${PrettyDuration.prettyMilliseconds(
                    tofu.uptime,
                    "human"
                )}**!`
            ),
        };
    },
};
