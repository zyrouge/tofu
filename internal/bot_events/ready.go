package bot_events

import (
	"context"
	"log/slog"

	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/events"
	"github.com/disgoorg/disgo/gateway"
	"me.zyrouge.tofu/internal/core"
)

func NewTofuReadyEvent() core.TofuEvent {
	activityNameTypes := map[string]discord.ActivityType{
		"competing": discord.ActivityTypeCompeting,
		"game":      discord.ActivityTypeGame,
		"listening": discord.ActivityTypeListening,
		"streaming": discord.ActivityTypeStreaming,
		"watching":  discord.ActivityTypeWatching,
	}
	return core.NewTofuEvent(func(tofu *core.Tofu, event *events.Ready) {
		if tofu.Config.DiscordStatus == nil {
			return
		}
		err := tofu.Bot.SetPresence(
			context.TODO(),
			func(presenceUpdate *gateway.MessageDataPresenceUpdate) {
				if tofu.Config.DiscordStatus.Status != nil {
					presenceUpdate.Status = discord.OnlineStatus(*tofu.Config.DiscordStatus.Status)
				}
				activity := discord.Activity{
					Name: tofu.Config.DiscordStatus.ActivityName,
					Type: activityNameTypes[tofu.Config.DiscordStatus.ActivityType],
				}
				presenceUpdate.Activities = []discord.Activity{activity}
			},
		)
		if err != nil {
			slog.Error("updating bot presence failed: " + err.Error())
		}
	})
}
