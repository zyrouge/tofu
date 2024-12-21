package commands

import (
	"fmt"
	"log/slog"
	"strconv"
	"strings"

	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/events"
	"me.zyrouge.tofu/core"
	"me.zyrouge.tofu/utils"
	"me.zyrouge.tofu/utils/anilist"
)

func NewTofuAniListSearchCommand() core.TofuCommand {
	mediaTypeChoice := []discord.AutocompleteChoice{
		discord.AutocompleteChoiceString{
			Name:  "Anime",
			Value: "Anime",
		},
		discord.AutocompleteChoiceString{
			Name:  "Manga",
			Value: "Manga",
		},
	}
	return core.TofuCommand{
		Config: discord.SlashCommandCreate{
			Name:        "anilist",
			Description: "Browse AniList.co.",
			Contexts: []discord.InteractionContextType{
				discord.InteractionContextTypeGuild,
			},
			Options: []discord.ApplicationCommandOption{
				discord.ApplicationCommandOptionString{
					Name:         "type",
					Description:  "Media type.",
					Required:     true,
					Autocomplete: true,
				},
				discord.ApplicationCommandOptionString{
					Name:         "terms",
					Description:  "Search terms.",
					Required:     true,
					Autocomplete: true,
				},
				discord.ApplicationCommandOptionBool{
					Name:        "adult",
					Description: "Filter adult only.",
					Required:    false,
				},
			},
		},
		Autocomplete: func(tofu *core.Tofu, event *events.AutocompleteInteractionCreate) discord.AutocompleteResult {
			focused := event.Data.Focused()
			if focused.Name == "type" {
				return discord.AutocompleteResult{
					Choices: mediaTypeChoice,
				}
			}
			if focused.Name == "terms" {
				terms := strings.TrimSpace(event.Data.String("terms"))
				mediaType := strings.ToUpper(strings.TrimSpace(event.Data.String("type")))
				if terms == "" || (mediaType != "ANIME" && mediaType != "MANGA") {
					return discord.AutocompleteResult{}
				}
				isAdult := event.Data.Bool("adult")
				results, err := anilist.AniListSearch(anilist.AniListSearchVariables{
					Terms:   terms,
					Type:    mediaType,
					IsAdult: isAdult,
					Page:    1,
					PerPage: 10,
				})
				if err != nil {
					slog.Error("anilist search failed: " + err.Error())
					return discord.AutocompleteResult{}
				}
				choices := []discord.AutocompleteChoice{}
				for _, x := range results.Page.Media {
					name := ""
					if x.Title.English != nil {
						name += *x.Title.English + " / "
					}
					if x.Title.Romaji != nil {
						name += *x.Title.Romaji + " / "
					}
					name += x.Title.Native
					choices = append(choices, discord.AutocompleteChoiceString{
						Name:  utils.OverflowEllipsisText(name, 100),
						Value: x.SiteUrl,
					})
				}
				return discord.AutocompleteResult{
					Choices: choices,
				}
			}
			return discord.AutocompleteResult{}
		},
		Invoke: func(tofu *core.Tofu, event *events.ApplicationCommandInteractionCreate) discord.InteractionResponseData {
			data := event.SlashCommandInteractionData()
			url := strings.TrimSpace(data.String("terms"))
			if url == "" {
				return discord.NewMessageCreateBuilder().
					SetContent(utils.FailureMessage("You did not provide a valid url for `terms`.")).
					Build()
			}
			id, err := anilist.AniListParseIdFromSiteUrl(url)
			if err != nil {
				return discord.NewMessageCreateBuilder().
					SetContent(utils.FailureMessage("Invalid `url`.")).
					Build()
			}
			result, err := anilist.AniListMedia(anilist.AniListMediaVariables{
				Id: id,
			})
			if err != nil {
				slog.Error("anilist media query failed: " + err.Error())
				return discord.NewMessageCreateBuilder().
					SetContent(utils.FailureMessage("AniList search failed unknowingly.")).
					Build()
			}
			title := ""
			titleEnglish := "?"
			titleRomaji := "?"
			if result.Media.Title.English != nil {
				titleEnglish = *result.Media.Title.English
				if title == "" {
					title = titleEnglish
				}
			}
			if result.Media.Title.Romaji != nil {
				titleRomaji = *result.Media.Title.Romaji
				if title == "" {
					title = titleRomaji
				}
			}
			if title == "" {
				title = result.Media.Title.Native
			}
			if result.Media.IsAdult {
				title += fmt.Sprintf(" (%s)", utils.EmojiNsfw)
			}
			embed := discord.NewEmbedBuilder().
				SetAuthor(title, result.Media.SiteUrl, anilist.AniListfaviconUrl).
				SetColor(utils.ColorAniListBlue)
			if result.Media.CoverImage.Large != nil {
				embed.SetThumbnail(*result.Media.CoverImage.Large)
			}
			if result.Media.BannerImage != nil {
				embed.SetImage(*result.Media.BannerImage)
			}
			embed.AddField(
				"Title",
				fmt.Sprintf("`EN` %s\n`RO` %s\n`JP` %s", titleEnglish, titleRomaji, result.Media.Title.Native),
				false,
			)
			if result.Media.Description != nil {
				embed.AddField("Description", utils.ConvertHTMLToMessage(*result.Media.Description), false)
			}
			embed.AddField(
				"Type",
				fmt.Sprintf("%s (%s)", utils.NormalizeWord(result.Media.Type), prettyMediaFormat(result.Media.Format)),
				false,
			)
			embed.AddField("Status", utils.NormalizeWord(result.Media.Status), false)
			embed.AddField(
				"Start & End Date",
				fmt.Sprintf("%s to %s", stringifyMediaDate(result.Media.StartDate), stringifyMediaDate(result.Media.EndDate)),
				false,
			)
			embed.AddField("Average Score", prettyNumberMetric(result.Media.AverageScore, "%"), false)
			if result.Media.Episodes != nil {
				embed.AddField(
					"Episodes",
					fmt.Sprintf("%d (%s mins.)", *result.Media.Episodes, prettyNumberMetric(result.Media.Duration, "")),
					false,
				)
			}
			if result.Media.Volumes != nil {
				embed.AddField("Volumes", prettyNumberMetric(result.Media.Volumes, ""), false)
			}
			if result.Media.Chapters != nil {
				embed.AddField("Chapters", prettyNumberMetric(result.Media.Chapters, ""), false)
			}
			embed.AddField("Genres", strings.Join(result.Media.Genres, ", "), false)
			return discord.NewMessageCreateBuilder().
				SetEmbeds(embed.Build()).
				Build()
		},
	}
}

func prettyNumberMetric(value *int, unit string) string {
	if value == nil {
		return "?"
	}
	return strconv.Itoa(*value) + unit
}

var mediaPrettyFormats = map[string]string{
	"TV":       "TV",
	"TV_SHORT": "TV Short",
}

func prettyMediaFormat(value *string) string {
	if value == nil {
		return "?"
	}
	pretty := mediaPrettyFormats[*value]
	if pretty == "" {
		return *value
	}
	return pretty
}

func stringifyMediaDate(date anilist.AniListMediaResultMediaDate) string {
	if date.Day == nil && date.Month == nil && date.Year == nil {
		return "?"
	}
	return fmt.Sprintf(
		"%s-%s-%s",
		stringifyMediaDateNumber(date.Day),
		stringifyMediaDateNumber(date.Month),
		stringifyMediaDateNumber(date.Year),
	)
}

func stringifyMediaDateNumber(value *int) string {
	if value == nil {
		return "?"
	}
	return strconv.Itoa(*value)
}
