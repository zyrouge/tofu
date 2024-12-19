package utils

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
