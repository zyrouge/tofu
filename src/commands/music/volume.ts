import { Constants } from "eris";
import { TofuCommand } from "@/core/command";
import { ErisUtils } from "@/utils/eris";
import { emojis } from "@/utils/emojis";

export const volumeCommand: TofuCommand = {
    config: {
        name: "volume",
        description: "View or set volume.",
        options: [
            {
                name: "volume",
                description: "Amount.",
                type: Constants.ApplicationCommandOptionTypes.NUMBER,
            },
        ],
    },
    invoke: async (tofu, interaction) => {
        const guildID = interaction.guildID!;
        const nVolume = ErisUtils.getCommandInteractionNumberOptionValue(
            interaction,
            "volume"
        );
        const connection = tofu.music.getConnection(guildID);
        if (!connection) {
            return {
                message: ErisUtils.robotMessage("Nothing is being played."),
            };
        }
        if (typeof nVolume === "undefined") {
            return {
                message: ErisUtils.prettyMessage(
                    volumeToEmoji(connection.volume),
                    `Volume is set to **${connection.volume}**.`
                ),
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
        connection.setVolume(nVolume);
        return {
            message: ErisUtils.prettyMessage(
                volumeToEmoji(connection.volume),
                `Volume set to **${connection.volume}**.`
            ),
        };
    },
};

const volumeToEmoji = (value: number) => {
    if (value === 0) return emojis.speakerMute;
    if (value <= 50) return emojis.speakerLow;
    return emojis.speakerHigh;
};
