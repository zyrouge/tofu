import { ApplicationCommandOptionChoice, Constants } from "eris";
import { TofuCommand } from "@/core/command";
import { ErisUtils } from "@/utils/eris";
import { emojis } from "@/utils/emojis";
import { TofuLoop } from "@/core/modules/music";
import { StringUtils } from "@/utils/string";

const loopModeValuesAutocomplete: ApplicationCommandOptionChoice[] = (
    Object.keys(TofuLoop) as TofuLoop[]
).map((x) => ({
    name: StringUtils.capitalizeWord(x),
    value: x,
}));

export const loopCommand: TofuCommand = {
    config: {
        name: "loop",
        description: "View or set loop mode.",
        options: [
            {
                name: "mode",
                description: "Loop mode.",
                type: Constants.ApplicationCommandOptionTypes.STRING,
                autocomplete: true,
            },
        ],
    },
    autocomplete: async (_, __) => loopModeValuesAutocomplete,
    invoke: async (tofu, interaction) => {
        const guildID = interaction.guildID!;
        const nMode = ErisUtils.getCommandInteractionStringOptionValue(
            interaction,
            "mode"
        )?.toLowerCase();
        const connection = tofu.music.getConnection(guildID);
        if (!connection) {
            return {
                message: ErisUtils.robotMessage("Nothing is being played."),
            };
        }
        if (typeof nMode === "undefined") {
            return {
                message: ErisUtils.prettyMessage(
                    loopToEmoji(connection.loop),
                    `Loop is set to **${connection.loop}**.`
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
        if (!(nMode in TofuLoop)) {
            return {
                message: ErisUtils.failureMessage("Invalid loop mode."),
            };
        }
        connection.setLoop(nMode as TofuLoop);
        return {
            message: ErisUtils.prettyMessage(
                loopToEmoji(connection.loop),
                `Loop set to **${connection.loop}**.`
            ),
        };
    },
};

const loopToEmoji = (mode: TofuLoop) => {
    switch (mode) {
        case TofuLoop.none:
            return emojis.play;

        case TofuLoop.queue:
            return emojis.repeat;

        case TofuLoop.track:
            return emojis.repeatSingle;
    }
};
