package core

import (
	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/events"
)

type TofuCommandAutocomplete func(tofu *Tofu, event *events.AutocompleteInteractionCreate) discord.InteractionResponseData
type TofuCommandInvoke func(tofu *Tofu, event *events.ApplicationCommandInteractionCreate) discord.InteractionResponseData

type TofuCommand struct {
	Config       discord.SlashCommandCreate
	Autocomplete *TofuCommandAutocomplete
	Invoke       TofuCommandInvoke
}
