package core

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/disgoorg/disgo"
	"github.com/disgoorg/disgo/bot"
	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/gateway"
)

type Tofu struct {
	Bot            bot.Client
	Config         TofuConfig
	StartedAt      time.Time
	FilteredGuilds TofuFilteredGuilds
	HttpServer     *TofuHttpServer
	Commands       map[string]TofuCommand
}

type TofuOptions struct {
	Config   TofuConfig
	Events   []TofuEvent
	Commands []TofuCommand
}

func NewTofu(options TofuOptions) (*Tofu, error) {
	client, err := disgo.New(
		options.Config.DiscordToken,
		bot.WithGatewayConfigOpts(gateway.WithIntents(gateway.IntentGuilds)),
	)
	if err != nil {
		return nil, fmt.Errorf("creating bot client failed: %w", err)
	}
	filteredGuilds, err := NewTofuFilteredGuilds(
		TofuFilteredGuildsMode(options.Config.FilteredGuilds.Mode),
		options.Config.FilteredGuilds.Ids,
	)
	if err != nil {
		return nil, fmt.Errorf("creating filtered guilds failed: %w", err)
	}
	var httpServer *TofuHttpServer = nil
	if options.Config.HttpServer != nil {
		httpServer = NewTofuHttpServer(options.Config.HttpServer.Host, options.Config.HttpServer.Port)
	}
	tofu := Tofu{
		Bot:            client,
		Config:         options.Config,
		StartedAt:      time.Now(),
		FilteredGuilds: *filteredGuilds,
		HttpServer:     httpServer,
		Commands:       map[string]TofuCommand{},
	}
	for _, x := range options.Events {
		event := bot.NewListenerFunc(func(event bot.Event) {
			x.Action.OnEvent(&tofu, event)
		})
		client.AddEventListeners(event)
	}
	for _, x := range options.Commands {
		tofu.Commands[x.Config.CommandName()] = x
	}
	return &tofu, nil
}

func (tofu *Tofu) registerCommands() error {
	commands := []discord.ApplicationCommandCreate{}
	for _, x := range tofu.Commands {
		commands = append(commands, x.Config)
	}
	_, err := tofu.Bot.Rest().SetGlobalCommands(tofu.Bot.ApplicationID(), commands)
	return err
}

func (tofu *Tofu) Start() error {
	if tofu.HttpServer != nil {
		tofu.HttpServer.Start()
	}
	if err := tofu.Bot.OpenGateway(context.TODO()); err != nil {
		return fmt.Errorf("opening gateway failed: %w", err)
	}
	application, err := tofu.Bot.Rest().GetBotApplicationInfo()
	if err != nil {
		return fmt.Errorf("getting bot application failed: %w", err)
	}
	slog.Info(fmt.Sprintf("bot logged in as %s (%s)", application.Bot.Tag(), application.Bot.ID))
	if err := tofu.registerCommands(); err != nil {
		return fmt.Errorf("registering commands failed: %w", err)
	}
	s := make(chan os.Signal, 1)
	signal.Notify(s, syscall.SIGINT, syscall.SIGTERM)
	<-s
	tofu.Stop()
	return nil
}

func (tofu *Tofu) Stop() {
	if tofu.HttpServer != nil {
		tofu.HttpServer.Stop()
	}
	tofu.Bot.Close(context.TODO())
}
