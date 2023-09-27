import { TofuCommand } from "@/core/command";
import { emojis } from "@/utils/emojis";
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
        const resumed = await connection.resume();
        if (!resumed) {
            return {
                message: ErisUtils.robotMessage(
                    "Music playback is already resumed.",
                ),
            };
        }
        return {
            message: ErisUtils.prettyMessage(
                emojis.play,
                "Music playback resumed.",
            ),
        };
    },
};
