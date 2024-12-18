package core

import (
	"errors"

	"github.com/disgoorg/snowflake/v2"
)

type TofuFilteredGuildsMode string

const (
	TofuFilteredGuildsModeBlacklisted TofuFilteredGuildsMode = "blacklisted"
	TofuFilteredGuildsModeWhitelisted TofuFilteredGuildsMode = "whitelisted"
)

type TofuFilteredGuilds struct {
	Mode           TofuFilteredGuildsMode
	BlacklistedIds map[string]bool
	WhitelistedIds map[string]bool
}

func NewTofuFilteredGuilds(mode TofuFilteredGuildsMode, ids []string) (*TofuFilteredGuilds, error) {
	if mode != TofuFilteredGuildsModeBlacklisted && mode != TofuFilteredGuildsModeWhitelisted {
		return nil, errors.New("invalid mode: " + string(mode))
	}
	filteredGuilds := TofuFilteredGuilds{
		Mode:           mode,
		BlacklistedIds: map[string]bool{},
		WhitelistedIds: map[string]bool{},
	}
	switch mode {
	case TofuFilteredGuildsModeBlacklisted:
		for _, x := range ids {
			filteredGuilds.BlacklistedIds[x] = true
		}

	case TofuFilteredGuildsModeWhitelisted:
		for _, x := range ids {
			filteredGuilds.WhitelistedIds[x] = true
		}
	}
	return &filteredGuilds, nil
}

func (fg *TofuFilteredGuilds) IsWhitelisted(guildId *snowflake.ID) bool {
	switch fg.Mode {
	case TofuFilteredGuildsModeBlacklisted:
		_, contains := fg.BlacklistedIds[guildId.String()]
		return !contains

	case TofuFilteredGuildsModeWhitelisted:
		_, contains := fg.WhitelistedIds[guildId.String()]
		return contains

	default:
		return false
	}
}
