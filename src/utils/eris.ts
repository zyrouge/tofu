import {
    AutocompleteInteraction,
    CommandInteraction,
    Constants,
    InteractionDataOptionsNumber,
    InteractionDataOptionsString,
} from "eris";
import { emojis } from "@/utils/emojis";

export class ErisUtils {
    static getAutocompleteInteractionStringOptionValue(
        interaction: AutocompleteInteraction,
        optionName: string
    ) {
        const option = interaction.data.options?.find(
            (x) =>
                x.name === optionName &&
                x.type === Constants.ApplicationCommandOptionTypes.STRING
        ) as InteractionDataOptionsString;
        return option?.value;
    }

    static getCommandInteractionStringOptionValue(
        interaction: CommandInteraction,
        optionName: string
    ) {
        const option =
            interaction.data.options?.find<InteractionDataOptionsString>(
                (x): x is InteractionDataOptionsString =>
                    x.name === optionName &&
                    x.type === Constants.ApplicationCommandOptionTypes.STRING
            );
        return option?.value;
    }

    static getCommandInteractionNumberOptionValue(
        interaction: CommandInteraction,
        optionName: string
    ) {
        const option =
            interaction.data.options?.find<InteractionDataOptionsNumber>(
                (x): x is InteractionDataOptionsNumber =>
                    x.name === optionName &&
                    x.type === Constants.ApplicationCommandOptionTypes.NUMBER
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
