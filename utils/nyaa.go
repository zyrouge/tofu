package utils

import (
	"fmt"
	"net/http"
	"net/url"
	"regexp"
	"strconv"

	"github.com/PuerkitoBio/goquery"
)

type NyaaSearchItem struct {
	Id        string
	Category  string
	Title     string
	Url       string
	Torrent   string
	Magnet    string
	Size      string
	Date      string
	Seeders   int
	Leechers  int
	Downloads int
}

type NyaaSearchResult struct {
	Url   string
	Terms string
	Items []NyaaSearchItem
}

type NyaaMagnetResult struct {
	Id     string
	Title  string
	Url    string
	Magnet string
}

const NyaaBaseUrl = "https://nyaa.si"
const NyaaFaviconUrl = "https://nyaa.si/static/favicon.png"

func NyaaSearch(terms string) (*NyaaSearchResult, error) {
	url := fmt.Sprintf("%s/?q=%s&s=seeders&o=desc", NyaaBaseUrl, url.QueryEscape(terms))
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, err
	}
	items := []NyaaSearchItem{}
	doc.Find(".torrent-list tbody tr").Each(func(i int, x *goquery.Selection) {
		rows := x.Find("td")
		name := rows.Eq(1).Find("a").Eq(-1)
		links := rows.Eq(2).Find("a")
		url := NyaaBaseUrl + name.AttrOr("href", "")
		items = append(items, NyaaSearchItem{
			Id:        parseIdFromViewUrl(url),
			Category:  rows.Eq(0).Find("a").AttrOr("title", ""),
			Title:     name.Text(),
			Url:       url,
			Torrent:   NyaaBaseUrl + links.Eq(0).AttrOr("href", ""),
			Magnet:    links.Eq(-1).AttrOr("href", ""),
			Size:      rows.Eq(3).Text(),
			Date:      rows.Eq(4).Text(),
			Seeders:   atoiOrZero(rows.Eq(5).Text()),
			Leechers:  atoiOrZero(rows.Eq(6).Text()),
			Downloads: atoiOrZero(rows.Eq(7).Text()),
		})
	})
	return &NyaaSearchResult{
		Terms: terms,
		Url:   url,
		Items: items,
	}, nil
}

func NyaaMagnet(id string) (*NyaaMagnetResult, error) {
	url := fmt.Sprintf("%s/view/%s", NyaaBaseUrl, id)
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, err
	}
	panel := doc.Find(".container .panel").Eq(0)
	return &NyaaMagnetResult{
		Id:     id,
		Title:  panel.Find(".panel-title").Eq(0).Text(),
		Url:    url,
		Magnet: panel.Find(".panel-footer .card-footer-item").Eq(0).AttrOr("href", ""),
	}, nil
}

var idRegex = regexp.MustCompile(`\d+$`)

func parseIdFromViewUrl(url string) string {
	return idRegex.FindString(url)
}

func atoiOrZero(value string) int {
	if parsed, err := strconv.Atoi(value); err == nil {
		return parsed
	}
	return 0
}
