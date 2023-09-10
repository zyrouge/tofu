import { AutocompleteInteraction, CommandInteraction } from "eris";
import { TofuEvent } from "@/core/event";
import { Tofu } from "@/core/tofu";

export const interactionCreateEvent: TofuEvent<"interactionCreate"> = {
    config: {
        name: "interactionCreate",
        type: "on",
    },
    action: async (tofu, interaction) => {
        if (!tofu.botReady) return;
        if (interaction instanceof CommandInteraction) {
            await interaction.defer();
            await onCommandInteration(tofu, interaction);
        } else if (interaction instanceof AutocompleteInteraction) {
            await onAutoCompleteInteration(tofu, interaction);
        }
    },
};

const onCommandInteration = async (
    tofu: Tofu,
    interaction: CommandInteraction
) => {
    const action = tofu.commandInvokes.get(interaction.data.name);
    if (!action) return;
    const result = await action(tofu, interaction);
    if (!result) return;
    if (typeof result === "string") {
        await interaction.createMessage(result);
        return;
    }
    await interaction.createMessage(result.message, result.file);
};

const onAutoCompleteInteration = async (
    tofu: Tofu,
    interaction: AutocompleteInteraction
) => {
    const action = tofu.commandAutoCompletes.get(interaction.data.name);
    if (!action) return;
    const result = await action(tofu, interaction);
    if (!result) return;
    await interaction.result(result);
};
