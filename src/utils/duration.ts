export interface ParsedDuration {
    hours: number;
    minutes: number;
    seconds: number;
}

export type DurationFormatter = (duration: ParsedDuration) => string;

export type DurationFormats = "short" | "human";

export class DurationUtils {
    static formats: Record<DurationFormats, DurationFormatter> = {
        short: (d) => this.formatShort(d),
        human: (d) => this.formatHuman(d),
    };

    static testShortFormattedRegex = /^(?:\d+:){0,2}\d+$/;

    static parseMilliseconds(total: number) {
        return this.parseSeconds(total / 1000);
    }

    static parseSeconds(total: number) {
        const data: ParsedDuration = {
            hours: Math.floor(total / 3600),
            minutes: Math.floor((total / 60) % 60),
            seconds: Math.floor(total % 60),
        };
        return data;
    }

    static prettyMilliseconds(total: number, format: DurationFormats) {
        return this.prettyDuration(this.parseMilliseconds(total), format);
    }

    static prettySeconds(total: number, format: DurationFormats) {
        return this.prettyDuration(this.parseSeconds(total), format);
    }

    static prettyDuration(data: ParsedDuration, format: DurationFormats) {
        const formatter = this.formats[format];
        return formatter(data);
    }

    static parseShortFormatted(value: string) {
        const match = this.testShortFormattedRegex.test(value);
        if (!match) return;
        const splitted = value.split(":");
        const seconds = parseInt(splitted.pop()!);
        const minutes = parseInt(splitted.pop() ?? "0");
        const hours = parseInt(splitted.pop() ?? "0");
        const data: ParsedDuration = { hours, minutes, seconds };
        return data;
    }

    static durationToSeconds(data: ParsedDuration) {
        return data.hours * 3600 + data.minutes * 60 + data.seconds;
    }

    static formatShort({ hours, minutes, seconds }: ParsedDuration) {
        if (hours === 0) {
            return `${this.p(minutes)}:${this.p(seconds)}`;
        }
        return `${this.p(hours)}:${this.p(minutes)}:${this.p(seconds)}`;
    }

    static formatHuman({ hours, minutes, seconds }: ParsedDuration) {
        let output = "";
        if (hours > 0) {
            output += `${hours} hours, `;
        }
        if (minutes > 0) {
            output += `${minutes} minutes and `;
        }
        output += `${seconds} seconds`;
        return output;
    }

    static p(duration: number) {
        return duration.toString().padStart(2, "0");
    }
}
