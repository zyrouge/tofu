FROM golang:1.23-alpine as build

WORKDIR /usr/app

COPY go.mod go.sum ./
RUN go mod download

COPY main.go .
COPY internal internal
RUN go build -o ./dist/tofu .

FROM alpine

WORKDIR /usr/app

COPY --from=build /usr/app/dist/tofu tofu
CMD ["./tofu"]
