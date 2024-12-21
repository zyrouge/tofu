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
		if cmd, ok := tofu.Commands[event.Data.CommandName]; ok && cmd.Autocomplete != nil {
			resp := cmd.Autocomplete(tofu, event)
			if err := event.Respond(discord.InteractionResponseTypeAutocompleteResult, resp); err != nil {
				slog.Error("autocomplete interaction event respond failed: " + err.Error())
			}
		}
	})
}
