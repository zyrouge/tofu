import { Constants, InteractionDataOptionsString } from "eris";
import { inspect } from "util";
import { MisoCommand } from "@/core/command";
import { Miso } from "@/core/miso";
import { emojis } from "@/utils/emojis";

export const evalCommand: MisoCommand = {
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
    action: async (miso, interaction) => {
        const userId = interaction.member?.id;
        if (!userId || !miso.config.priviledgedUsers.includes(userId)) {
            return {
                message: {
                    content:
                        "You do not have enough permissions to run this command.",
                    flags: Constants.MessageFlags.EPHEMERAL,
                },
            };
        }
        const code =
            interaction.data.options?.find<InteractionDataOptionsString>(
                (x): x is InteractionDataOptionsString =>
                    x.name === "code" &&
                    x.type === Constants.ApplicationCommandOptionTypes.STRING
            )?.value;
        if (!code) {
            return {
                message: {
                    content: `You did not provide a value for \`code\`.`,
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
            ? `${emojis.check} Success!`
            : `${emojis.cross} Failure!`;
        if (content.length > 1900) {
            return {
                message: `${successString} (Output is attached as file)`,
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

function clean(miso: Miso, data: string) {
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
