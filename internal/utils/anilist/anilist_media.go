package anilist

type AniListMediaVariables struct {
	Id int `json:"id"`
}

type AniListMediaResultMediaDate struct {
	Year  *int `json:"year"`
	Month *int `json:"month"`
	Day   *int `json:"day"`
}

type AniListMediaResultMedia struct {
	Id    int `json:"id"`
	Title struct {
		Romaji  *string `json:"romaji"`
		English *string `json:"english"`
		Native  string  `json:"native"`
	} `json:"title"`
	SiteUrl      string                      `json:"siteUrl"`
	Description  *string                     `json:"description"`
	StartDate    AniListMediaResultMediaDate `json:"startDate"`
	EndDate      AniListMediaResultMediaDate `json:"endDate"`
	Season       *string                     `json:"season"`
	SeasonYear   *int                        `json:"seasonYear"`
	Type         string                      `json:"type"`
	Format       *string                     `json:"format"`
	Status       string                      `json:"status"`
	Episodes     *int                        `json:"episodes"`
	Duration     *int                        `json:"duration"`
	Chapters     *int                        `json:"chapters"`
	Volumes      *int                        `json:"volumes"`
	IsAdult      bool                        `json:"isAdult"`
	Genres       []string                    `json:"genres"`
	AverageScore *int                        `json:"averageScore"`
	Popularity   *int                        `json:"popularity"`
	CoverImage   struct {
		Large *string `json:"large"`
	} `json:"coverImage"`
	BannerImage *string `json:"bannerImage"`
}

type AniListMediaResult struct {
	Media AniListMediaResultMedia `json:"media"`
}

const mediaQuery = `query ($id: Int) {
	Media(id: $id) {
		id
		title {
			romaji
			english
			native
		}
		siteUrl
		description
		startDate {
			year
			month
			day
		}
		endDate {
			year
			month
			day
		}
		season
		seasonYear
		type
		format
		status
		episodes
		duration
		chapters
		volumes
		isAdult
		genres
		averageScore
		popularity
		coverImage {
			large
		}
		bannerImage
	}
}`

func AniListMedia(variables AniListMediaVariables) (*AniListMediaResult, error) {
	return AniListQuery[AniListMediaVariables, AniListMediaResult](AniListQueryBody[AniListMediaVariables]{
		Query:     mediaQuery,
		Variables: variables,
	})
}
