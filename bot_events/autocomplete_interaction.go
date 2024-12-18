package bot_events

import (
	"log/slog"

	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/events"
	"me.zyrouge.tofu/core"
)

func NewTofuAutocompleteInteractionEvent() core.TofuEvent {
	return core.NewTofuEvent(func(tofu *core.Tofu, event *events.AutocompleteInteractionCreate) {
		if !tofu.FilteredGuilds.IsWhitelisted(event.GuildID()) {
			return
		}
		if command, ok := tofu.Commands[event.Data.CommandName]; ok && command.Autocomplete != nil {
			response := (*command.Autocomplete)(tofu, event)
			if err := event.Respond(discord.InteractionResponseTypeCreateMessage, response); err != nil {
				slog.Error("autocomplete interaction event respond failed: " + err.Error())
			}
		}
	})
}
