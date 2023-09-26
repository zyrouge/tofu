import { inspect } from "util";
import logColors from "ansi-colors";
import { createCuteLogSymbols } from "cute-log-symbols";

const logSymbols = createCuteLogSymbols({ mode: "ascii" });

export class Logger {
    infoSymbol = logSymbols.info;
    successSymbol = logSymbols.success;
    warnSymbol = logSymbols.warning;
    errorSymbol = logSymbols.error;
    debugSymbol = logSymbols.info;

    infoColor = logColors.blueBright;
    successColor = logColors.greenBright;
    warnColor = logColors.yellowBright;
    errorColor = logColors.redBright;
    debugColor = logColors.dim;
    timeColor = logColors.dim;

    info(text: string) {
        this.log(this.infoSymbol, this.infoColor, text);
    }

    success(text: string) {
        this.log(this.successSymbol, this.successColor, text);
    }

    warn(text: string) {
        this.log(this.warnSymbol, this.warnColor, text);
    }

    error(text: string) {
        this.log(this.errorSymbol, this.errorColor, text);
    }

    debug(text: string) {
        this.log(this.debugSymbol, this.debugColor, text);
    }

    log(level: string, levelStyle: logColors.StyleFunction, text: string) {
        console.log(
            `${levelStyle(`[${level}]`)} ${this.timeColor(this.time())} ${text}`
        );
    }

    logError(error: any) {
        console.error(this.errorColor(inspect(error)));
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
