package anilist

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"regexp"
	"strconv"

	"me.zyrouge.tofu/internal/utils"
)

const AniListApiUrl = "https://graphql.anilist.co"
const AniListfaviconUrl = "https://anilist.co/img/icons/favicon-32x32.png"

type AniListQueryBody[V any] struct {
	Query     string `json:"query"`
	Variables V      `json:"variables"`
}

type AniListQueryResponseBody[R any] struct {
	Data R `json:"data"`
}

func AniListQuery[V any, R any](body AniListQueryBody[V]) (*R, error) {
	reqBodyBytes, err := json.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("unable to stringify body: %w", err)
	}
	reqBody := bytes.NewReader([]byte(reqBodyBytes))
	req, err := http.NewRequest(http.MethodPost, AniListApiUrl, reqBody)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	resp, err := utils.TofuHttpClient.Do(req)
	if err != nil {
		return nil, err
	}
	respBodyDecoder := json.NewDecoder(resp.Body)
	var respBody AniListQueryResponseBody[R]
	err = respBodyDecoder.Decode(&respBody)
	if err != nil {
		return nil, err
	}
	return &respBody.Data, err
}

var idRegex = regexp.MustCompile(`https:\/\/anilist\.co\/\w+\/(\d+)`)

func AniListParseIdFromSiteUrl(siteUrl string) (int, error) {
	id := idRegex.FindStringSubmatch(siteUrl)
	if id == nil || len(id) < 1 {
		return 0, errors.New("invalid url")
	}
	return strconv.Atoi(id[1])
}
