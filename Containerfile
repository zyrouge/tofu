FROM golang:1.23-alpine as build

WORKDIR /usr/app

COPY go.mod go.sum ./
RUN go mod download

COPY main.go .
COPY bot_events bot_events
COPY commands commands
COPY core core
COPY utils utils
RUN go build -o ./dist/tofu .

FROM alpine

WORKDIR /usr/app

COPY --from=build /usr/app/dist/tofu tofu
CMD ["./tofu"]
