import {
    CommandInteraction,
    InteractionContent,
    FileContent,
    AutocompleteInteraction,
    ApplicationCommandOptionChoice,
} from "eris";
import { Tofu } from "@/core/tofu";
import { ErisChatInputApplicationCommandOptions } from "@/utils/eris";

export interface TofuCommandReply {
    message: string | InteractionContent;
    file?: FileContent | FileContent[];
}

export type TofuCommandAutocomplete = (
    tofu: Tofu,
    interaction: AutocompleteInteraction,
) => Promise<ApplicationCommandOptionChoice[] | undefined>;

export type TofuCommandInvoke = (
    tofu: Tofu,
    interaction: CommandInteraction,
) => Promise<TofuCommandReply | undefined>;

export interface TofuCommand {
    config: Omit<ErisChatInputApplicationCommandOptions, "type">;
    autocomplete?: TofuCommandAutocomplete;
    invoke: TofuCommandInvoke;
}
