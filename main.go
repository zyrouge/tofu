package main

import (
	"os"
	"path"

	"me.zyrouge.tofu/internal/bot_events"
	"me.zyrouge.tofu/internal/commands"
	"me.zyrouge.tofu/internal/core"
)

func main() {
	if err := start(); err != nil {
		panic(err)
	}
}

func start() error {
	cwd, err := os.Getwd()
	if err != nil {
		return err
	}
	configFile := path.Join(cwd, "config.json")
	if len(os.Args) >= 2 {
		configFile = path.Join(cwd, os.Args[1])
	}
	config, err := core.ParseTofuConfigFile(configFile)
	if err != nil {
		return err
	}
	options := core.TofuOptions{
		Config: *config,
		Events: []core.TofuEvent{
			bot_events.NewTofuApplicationCommandInteractionEvent(),
			bot_events.NewTofuAutocompleteInteractionEvent(),
			bot_events.NewTofuReadyEvent(),
		},
		Commands: []core.TofuCommand{
			commands.NewTofuPingCommand(),
			commands.NewTofuUptimeCommand(),
			commands.NewTofuNyaaCommand(),
			commands.NewTofuNyaaMagnetCommand(),
			commands.NewTofuAniListSearchCommand(),
			commands.NewTofuAboutCommand(),
		},
	}
	tofu, err := core.NewTofu(options)
	if err != nil {
		return err
	}
	return tofu.Start()
}
