import { TofuCommand } from "@/core/command";
import { emojis } from "@/utils/emojis";
import { ErisUtils } from "@/utils/eris";

export const skipCommand: TofuCommand = {
    config: {
        name: "skip",
        description: "Skip current song.",
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
        await connection.jump(connection.nextSongIndex());
        return {
            message: ErisUtils.prettyMessage(emojis.nextTrack, "Skipped."),
        };
    },
};
