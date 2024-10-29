import { TofuEvent } from "@/core/event";

export const voiceChannelJoinEvent: TofuEvent<"voiceChannelJoin"> = {
    config: {
        name: "voiceChannelJoin",
        type: "on",
    },
    action: async (tofu, member, newChannel) => {
        if (member.bot || tofu.filteredGuilds.isBlacklisted(member.guild.id)) {
            return;
        }
        const connection = tofu.music.getConnection(newChannel.guild.id);
        if (connection && connection.voiceChannelId === newChannel.id) {
            connection.removeScheduledLeaveTimeout();
        }
    },
};
