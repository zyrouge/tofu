import { TofuCommand } from "@/core/command";
import { DurationUtils } from "@/utils/duration";
import { ErisUtils } from "@/utils/eris";

export const uptimeCommand: TofuCommand = {
    config: {
        name: "uptime",
        description: "Check bot's uptime.",
    },
    invoke: async (tofu) => ({
        message: ErisUtils.robotMessage(
            `I've been up and running for **${DurationUtils.prettyMilliseconds(
                tofu.uptime,
                "human",
            )}**!`,
        ),
    }),
};
