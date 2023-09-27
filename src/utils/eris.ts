import {
    AutocompleteInteraction,
    CommandInteraction,
    Constants,
    InteractionDataOptionsBoolean,
    InteractionDataOptionsNumber,
    InteractionDataOptionsString,
} from "eris";
import { Tofu } from "@/core/tofu";
import { emojis } from "@/utils/emojis";

export class ErisUtils {
    static isInteractionAllowed(
        tofu: Tofu,
        interaction: CommandInteraction | AutocompleteInteraction,
    ) {
        const { guildID } = interaction;
        if (!guildID) return;
        return tofu.filteredGuilds.isWhitelisted(guildID);
    }

    static getAutocompleteInteractionStringOptionValue(
        interaction: AutocompleteInteraction,
        optionName: string,
    ) {
        const option = interaction.data.options?.find(
            (x): x is InteractionDataOptionsString =>
                x.name === optionName &&
                x.type === Constants.ApplicationCommandOptionTypes.STRING,
        );
        return option?.value;
    }

    static getAutocompleteInteractionBooleanOptionValue(
        interaction: AutocompleteInteraction,
        optionName: string,
    ) {
        const option = interaction.data.options?.find(
            (x): x is InteractionDataOptionsBoolean =>
                x.name === optionName &&
                x.type === Constants.ApplicationCommandOptionTypes.BOOLEAN,
        );
        return option?.value;
    }

    static getCommandInteractionStringOptionValue(
        interaction: CommandInteraction,
        optionName: string,
    ) {
        const option = interaction.data.options?.find(
            (x): x is InteractionDataOptionsString =>
                x.name === optionName &&
                x.type === Constants.ApplicationCommandOptionTypes.STRING,
        );
        return option?.value;
    }

    static getCommandInteractionNumberOptionValue(
        interaction: CommandInteraction,
        optionName: string,
    ) {
        const option = interaction.data.options?.find(
            (x): x is InteractionDataOptionsNumber =>
                x.name === optionName &&
                x.type === Constants.ApplicationCommandOptionTypes.NUMBER,
        );
        return option?.value;
    }

    static robotMessage(text: string) {
        return this.prettyMessage(emojis.robot, text);
    }

    static successMessage(text: string) {
        return this.prettyMessage(emojis.check, text);
    }

    static failureMessage(text: string) {
        return this.prettyMessage(emojis.cross, text);
    }

    static prettyMessage(emoji: string, text: string) {
        return `${emoji} | ${text}`;
    }
}
