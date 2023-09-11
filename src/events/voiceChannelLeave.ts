import { TofuEvent } from "@/core/event";

export const voiceChannelLeaveEvent: TofuEvent<"voiceChannelLeave"> = {
    config: {
        name: "voiceChannelLeave",
        type: "on",
    },
    action: async (tofu, _, oldChannel) => {
        const connection = tofu.music.getConnection(oldChannel.guild.id);
        if (
            connection &&
            connection.voiceChannelId === oldChannel.id &&
            connection.isVoiceChannelEmpty()
        ) {
            connection.scheduleLeave();
        }
    },
};
