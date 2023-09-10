export class PrettyDuration {
    static formatMilliseconds(total: number) {
        return this.formatSeconds(total / 1000);
    }

    static formatSeconds(total: number) {
        return this.formatDuration(
            Math.floor(total / 3600),
            Math.floor(total / 60) % 60,
            total % 60
        );
    }

    static formatDuration(hours: number, minutes: number, seconds: number) {
        if (hours === 0) {
            return `${this.p(minutes)}:${this.p(seconds)}`;
        }
        return `${this.p(hours)}:${this.p(minutes)}:${this.p(seconds)}`;
    }

    static p(duration: number) {
        return duration.toString().padStart(2, "0");
    }
}
