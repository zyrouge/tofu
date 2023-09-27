import { AutocompleteInteraction, CommandInteraction } from "eris";
import { TofuEvent } from "@/core/event";
import { Tofu } from "@/core/tofu";
import { isProduction } from "@/utils/env";
import { ErisUtils } from "@/utils/eris";
import { log } from "@/utils/log";

export const interactionCreateEvent: TofuEvent<"interactionCreate"> = {
    config: {
        name: "interactionCreate",
        type: "on",
    },
    action: async (tofu, interaction) => {
        if (!tofu.botReady) return;
        if (interaction instanceof CommandInteraction) {
            await onCommandInteration(tofu, interaction);
        } else if (interaction instanceof AutocompleteInteraction) {
            await onAutocompleteInteration(tofu, interaction);
        }
    },
};

const onCommandInteration = async (
    tofu: Tofu,
    interaction: CommandInteraction,
) => {
    if (!ErisUtils.isInteractionAllowed(tofu, interaction)) {
        await interaction.createMessage({
            content: ErisUtils.failureMessage("Your guild is blacklisted."),
        });
        return;
    }
    try {
        await interaction.defer();
        const action = tofu.commandInvokes.get(interaction.data.name);
        if (!action) return;
        const result = await action(tofu, interaction);
        if (!result) return;
        if (typeof result === "string") {
            await interaction.createMessage(result);
            return;
        }
        await interaction.createMessage(result.message, result.file);
    } catch (err) {
        if (isProduction()) {
            throw err;
        }
        log.error("Command interaction failed.");
        log.logError(err);
        await interaction.createMessage(
            ErisUtils.failureMessage(
                "Command interaction encountered an error.",
            ),
        );
    }
};

const onAutocompleteInteration = async (
    tofu: Tofu,
    interaction: AutocompleteInteraction,
) => {
    if (!ErisUtils.isInteractionAllowed(tofu, interaction)) return;
    try {
        const action = tofu.commandAutocompletes.get(interaction.data.name);
        if (!action) return;
        const result = await action(tofu, interaction);
        if (!result) return;
        await interaction.result(result);
    } catch (err) {
        if (!isProduction()) {
            throw err;
        }
        log.error("Auto-complete command interaction failed.");
        log.logError(err);
    }
};
