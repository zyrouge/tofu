import { ApplicationCommandStructure, CommandClient, Constants } from "eris";
import { pathExists, readFile } from "fs-extra";
import p from "path";
import { evalCommand } from "@/commands/developer/eval";
import { pingCommand } from "@/commands/developer/ping";
import { uptimeCommand } from "@/commands/developer/uptime";
import { clearCommand } from "@/commands/music/clear";
import { dequeueCommand } from "@/commands/music/dequeue";
import { jumpCommand } from "@/commands/music/jump";
import { loopCommand } from "@/commands/music/loop";
import { nowPlayingCommand } from "@/commands/music/nowPlaying";
import { pauseCommand } from "@/commands/music/pause";
import { playCommand } from "@/commands/music/play";
import { queueCommand } from "@/commands/music/queue";
import { resumeCommand } from "@/commands/music/resume";
import { skipCommand } from "@/commands/music/skip";
import { stopCommand } from "@/commands/music/stop";
import { volumeCommand } from "@/commands/music/volume";
import { aboutCommand } from "@/commands/utils/about";
import { anilistCommand } from "@/commands/utils/anilist";
import { geniusCommand } from "@/commands/utils/genius";
import { nyaaMagnetCommand } from "@/commands/utils/nyaa-magnet";
import { nyaaSearchCommand } from "@/commands/utils/nyaa-search";
import {
    TofuCommand,
    TofuCommandInvoke,
    TofuCommandAutocomplete,
} from "@/core/command";
import { TofuConfig, TofuConfigSchema } from "@/core/config";
import { TofuEvent } from "@/core/event";
import { TofuFilteredGuilds } from "@/core/modules/filteredGuilds";
import { TofuMusic } from "@/core/modules/music";
import { errorEvent } from "@/events/error";
import { interactionCreateEvent } from "@/events/interactionCreate";
import { readyEvent } from "@/events/ready";
import { voiceChannelJoinEvent } from "@/events/voiceChannelJoin";
import { voiceChannelLeaveEvent } from "@/events/voiceChannelLeave";
import { voiceChannelSwitchEvent } from "@/events/voiceChannelSwitch";
import { isProduction } from "@/utils/env";
import { log } from "@/utils/log";
import { paths } from "@/utils/paths";
import { PingServer, startPingServer } from "@/utils/pingServer";

export class Tofu {
    bot: CommandClient;
    config: TofuConfig;

    startedAt = Date.now();
    botReady = false;
    commandAutocompletes = new Map<string, TofuCommandAutocomplete>();
    commandInvokes = new Map<string, TofuCommandInvoke>();
    pingServer?: PingServer;
    music: TofuMusic;
    filteredGuilds: TofuFilteredGuilds;

    constructor(config: TofuConfig) {
        this.bot = new CommandClient(config.discordToken, {
            intents: ["guilds", "guildVoiceStates"],
        });
        this.config = config;
        this.music = new TofuMusic(this);
        this.filteredGuilds = new TofuFilteredGuilds(this);
    }

    async start() {
        await this.loadEvents();
        await this.bot.connect();
        await this.music.initialize();
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
                this.commandAutocompletes.set(commandName, x.autocomplete);
            }
            this.commandInvokes.set(commandName, x.invoke);
            log.info(`Registered ${commandName} command.`);
        }
        await this.bot.bulkEditCommands(slashCommands);
        log.info(`Registered ${Tofu.commands.length} commands.`);
    }

    async loadEvents() {
        for (const x of Tofu.events) {
            const eventName = x.config.name;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const listener = async (...args: any[]) => {
                try {
                    await x.action(this, ...args);
                } catch (err) {
                    if (!isProduction()) {
                        throw err;
                    }
                    log.error("Bot event failed.");
                    log.logError(err);
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
            log.info(`Registered ${eventName} event.`);
        }
        log.info(`Registered ${Tofu.events.length} events.`);
    }

    async loadPingServer() {
        if (this.config.pingServer) {
            this.pingServer = await startPingServer(this.config.pingServer);
        }
    }

    get uptime() {
        return Date.now() - this.startedAt;
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
        aboutCommand,
        uptimeCommand,
        loopCommand,
        clearCommand,
        anilistCommand,
        nyaaSearchCommand,
        nyaaMagnetCommand,
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static events: TofuEvent<any>[] = [
        readyEvent,
        interactionCreateEvent,
        voiceChannelJoinEvent,
        voiceChannelLeaveEvent,
        voiceChannelSwitchEvent,
        errorEvent,
    ];

    static async create(mode: string) {
        const configPath = await this.getConfigPath(mode);
        const buffer = await readFile(configPath);
        const config = this.parseConfig(JSON.parse(buffer.toString()));
        if (!config) {
            throw new Error(`Invalid mode config at "${configPath}"`);
        }
        const tofu = new Tofu(config);
        return tofu;
    }

    static parseConfig(config: unknown): TofuConfig | undefined {
        const parsed = TofuConfigSchema.safeParse(config);
        if (parsed.success) return parsed.data;
    }

    static async getConfigPath(mode: string) {
        const modeConfigPath = p.join(paths.configDir, `${mode}.json`);
        if (await pathExists(modeConfigPath)) {
            return modeConfigPath;
        }
        const rootConfigPath = p.join(paths.rootDir, "config.json");
        if (await pathExists(rootConfigPath)) {
            log.warn(`Using root config from "${rootConfigPath}"`);
            return rootConfigPath;
        }
        throw new Error(`Missing mode config at "${modeConfigPath}"`);
    }
}
