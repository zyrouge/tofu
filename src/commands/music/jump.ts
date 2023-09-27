import { Constants } from "eris";
import { TofuCommand } from "@/core/command";
import { emojis } from "@/utils/emojis";
import { ErisUtils } from "@/utils/eris";

export const jumpCommand: TofuCommand = {
    config: {
        name: "jump",
        description: "Jump to song at specified index.",
        options: [
            {
                name: "position",
                description: "Song position in queue.",
                type: Constants.ApplicationCommandOptionTypes.NUMBER,
            },
        ],
    },
    invoke: async (tofu, interaction) => {
        const guildID = interaction.guildID!;
        const position = ErisUtils.getCommandInteractionNumberOptionValue(
            interaction,
            "position",
        );
        if (typeof position !== "number") {
            return {
                message: ErisUtils.failureMessage(
                    "You did not provide a value for `position`.",
                ),
            };
        }
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
        const index = position - 1;
        const canJump = connection.hasSongAt(index);
        if (!canJump) {
            return {
                message: ErisUtils.failureMessage(
                    `Cannot jump to song at position **${position}**.`,
                ),
            };
        }
        await connection.jump(index);
        return {
            message: ErisUtils.prettyMessage(
                emojis.nextTrack,
                `Jumped to song at position **${position}**.`,
            ),
        };
    },
};
