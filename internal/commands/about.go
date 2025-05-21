package commands

import (
	"fmt"

	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/events"
	"me.zyrouge.tofu/internal/core"
	"me.zyrouge.tofu/internal/utils"
)

func NewTofuAboutCommand() core.TofuCommand {
	return core.TofuCommand{
		Config: discord.SlashCommandCreate{
			Name:        "about",
			Description: fmt.Sprintf("About %s.", utils.ProjectName),
			Contexts: []discord.InteractionContextType{
				discord.InteractionContextTypeGuild,
			},
		},
		Invoke: func(tofu *core.Tofu, event *events.ApplicationCommandInteractionCreate) discord.InteractionResponseData {
			uptime := getTofuUptimeString(tofu)
			embed := discord.NewEmbedBuilder().
				SetAuthor(utils.ProjectName, utils.ProjectGithubUrl, utils.ProjectLogoUrl).
				SetColor(utils.ColorOrange500).
				SetDescription(utils.ProjectDescription).
				SetImage(utils.ProjectBannerUrl).
				SetFooter(fmt.Sprintf("Made by %s", utils.ProjectAuthor), utils.AuthorLogoUrl).
				AddField(
					"Technical information",
					fmt.Sprintf("Uptime: **%s**", uptime),
					false,
				).
				AddField(
					"More information",
					fmt.Sprintf(
						"%s's GitHub: **%s**\nRepository: **%s**\nLicense: **%s**",
						utils.ProjectAuthor,
						utils.AuthorGithubUrl,
						utils.ProjectGithubUrl,
						utils.ProjectLicense,
					),
					false,
				)
			return discord.NewMessageCreateBuilder().
				SetEmbeds(embed.Build()).
				Build()
		},
	}
}
