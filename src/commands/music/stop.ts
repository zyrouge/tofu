import { TofuCommand } from "@/core/command";
import { ErisUtils } from "@/utils/eris";

export const stopCommand: TofuCommand = {
    config: {
        name: "stop",
        description: "Stops music playback.",
    },
    invoke: async (tofu, interaction) => {
        const guildID = interaction.guildID!;
        const connection = tofu.music.getConnection(guildID);
        if (!connection) {
            return {
                message: ErisUtils.robotMessage(`Nothing is being played.`),
            };
        }
        connection.destroy();
        return {
            message: ErisUtils.successMessage(`Music playback stopped.`),
        };
    },
};
