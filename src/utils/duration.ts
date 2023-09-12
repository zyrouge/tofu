export interface PrettyDurationData {
    hours: number;
    minutes: number;
    seconds: number;
}

export type PrettyDurationFormatter = (duration: PrettyDurationData) => string;

export type PrettyDurationFormats = "short" | "human";

export class PrettyDuration {
    static formats: Record<PrettyDurationFormats, PrettyDurationFormatter> = {
        short: (d) => this.formatShort(d),
        human: (d) => this.formatHuman(d),
    };

    static prettyMilliseconds(total: number, format: PrettyDurationFormats) {
        return this.prettySeconds(total / 1000, format);
    }

    static prettySeconds(total: number, format: PrettyDurationFormats) {
        const formatter = this.formats[format];
        return formatter({
            hours: Math.floor(total / 3600),
            minutes: Math.floor(total / 60) % 60,
            seconds: total % 60,
        });
    }

    static formatShort({ hours, minutes, seconds }: PrettyDurationData) {
        if (hours === 0) {
            return `${this.p(minutes)}:${this.p(seconds)}`;
        }
        return `${this.p(hours)}:${this.p(minutes)}:${this.p(seconds)}`;
    }

    static formatHuman({ hours, minutes, seconds }: PrettyDurationData) {
        let output = "";
        if (hours > 0) {
            output += `${hours} hours, `;
        }
        if (hours > 0) {
            output += `${minutes} minutes and `;
        }
        output += `${seconds} seconds`;
        return output;
    }

    static p(duration: number) {
        return duration.toString().padStart(2, "0");
    }
}
