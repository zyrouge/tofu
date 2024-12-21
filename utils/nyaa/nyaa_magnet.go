package nyaa

import (
	"fmt"

	"github.com/PuerkitoBio/goquery"
	"me.zyrouge.tofu/utils"
)

type NyaaMagnetResult struct {
	Id     string
	Title  string
	Url    string
	Magnet string
}

func NyaaMagnet(id string) (*NyaaMagnetResult, error) {
	url := fmt.Sprintf("%s/view/%s", NyaaBaseUrl, id)
	resp, err := utils.TofuHttpClient.Get(url)
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
