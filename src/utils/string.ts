export class StringUtils {
    static overflow(text: string, limit: number = 100) {
        if (text.length < limit) return text;
        return `${text.substring(0, limit - 3)}...`;
    }
}
