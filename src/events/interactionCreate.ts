import { MisoEvent } from "@/core/event";
import { CommandInteraction } from "eris";

export const interactionCreateEvent: MisoEvent<"interactionCreate"> = {
    config: {
        name: "interactionCreate",
        type: "on",
    },
    action: async (miso, interaction) => {
        if (!(interaction instanceof CommandInteraction)) return;
        const commandAction = miso.commandActions.get(interaction.data.name);
        if (!commandAction) return;
        const result = await commandAction(miso, interaction);
        if (!result) return;
        if (typeof result === "string") {
            await interaction.createMessage(result);
        } else {
            await interaction.createMessage(result.message, result.file);
        }
    },
};
