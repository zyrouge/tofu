import { TofuEvent } from "@/core/event";

export const voiceChannelJoinEvent: TofuEvent<"voiceChannelJoin"> = {
    config: {
        name: "voiceChannelJoin",
        type: "on",
    },
    action: async (tofu, member, newChannel) => {
        if (member.bot) return;
        const connection = tofu.music.getConnection(newChannel.guild.id);
        if (connection && connection.voiceChannelId === newChannel.id) {
            connection.removeScheduledLeaveTimeout();
        }
    },
};
