import { Constants } from "eris";
import { TofuCommand } from "@/core/command";
import { ErisUtils } from "@/utils/eris";

export const dequeueCommand: TofuCommand = {
    config: {
        name: "dequeue",
        description: "Dequeue song at position.",
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
            "position"
        );
        if (!position) {
            return {
                message: ErisUtils.failureMessage(
                    "You did not provide a value for `position`."
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
                    `You must be in <#${connection.voiceChannelId}> to use this command.`
                ),
            };
        }
        const index = position - 1;
        if (!connection.hasSongAt(index)) {
            return {
                message: ErisUtils.failureMessage(
                    `No song is queued at position **${position}**.`
                ),
            };
        }
        const song = await connection.remove(index);
        if (!song) {
            return {
                message: ErisUtils.failureMessage("No songs were dequeued."),
            };
        }
        return {
            message: ErisUtils.successMessage(
                `Dequeued [**${song.metadata.title}**](${song.metadata.url}).`
            ),
        };
    },
};
