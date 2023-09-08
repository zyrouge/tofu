import p from "path";
import { CommandClient, Constants } from "eris";
import { pathExists, readFile } from "fs-extra";
import { MisoCommand, MisoCommandAction } from "@/core/command";
import { MisoEvent } from "@/core/event";
import { paths } from "@/utils/paths";
import { log } from "@/utils/log";
import { pingCommand } from "@/commands/developer/ping";
import { readyEvent } from "@/events/ready";
import { interactionCreateEvent } from "@/events/interactionCreate";
import { evalCommand } from "@/commands/developer/eval";

export interface MisoConfig {
    discordToken: string;
    priviledgedUsers: string[];
}

export interface MisoBinding {
    bind(miso: Miso): Promise<void>;
}

export class Miso {
    bot: CommandClient;
    config: MisoConfig;

    commandActions = new Map<string, MisoCommandAction>();

    constructor(config: MisoConfig) {
        this.bot = new CommandClient(config.discordToken, {
            intents: ["guilds", "guildVoiceStates"],
        });
        this.config = config;
    }

    async start() {
        await this.loadEvents();
        await this.bot.connect();
    }

    async loadCommands() {
        for (const x of Miso.commands) {
            const commandName = x.config.name;
            await this.bot.createCommand({
                ...x.config,
                type: Constants.ApplicationCommandTypes.CHAT_INPUT,
            });
            this.commandActions.set(commandName, x.action);
            log.debug(`Registered ${commandName} command.`);
        }
        log.info(`Registered ${Miso.commands.length} commands.`);
    }

    async loadEvents() {
        for (const x of Miso.events) {
            const eventName = x.config.name;
            const listener = async (...args: any[]) => {
                await x.action(this, ...args);
            };
            switch (x.config.type) {
                case "once":
                    this.bot.once(eventName, listener);
                    break;

                case "on":
                    this.bot.on(eventName, listener);
                    break;
            }
            log.debug(`Registered ${eventName} event.`);
        }
        log.info(`Registered ${Miso.commands.length} commands.`);
    }

    static commands: MisoCommand[] = [pingCommand, evalCommand];
    static events: MisoEvent<any>[] = [readyEvent, interactionCreateEvent];

    static async create(mode: string) {
        const configPath = p.join(paths.configDir, `${mode}.json`);
        if (!(await pathExists(configPath))) {
            throw new Error(`Missing mode config at "${configPath}"`);
        }
        const buffer = await readFile(configPath);
        const config = JSON.parse(buffer.toString());
        if (!this.checkConfig(config)) {
            throw new Error(`Invalid mode config at "${configPath}"`);
        }
        const miso = new Miso(config);
        return miso;
    }

    static checkConfig(config: any): config is MisoConfig {
        const casted: MisoConfig = config;
        return (
            typeof casted === "object" &&
            typeof casted.discordToken === "string" &&
            Array.isArray(casted.priviledgedUsers) &&
            casted.priviledgedUsers.every((x) => typeof x === "string")
        );
    }
}
