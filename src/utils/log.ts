import logColors from "ansi-colors";

export class Logger {
    infoColor = logColors.blueBright;
    successColor = logColors.greenBright;
    warnColor = logColors.yellowBright;
    errorColor = logColors.redBright;
    debugColor = logColors.dim;
    timeColor = logColors.dim;

    info(text: string) {
        this.log("i", this.infoColor, text);
    }

    success(text: string) {
        this.log("✓", this.successColor, text);
    }

    warn(text: string) {
        this.log("‼", this.warnColor, text);
    }

    error(text: string) {
        this.log("×", this.errorColor, text);
    }

    debug(text: string) {
        this.log("i", this.debugColor, text);
    }

    log(level: string, levelStyle: logColors.StyleFunction, text: string) {
        console.log(
            `${levelStyle(`[${level}]`)} ${this.timeColor(this.time())} ${text}`
        );
    }

    time() {
        return new Date()
            .toLocaleString("en-US", {
                hourCycle: "h24",
                timeStyle: "short",
                dateStyle: "short",
            })
            .replace(",", "");
    }
}

export const log = new Logger();

export { logColors };
