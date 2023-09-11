import { TofuEvent } from "@/core/event";

export const voiceChannelSwitchEvent: TofuEvent<"voiceChannelSwitch"> = {
    config: {
        name: "voiceChannelSwitch",
        type: "on",
    },
    action: async (tofu, member, newChannel, oldChannel) => {
        if (member.id === tofu.bot.user.id) {
            const connection = tofu.music.getConnection(newChannel.guild.id);
            if (connection) {
                connection.voiceChannelId = newChannel.id;
            }
        }
        if (member.bot) return;
        const connection = tofu.music.getConnection(member.guild.id);
        if (!connection) return;
        if (oldChannel.id === connection.voiceChannelId) {
            connection.scheduleLeave();
        } else if (newChannel.id === connection.voiceChannelId) {
            connection.removeScheduledLeaveTimeout();
        }
    },
};
