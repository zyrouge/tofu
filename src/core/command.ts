import {
    ChatInputApplicationCommandStructure,
    CommandInteraction,
    InteractionContent,
    FileContent,
} from "eris";
import { Miso } from "@/core/miso";

export interface MisoCommandActionReply {
    message: string | InteractionContent;
    file?: FileContent | FileContent[];
}

export type MisoCommandAction = (
    miso: Miso,
    interaction: CommandInteraction
) => Promise<MisoCommandActionReply | void>;

export interface MisoCommand {
    config: Omit<ChatInputApplicationCommandStructure, "type">;
    action: MisoCommandAction;
}
