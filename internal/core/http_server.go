package core

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
)

type TofuHttpServer struct {
	Host     string
	Port     int
	Active   bool
	ServeMux *http.ServeMux
	Server   *http.Server
}

func NewTofuHttpServer(host string, port int) *TofuHttpServer {
	mux := http.NewServeMux()
	server := &http.Server{
		Addr:    fmt.Sprintf("%s:%d", host, port),
		Handler: mux,
	}
	mux.HandleFunc("GET /ping", func(w http.ResponseWriter, r *http.Request) {
		io.WriteString(w, "Pong!")
	})
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusTeapot)
		io.WriteString(w, "I'm a teapot!")
	})
	return &TofuHttpServer{
		Host:     host,
		Port:     port,
		ServeMux: mux,
		Server:   server,
	}
}

func (server *TofuHttpServer) Start() {
	go func() {
		server.Active = true
		slog.Info("starting http server in http://" + server.Server.Addr)
		err := server.Server.ListenAndServe()
		server.Active = false
		if !errors.Is(err, http.ErrServerClosed) {
			slog.Error("http server failed: " + err.Error())
		}
	}()
}

func (server *TofuHttpServer) Stop() {
	server.Active = false
	server.Server.Shutdown(context.TODO())
}
