import { TofuCommand } from "@/core/command";
import { ErisUtils } from "@/utils/eris";

export const clearCommand: TofuCommand = {
    config: {
        name: "clear",
        description: "Clears the song queue.",
    },
    invoke: async (tofu, interaction) => {
        const guildID = interaction.guildID!;
        const connection = tofu.music.getConnection(guildID);
        if (!connection) {
            return {
                message: ErisUtils.robotMessage("Nothing is being played."),
            };
        }
        const voiceChannelId = interaction.member?.voiceState?.channelID;
        if (connection.voiceChannelId !== voiceChannelId) {
            return {
                message: ErisUtils.failureMessage(
                    `You must be in <#${connection.voiceChannelId}> to use this command.`,
                ),
            };
        }
        connection.clearQueue();
        return {
            message: ErisUtils.successMessage("Song queue cleared."),
        };
    },
};
