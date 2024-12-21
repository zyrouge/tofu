package anilist

type AniListSearchVariables struct {
	Terms   string `json:"terms"`
	Type    string `json:"type"`
	IsAdult bool   `json:"isAdult"`
	Page    int    `json:"page"`
	PerPage int    `json:"perPage"`
}

type AniListSearchResultPageMedia struct {
	Id    int `json:"id"`
	Title struct {
		Romaji  *string `json:"romaji"`
		English *string `json:"english"`
		Native  string  `json:"native"`
	} `json:"title"`
	SiteUrl string `json:"siteUrl"`
}

type AniListSearchResultPage struct {
	Media []AniListSearchResultPageMedia `json:"media"`
}

type AniListSearchResult struct {
	Page AniListSearchResultPage `json:"Page"`
}

const searchQuery = `query ($terms: String, $type: MediaType, $isAdult: Boolean, $page: Int, $perPage: Int) {
	Page(page: $page, perPage: $perPage) {
		media(search: $terms, type: $type, isAdult: $isAdult) {
			id
			title {
				romaji
				english
				native
			}
			siteUrl
		}
	}
}`

func AniListSearch(variables AniListSearchVariables) (*AniListSearchResult, error) {
	return AniListQuery[AniListSearchVariables, AniListSearchResult](AniListQueryBody[AniListSearchVariables]{
		Query:     searchQuery,
		Variables: variables,
	})
}
