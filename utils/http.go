package utils

import (
	"net/http"
	"time"
)

var TofuHttpClient = http.Client{
	Timeout: 30 * time.Second,
}
