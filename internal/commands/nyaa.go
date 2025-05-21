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

func NewTofuNyaaCommand() core.TofuCommand {
	return core.TofuCommand{
		Config: discord.SlashCommandCreate{
			Name:        "nyaa",
			Description: "Search Nyaa.si.",
			Contexts: []discord.InteractionContextType{
				discord.InteractionContextTypeGuild,
			},
			Options: []discord.ApplicationCommandOption{
				discord.ApplicationCommandOptionString{
					Name:        "terms",
					Description: "Search terms.",
					Required:    true,
				},
			},
		},
		Invoke: func(tofu *core.Tofu, event *events.ApplicationCommandInteractionCreate) discord.InteractionResponseData {
			data := event.SlashCommandInteractionData()
			terms := strings.TrimSpace(data.String("terms"))
			if terms == "" {
				return discord.NewMessageCreateBuilder().
					SetContent(utils.FailureMessage("You did not provide a value for `terms`.")).
					Build()
			}
			result, err := nyaa.NyaaSearch(terms)
			if err != nil {
				slog.Error("nyaa search failed: " + err.Error())
				return discord.NewMessageCreateBuilder().
					SetContent(utils.FailureMessage("Nyaa search failed unknowingly.")).
					Build()
			}
			if len(result.Items) == 0 {
				return discord.NewMessageCreateBuilder().
					SetContent(utils.FailureMessage("No results.")).
					Build()
			}
			embed := discord.NewEmbedBuilder().
				SetAuthor(fmt.Sprintf("Results for \"%s\"", terms), result.Url, nyaa.NyaaFaviconUrl).
				SetColor(utils.ColorNyaaBlue)
			i := 1
			count := min(10, len(result.Terms))
			for _, x := range result.Items[0:count] {
				name := fmt.Sprintf("%d. %s", i, x.Title)
				value := strings.Builder{}
				value.WriteString(
					fmt.Sprintf(
						"`%s %s` | [View](%s) | [Torrent](%s) | `%s %s`\n",
						utils.EmojiId,
						x.Id,
						x.Url,
						x.Torrent,
						utils.EmojiPushPin,
						x.Category,
					),
				)
				value.WriteString(
					fmt.Sprintf(
						"`%s %s` | `%s %s` | `%s %d (%d)` | `%s %d`",
						utils.EmojiPackage,
						x.Size,
						utils.EmojiCalendar,
						x.Date,
						utils.EmojiUpArrow,
						x.Seeders,
						x.Leechers,
						utils.EmojiDownArrow,
						x.Downloads,
					),
				)
				if i != count {
					value.WriteString("\n\u200b")
				}
				embed.AddField(name, value.String(), false)
				i++
			}
			return discord.NewMessageCreateBuilder().
				SetEmbeds(embed.Build()).
				Build()
		},
	}
}
