import { Constants } from "eris";
import { inspect } from "util";
import { TofuCommand } from "@/core/command";
import { Tofu } from "@/core/tofu";
import { ErisUtils } from "@/utils/eris";

export const evalCommand: TofuCommand = {
    config: {
        name: "eval",
        description: "Eval JavaScript code.",
        options: [
            {
                name: "code",
                description: "JavaScript code.",
                type: Constants.ApplicationCommandOptionTypes.STRING,
                required: true,
            },
        ],
    },
    invoke: async (miso, interaction) => {
        const userId = interaction.member?.id;
        if (!userId || !miso.config.priviledgedUsers.includes(userId)) {
            return {
                message: {
                    content: ErisUtils.failureMessage(
                        "You do not have enough permissions to run this command."
                    ),
                    flags: Constants.MessageFlags.EPHEMERAL,
                },
            };
        }
        const code = ErisUtils.getCommandInteractionStringOptionValue(
            interaction,
            "code"
        );
        if (!code) {
            return {
                message: {
                    content: ErisUtils.failureMessage(
                        "You did not provide a value for `code`."
                    ),
                    flags: Constants.MessageFlags.EPHEMERAL,
                },
            };
        }
        let success: boolean, result: any;
        try {
            let evaled = eval(code);
            if (evaled instanceof Promise) {
                evaled = await evaled;
            }
            success = true;
            result = evaled;
        } catch (err) {
            success = false;
            result = err;
        }
        const content = clean(miso, result);
        const successString = success
            ? ErisUtils.successMessage("Success!")
            : ErisUtils.failureMessage("Failure!");
        if (content.length > 1900) {
            return {
                message: {
                    content: `${successString} (Output is attached as file)`,
                    flags: Constants.MessageFlags.EPHEMERAL,
                },
                file: { name: "output.txt", file: content },
            };
        }
        return {
            message: {
                content: `${successString}\n\`\`\`js\n${content}\n\`\`\``,
                flags: Constants.MessageFlags.EPHEMERAL,
            },
        };
    },
};

function clean(miso: Tofu, data: string) {
    const content =
        typeof data === "string" ? data : inspect(data, { depth: 1 });
    return (
        content
            .replaceAll(
                miso.config.discordToken,
                "mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0"
            )
            .replace(/`/g, "`" + String.fromCharCode(8203))
            .replace(/@/g, "@" + String.fromCharCode(8203))
            .trim() || "<no output>"
    );
}
