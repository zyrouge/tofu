package utils

import "regexp"

func PrettyMessage(emoji string, text string) string {
	return emoji + " | " + text
}

func SuccessMessage(text string) string {
	return PrettyMessage(EmojiCheck, text)
}

func RobotMessage(text string) string {
	return PrettyMessage(EmojiRobot, text)
}

func FailureMessage(text string) string {
	return PrettyMessage(EmojiCross, text)
}

var htmlToMarkdownReplacers = map[string]string{
	"<br>":      "\n",
	"<i>":       "_",
	"</i>":      "_",
	"<cite>":    "_",
	"</cite>":   "_",
	"<b>":       "*",
	"</b>":      "*",
	"<strong>":  "*",
	"</strong>": "*",
	"<u>":       "__",
	"</u>":      "__",
}

var htmlTagRegex = regexp.MustCompile(`<\/?(\w+)>`)
var lineBreakRegex = regexp.MustCompile(`\n{2,}`)

func ConvertHTMLToMessage(text string) string {
	text = htmlTagRegex.ReplaceAllStringFunc(text, func(s string) string {
		return htmlToMarkdownReplacers[s]
	})
	text = lineBreakRegex.ReplaceAllLiteralString(text, "\n\n")
	return text
}
