export class StringUtils {
    static overflow(text: string, limit: number = 100) {
        if (text.length < limit) return text;
        return `${text.substring(0, limit - 3)}...`;
    }

    static isUrl(text: string) {
        return text.startsWith("http://") || text.startsWith("https://");
    }

    static chunk(text: string, limit: number = 3500) {
        const chunks: string[] = [];
        let current = "";
        text.split("\n").forEach((line) => {
            if (current.length + line.length < limit) {
                current += `${line}\n`;
            } else {
                chunks.push(current);
                current = line;
            }
        });
        if (current.length > 0) {
            chunks.push(current);
        }
        return chunks;
    }

    static capitalizeWord(word: string) {
        return `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`;
    }
}
