package bot_events

import (
	"context"

	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/events"
	"github.com/disgoorg/disgo/gateway"
	"me.zyrouge.tofu/core"
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
		activityType := activityNameTypes[tofu.Config.DiscordStatus.Type]
		tofu.Bot.SetPresence(
			context.TODO(),
			func(presenceUpdate *gateway.MessageDataPresenceUpdate) {
				activity := discord.Activity{
					Name: tofu.Config.DiscordStatus.Activity,
					Type: activityType,
				}
				presenceUpdate.Activities = []discord.Activity{activity}
			},
		)
	})
}
