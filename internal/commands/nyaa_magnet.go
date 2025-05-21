package commands

import (
	"fmt"
	"log/slog"
	"strings"

	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/events"
	"me.zyrouge.tofu/internal/core"
	"me.zyrouge.tofu/internal/utils"
	"me.zyrouge.tofu/internal/utils/nyaa"
)

func NewTofuNyaaMagnetCommand() core.TofuCommand {
	return core.TofuCommand{
		Config: discord.SlashCommandCreate{
			Name:        "nyaa-magnet",
			Description: "Fetches magnet link from Nyaa.si.",
			Contexts: []discord.InteractionContextType{
				discord.InteractionContextTypeGuild,
			},
			Options: []discord.ApplicationCommandOption{
				discord.ApplicationCommandOptionString{
					Name:        "id",
					Description: "Nyaa ID.",
					Required:    true,
				},
			},
		},
		Invoke: func(tofu *core.Tofu, event *events.ApplicationCommandInteractionCreate) discord.InteractionResponseData {
			data := event.SlashCommandInteractionData()
			id := strings.TrimSpace(data.String("id"))
			if id == "" {
				return discord.NewMessageCreateBuilder().
					SetContent(utils.FailureMessage("You did not provide a value for `id`.")).
					Build()
			}
			result, err := nyaa.NyaaMagnet(id)
			if err != nil {
				slog.Error("nyaa magnet fetch failed: " + err.Error())
				return discord.NewMessageCreateBuilder().
					SetContent(utils.FailureMessage("Nyaa magnet fetch failed unknowingly.")).
					Build()
			}
			embed := discord.NewEmbedBuilder().
				SetAuthor(result.Title, result.Url, nyaa.NyaaFaviconUrl).
				SetColor(utils.ColorNyaaBlue).
				AddField(
					fmt.Sprintf("%s Magent", utils.EmojiMagnet),
					fmt.Sprintf("```%s```", result.Magnet),
					false,
				)
			return discord.NewMessageCreateBuilder().
				SetEmbeds(embed.Build()).
				Build()
		},
	}
}
