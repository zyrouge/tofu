package main

import (
	"errors"
	"os"
	"path"

	"me.zyrouge.tofu/bot_events"
	"me.zyrouge.tofu/commands"
	"me.zyrouge.tofu/core"
)

// func main() {
// }

func main() {
	if err := start(); err != nil {
		panic(err)
	}
}

func start() error {
	if len(os.Args) < 2 {
		return errors.New("missing config file argument")
	}
	cwd, err := os.Getwd()
	if err != nil {
		return err
	}
	configFile := path.Join(cwd, os.Args[1])
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
			commands.NewTofuNyaaSearchCommand(),
			commands.NewTofuNyaaMagnetCommand(),
		},
	}
	tofu, err := core.NewTofu(options)
	if err != nil {
		return err
	}
	return tofu.Start()
}
