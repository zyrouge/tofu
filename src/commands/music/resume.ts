import { TofuCommand } from "@/core/command";
import { ErisUtils } from "@/utils/eris";

export const resumeCommand: TofuCommand = {
    config: {
        name: "resume",
        description: "Resumes music playback.",
    },
    invoke: async (tofu, interaction) => {
        const guildID = interaction.guildID!;
        const connection = tofu.music.getConnection(guildID);
        if (!connection) {
            return {
                message: ErisUtils.robotMessage(`Nothing is being played.`),
            };
        }
        const resumed = connection.resume();
        if (!resumed) {
            return {
                message: ErisUtils.robotMessage(
                    `Music playback is already resumed.`
                ),
            };
        }
        return {
            message: ErisUtils.successMessage(`Music playback resumed.`),
        };
    },
};
