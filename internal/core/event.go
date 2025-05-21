package core

import (
	"github.com/disgoorg/disgo/bot"
)

type TofuEventAction interface {
	OnEvent(tofu *Tofu, event bot.Event)
}

type TofuEvent struct {
	Action TofuEventAction
}

type tofuEvent[E bot.Event] struct {
	action func(tofu *Tofu, event E)
}

func (l *tofuEvent[E]) OnEvent(tofu *Tofu, e bot.Event) {
	if event, ok := e.(E); ok {
		l.action(tofu, event)
	}
}

func NewTofuEvent[E bot.Event](action func(tofu *Tofu, event E)) TofuEvent {
	return TofuEvent{
		Action: &tofuEvent[E]{action},
	}
}
