package commands

import (
	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/events"
	"me.zyrouge.tofu/core"
	"me.zyrouge.tofu/utils"
)

func NewTofuPingCommand() core.TofuCommand {
	return core.TofuCommand{
		Config: discord.SlashCommandCreate{
			Name:        "ping",
			Description: "Ping, pong!",
			Contexts: []discord.InteractionContextType{
				discord.InteractionContextTypeGuild,
			},
		},
		Invoke: func(tofu *core.Tofu, event *events.ApplicationCommandInteractionCreate) discord.InteractionResponseData {
			return discord.NewMessageCreateBuilder().
				SetContent(utils.PrettyMessage(utils.EmojiPingPong, "Pong!")).
				Build()
		},
	}
}
