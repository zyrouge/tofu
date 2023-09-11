import p from "path";
import { ApplicationCommandStructure, CommandClient, Constants } from "eris";
import { pathExists, readFile } from "fs-extra";
import { TofuConfig, TofuConfigSchema } from "@/core/config";
import {
    TofuCommand,
    TofuCommandInvoke,
    TofuCommandAutoComplete,
} from "@/core/command";
import { TofuEvent } from "@/core/event";
import { paths } from "@/utils/paths";
import { log } from "@/utils/log";
import { PingServer, startPingServer } from "@/utils/pingServer";
import { pingCommand } from "@/commands/developer/ping";
import { readyEvent } from "@/events/ready";
import { interactionCreateEvent } from "@/events/interactionCreate";
import { evalCommand } from "@/commands/developer/eval";
import { TofuMusic } from "@/core/modules/music";
import { playCommand } from "@/commands/music/play";
import { queueCommand } from "@/commands/music/queue";
import { nowPlayingCommand } from "@/commands/music/nowPlaying";
import { pauseCommand } from "@/commands/music/pause";
import { resumeCommand } from "@/commands/music/resume";
import { stopCommand } from "@/commands/music/stop";
import { skipCommand } from "@/commands/music/skip";
import { volumeCommand } from "@/commands/music/volume";
import { jumpCommand } from "@/commands/music/jump";
import { voiceChannelJoinEvent } from "@/events/voiceChannelJoin";
import { voiceChannelLeaveEvent } from "@/events/voiceChannelLeave";
import { voiceChannelSwitchEvent } from "@/events/voiceChannelSwitch";
import { dequeueCommand } from "@/commands/music/dequeue";
import { geniusCommand } from "@/commands/utils/genius";
import { isProduction } from "@/utils/env";

export class Tofu {
    bot: CommandClient;
    config: TofuConfig;

    botReady = false;
    commandAutoCompletes = new Map<string, TofuCommandAutoComplete>();
    commandInvokes = new Map<string, TofuCommandInvoke>();
    pingServer?: PingServer;
    music: TofuMusic;

    constructor(config: TofuConfig) {
        this.bot = new CommandClient(config.discordToken, {
            intents: ["guilds", "guildVoiceStates"],
        });
        this.config = config;
        this.music = new TofuMusic(this);
    }

    async start() {
        await this.loadEvents();
        await this.bot.connect();
        await this.loadPingServer();
    }

    async loadCommands() {
        const slashCommands: ApplicationCommandStructure[] = [];
        for (const x of Tofu.commands) {
            const commandName = x.config.name;
            slashCommands.push({
                ...x.config,
                type: Constants.ApplicationCommandTypes.CHAT_INPUT,
            });
            if (x.autocomplete) {
                this.commandAutoCompletes.set(commandName, x.autocomplete);
            }
            this.commandInvokes.set(commandName, x.invoke);
            log.debug(`Registered ${commandName} command.`);
        }
        await this.bot.bulkEditCommands(slashCommands);
        log.info(`Registered ${Tofu.commands.length} commands.`);
    }

    async loadEvents() {
        for (const x of Tofu.events) {
            const eventName = x.config.name;
            const listener = async (...args: any[]) => {
                try {
                    await x.action(this, ...args);
                } catch (err) {
                    if (!isProduction()) {
                        throw err;
                    }
                    log.error(
                        `Bot event failed. (${log.errorColor(`${err}`)})`
                    );
                }
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
        log.info(`Registered ${Tofu.commands.length} commands.`);
    }

    async loadPingServer() {
        if (this.config.pingServer) {
            this.pingServer = await startPingServer(this.config.pingServer);
        }
    }

    static commands: TofuCommand[] = [
        pingCommand,
        evalCommand,
        playCommand,
        queueCommand,
        nowPlayingCommand,
        pauseCommand,
        resumeCommand,
        stopCommand,
        volumeCommand,
        skipCommand,
        jumpCommand,
        dequeueCommand,
        geniusCommand,
    ];
    static events: TofuEvent<any>[] = [
        readyEvent,
        interactionCreateEvent,
        voiceChannelJoinEvent,
        voiceChannelLeaveEvent,
        voiceChannelSwitchEvent,
    ];

    static async create(mode: string) {
        const configPath = p.join(paths.configDir, `${mode}.json`);
        if (!(await pathExists(configPath))) {
            throw new Error(`Missing mode config at "${configPath}"`);
        }
        const buffer = await readFile(configPath);
        const config = this.parseConfig(JSON.parse(buffer.toString()));
        if (!config) {
            throw new Error(`Invalid mode config at "${configPath}"`);
        }
        const tofu = new Tofu(config);
        return tofu;
    }

    static parseConfig(config: any): TofuConfig | undefined {
        const parsed = TofuConfigSchema.safeParse(config);
        if (parsed.success) return parsed.data;
    }
}
