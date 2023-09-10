import { TofuCommand } from "@/core/command";
import { ErisUtils } from "@/utils/eris";

export const pauseCommand: TofuCommand = {
    config: {
        name: "pause",
        description: "Pauses music playback.",
    },
    invoke: async (tofu, interaction) => {
        const guildID = interaction.guildID!;
        const connection = tofu.music.getConnection(guildID);
        if (!connection) {
            return {
                message: ErisUtils.robotMessage(`Nothing is being played.`),
            };
        }
        const paused = connection.pause();
        if (!paused) {
            return {
                message: ErisUtils.robotMessage(
                    `Music playback is already paused.`
                ),
            };
        }
        return {
            message: ErisUtils.successMessage(`Music playback paused.`),
        };
    },
};
