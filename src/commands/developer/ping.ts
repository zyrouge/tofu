import { MisoCommand } from "@/core/command";

export const pingCommand: MisoCommand = {
    config: {
        name: "ping",
        description: "Ping pong!",
    },
    action: async (_, __) => {
        return { message: "🏓 Pong!" };
    },
};
