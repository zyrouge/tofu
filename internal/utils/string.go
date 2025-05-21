package utils

import "strings"

func CapitalizeWord(word string) string {
	if word == "" {
		return ""
	}
	return strings.ToUpper(word[:1]) + word[1:]
}

func NormalizeWord(word string) string {
	word = strings.ToLower(word)
	word = strings.ReplaceAll(word, "_", " ")
	return CapitalizeWord(word)
}

func OverflowEllipsisText(text string, limit int) string {
	if len(text) <= limit {
		return text
	}
	return text[:limit-3] + "..."
}
