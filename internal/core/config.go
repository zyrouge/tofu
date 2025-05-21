package core

import (
	"encoding/json"
	"fmt"
	"os"
)

type TofuHttpServerConfig struct {
	Host string `json:"host"`
	Port int    `json:"port"`
}

type TofuDiscordStatusConfig struct {
	Status       *string `json:"status"`
	ActivityType string  `json:"activityType"`
	ActivityName string  `json:"activityName"`
}

type TofuFilteredGuildsConfig struct {
	Mode string   `json:"mode"`
	Ids  []string `json:"ids"`
}

type TofuConfig struct {
	DiscordToken     string                    `json:"discordToken"`
	PriviledgedUsers []string                  `json:"priviledgedUsers"`
	HttpServer       *TofuHttpServerConfig     `json:"httpServer"`
	DiscordStatus    *TofuDiscordStatusConfig  `json:"discordStatus"`
	FilteredGuilds   *TofuFilteredGuildsConfig `json:"filteredGuilds"`
}

func ParseTofuConfigFile(file string) (*TofuConfig, error) {
	bytes, err := os.ReadFile(file)
	if err != nil {
		return nil, fmt.Errorf("reading config file failed: %w", err)
	}
	var config TofuConfig
	if err = json.Unmarshal(bytes, &config); err != nil {
		return nil, fmt.Errorf("parsing config file failed: %w", err)
	}
	return &config, nil
}
