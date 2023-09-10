import { AutocompleteInteraction, CommandInteraction } from "eris";
import { TofuEvent } from "@/core/event";
import { Tofu } from "@/core/tofu";

export const interactionCreateEvent: TofuEvent<"interactionCreate"> = {
    config: {
        name: "interactionCreate",
        type: "on",
    },
    action: async (miso, interaction) => {
        if (interaction instanceof CommandInteraction) {
            await onCommandInteration(miso, interaction);
        } else if (interaction instanceof AutocompleteInteraction) {
            await onAutoCompleteInteration(miso, interaction);
        }
    },
};

const onCommandInteration = async (
    miso: Tofu,
    interaction: CommandInteraction
) => {
    const action = miso.commandInvokes.get(interaction.data.name);
    if (!action) return;
    const result = await action(miso, interaction);
    if (!result) return;
    if (typeof result === "string") {
        await interaction.createMessage(result);
        return;
    }
    await interaction.createMessage(result.message, result.file);
};

const onAutoCompleteInteration = async (
    miso: Tofu,
    interaction: AutocompleteInteraction
) => {
    const action = miso.commandAutoCompletes.get(interaction.data.name);
    if (!action) return;
    const result = await action(miso, interaction);
    if (!result) return;
    await interaction.result(result);
};
