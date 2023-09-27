import logColors from "ansi-colors";
import { createCuteLogSymbols } from "cute-log-symbols";
import { inspect } from "util";

const logSymbols = createCuteLogSymbols({ mode: "ascii" });

export class Logger {
    infoSymbol = logSymbols.info;
    successSymbol = logSymbols.success;
    warnSymbol = logSymbols.warning;
    errorSymbol = logSymbols.error;

    infoColor = logColors.blueBright;
    successColor = logColors.greenBright;
    warnColor = logColors.yellowBright;
    errorColor = logColors.redBright;
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

    log(level: string, levelStyle: logColors.StyleFunction, text: string) {
        console.log(
            `${levelStyle(`[${level}]`)} ${this.timeColor(
                this.time(),
            )} ${text}`,
        );
    }

    logError(error: unknown) {
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
