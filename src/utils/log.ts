import logColors from "ansi-colors";

export class Logger {
    infoColor = logColors.blueBright;
    successColor = logColors.greenBright;
    warnColor = logColors.yellowBright;
    errorColor = logColors.redBright;
    debugColor = logColors.dim;

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
        console.log(`${levelStyle(`[${level}]`)} ${text}`);
    }
}

export const log = new Logger();

export { logColors };
