import { TofuEvent } from "@/core/event";

export const voiceChannelLeaveEvent: TofuEvent<"voiceChannelLeave"> = {
    config: {
        name: "voiceChannelLeave",
        type: "on",
    },
    action: async (tofu, member, oldChannel) => {
        if (tofu.filteredGuilds.isBlacklisted(member.guild.id)) {
            return;
        }
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
