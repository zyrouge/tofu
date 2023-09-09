import { ClientEvents } from "eris";
import { Miso } from "@/core/miso";

export type MisoEventAction<Event extends keyof ClientEvents> = (
    miso: Miso,
    ...args: ClientEvents[Event]
) => Promise<void>;

export interface MisoEvent<Event extends keyof ClientEvents> {
    config: {
        name: Event;
        type: "on" | "once";
    };
    action: MisoEventAction<Event>;
}
