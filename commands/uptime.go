package commands

import (
	"fmt"
	"time"

	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/events"
	"me.zyrouge.tofu/core"
	"me.zyrouge.tofu/utils"
)

func NewTofuUptimeCommand() core.TofuCommand {
	return core.TofuCommand{
		Config: discord.SlashCommandCreate{
			Name:        "uptime",
			Description: "Check bot's uptime.",
			Contexts: []discord.InteractionContextType{
				discord.InteractionContextTypeGuild,
			},
		},
		Invoke: func(tofu *core.Tofu, event *events.ApplicationCommandInteractionCreate) discord.InteractionResponseData {
			uptime := getTofuUptimeString(tofu)
			return discord.NewMessageCreateBuilder().
				SetContent(utils.RobotMessage(fmt.Sprintf("I've been up and running for **%s**!", uptime))).
				Build()
		},
	}
}

func getTofuUptimeString(tofu *core.Tofu) string {
	return time.Since(tofu.StartedAt).Truncate(time.Second).String()
}
