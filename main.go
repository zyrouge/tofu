package main

import (
	"os"
	"path"

	"me.zyrouge.tofu/bot_events"
	"me.zyrouge.tofu/commands"
	"me.zyrouge.tofu/core"
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
		},
		Commands: []core.TofuCommand{
			commands.NewTofuPingCommand(),
			commands.NewTofuUptimeCommand(),
			commands.NewTofuNyaaCommand(),
			commands.NewTofuNyaaMagnetCommand(),
			commands.NewTofuAniListSearchCommand(),
		},
	}
	tofu, err := core.NewTofu(options)
	if err != nil {
		return err
	}
	return tofu.Start()
}
