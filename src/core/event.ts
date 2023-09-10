import { ClientEvents } from "eris";
import { Tofu } from "@/core/tofu";

export type TofuEventAction<Event extends keyof ClientEvents> = (
    tofu: Tofu,
    ...args: ClientEvents[Event]
) => Promise<void>;

export interface TofuEvent<Event extends keyof ClientEvents> {
    config: {
        name: Event;
        type: "on" | "once";
    };
    action: TofuEventAction<Event>;
}
