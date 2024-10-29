import { VoiceChannel, VoiceConnection } from "eris";
import { Readable } from "stream";
import Undici from "undici";
import * as youtube from "youtubei.js";
import { Tofu } from "@/core/tofu";
import { DurationUtils } from "@/utils/duration";
import { log } from "@/utils/log";

export interface TofuSongMetadata {
    title: string;
    channel: string;
    url: string;
    thumbnail?: string;
    duration?: string;
}

export interface TofuSong {
    metadata: TofuSongMetadata;
    addedBy: string;
}

export class TofuMusic {
    connections = new Map<string, TofuMusicConnection>();
    utils: TofuMusicUtils;

    constructor(public readonly tofu: Tofu) {
        this.utils = new TofuMusicUtils(this.tofu);
    }

    hasConnection(guildId: string) {
        return this.connections.has(guildId);
    }

    getConnection(guildId: string) {
        return this.connections.get(guildId);
    }

    deleteConnection(guildId: string) {
        return this.connections.delete(guildId);
    }

    async createConnection(guildId: string, voiceChannelId: string) {
        const voiceConnection = await this.tofu.bot.joinVoiceChannel(
            voiceChannelId,
            {
                selfDeaf: true,
            },
        );
        const connection = new TofuMusicConnection(
            this.tofu,
            guildId,
            voiceChannelId,
            voiceConnection,
        );
        this.connections.set(guildId, connection);
        return connection;
    }

    async createOrGetConnection(guildId: string, voiceChannelId: string) {
        const connection = this.connections.get(guildId);
        return connection ?? this.createConnection(guildId, voiceChannelId);
    }
}

export enum TofuLoop {
    none = "none",
    queue = "queue",
    track = "track",
}

export class TofuMusicConnection {
    index = -1;
    songs: TofuSong[] = [];
    loop: TofuLoop = TofuLoop.none;

    preventEndPlay: true | undefined;
    scheduledLeaveTimeout: NodeJS.Timeout | undefined;

    constructor(
        public readonly tofu: Tofu,
        public readonly guildId: string,
        public voiceChannelId: string,
        public readonly voiceConnection: VoiceConnection,
    ) {
        this.voiceConnection.on("end", () => {
            this.onVoiceConnectionEnd();
        });
        this.voiceConnection.on("error", (err) => {
            this.onVoiceConnectionError(err);
        });
    }

    addToQueue(song: TofuSong): void;
    addToQueue(songs: TofuSong[]): void;
    addToQueue(value: TofuSong | TofuSong[]) {
        if (Array.isArray(value)) {
            this.songs.push(...value);
        } else {
            this.songs.push(value);
        }
    }

    async play() {
        const song = this.songs[this.index];
        if (!song) {
            return false;
        }
        const stream = await this.tofu.music.utils.generateSongWebmStream(song);
        if (!stream) {
            this.onVoiceConnectionEnd();
            return false;
        }
        this.voiceConnection.play(stream, {
            format: "webm",
        });
        return true;
    }

    nextSongIndex() {
        let nIndex = this.loop === TofuLoop.track ? this.index : this.index + 1;
        if (this.loop === TofuLoop.queue && nIndex >= this.songs.length) {
            nIndex = 0;
        }
        if (!this.hasSongAt(nIndex)) {
            nIndex = -1;
        }
        return nIndex;
    }

    async onVoiceConnectionEnd() {
        if (!this.voiceConnection.ready || this.isVoiceChannelEmpty()) {
            this.destroy();
            return;
        }
        this.index = this.nextSongIndex();
        if (this.preventEndPlay) {
            delete this.preventEndPlay;
            return;
        }
        if (this.index === -1) {
            return;
        }
        await this.play();
    }

    async onVoiceConnectionError(err: unknown) {
        if (err instanceof Undici.errors.RequestAbortedError) {
            return;
        }
        log.error(
            `Voice connection error in guild "${this.guildId}" and voice channel "${this.voiceChannelId}".`,
        );
        log.logError(err);
    }

    async pause() {
        if (!this.playing || this.paused) {
            return false;
        }
        this.voiceConnection.pause();
        return true;
    }

    async resume() {
        if (!this.playing && this.index === -1) {
            if (this.songs.length === 0) {
                return false;
            }
            this.index = 0;
            return this.play();
        }
        if (!this.paused) {
            return false;
        }
        this.voiceConnection.resume();
        return true;
    }

    hasSongAt(index: number) {
        return index > -1 && index < this.songs.length;
    }

    async jump(index: number) {
        this.stopCurrentSong();
        if (!this.hasSongAt(index)) {
            return false;
        }
        this.index = index;
        return this.play();
    }

    async remove(index: number) {
        if (index < 0 || index >= this.songs.length) {
            return;
        }
        const [song] = this.songs.splice(index, 1);
        if (this.index === index) {
            this.stopCurrentSong();
            await this.play();
        } else if (index < this.index) {
            this.index--;
        }
        return song;
    }

    setVolume(volume: number) {
        this.voiceConnection.setVolume(volume / 100);
    }

    setLoop(mode: TofuLoop) {
        this.loop = mode;
    }

    stopCurrentSong() {
        this.preventEndPlay = true;
        this.voiceConnection.stopPlaying();
    }

    destroy() {
        this.clearQueue();
        this.tofu.music.deleteConnection(this.guildId);
        this.voiceConnection.disconnect();
    }

    clearQueue() {
        this.stopCurrentSong();
        this.index = -1;
        this.songs = [];
    }

    isVoiceChannelEmpty() {
        const voiceChannel = this.tofu.bot.getChannel(this.voiceChannelId);
        if (!(voiceChannel instanceof VoiceChannel)) {
            return true;
        }
        let membersCount = voiceChannel.voiceMembers.size;
        if (voiceChannel.voiceMembers.has(this.tofu.bot.user.id)) {
            membersCount--;
        }
        return membersCount === 0;
    }

    scheduleLeave() {
        if (this.scheduledLeaveTimeout) {
            return;
        }
        this.scheduledLeaveTimeout = setTimeout(() => {
            this.removeScheduledLeaveTimeout();
            if (this.isVoiceChannelEmpty()) {
                this.destroy();
            }
        }, this.scheduledTimeoutMs);
    }

    removeScheduledLeaveTimeout() {
        const timeout = this.scheduledLeaveTimeout;
        if (!timeout) {
            return;
        }
        delete this.scheduledLeaveTimeout;
        clearTimeout(timeout);
    }

    get volume() {
        return Math.floor(this.voiceConnection.volume * 100);
    }

    get playing() {
        return this.voiceConnection.playing;
    }

    get paused() {
        return this.voiceConnection.paused;
    }

    get playedDuration() {
        return this.voiceConnection.current?.playTime ?? 0;
    }

    get scheduledTimeoutMs() {
        return 300000;
    }
}

export type TofuYoutubeSupportedVideo = youtube.YTNodes.Video;
export type TofuYoutubeSearchVideo = TofuYoutubeSupportedVideo;
export type TofuYoutubeVideo = youtube.YT.VideoInfo;
export type TofuYoutubePlaylist = youtube.YT.Playlist & {
    supportedVideos: TofuYoutubeSupportedVideo[];
};

export class TofuMusicUtils {
    constructor(public readonly tofu: Tofu) {}

    async search(terms: string): Promise<TofuYoutubeSearchVideo[]> {
        try {
            const client = await this.getClient();
            const { videos } = await client.search(terms, {
                type: "video",
            });
            return TofuYoutubeUtils.filterSupportedVideos(videos);
        } catch (err) {
            log.error(
                `Unable to generate YouTube search results for "${terms}".`,
            );
            log.logError(err);
            return [];
        }
    }

    async getVideo(url: string): Promise<TofuYoutubeVideo | undefined> {
        try {
            const id = TofuYoutubeUtils.parseVideoId(url)!;
            const client = await this.getClient();
            const video = await client.getBasicInfo(id);
            return video;
        } catch (err) {
            log.error(
                `Unable to fetch YouTube video information for "${url}".`,
            );
            log.logError(err);
        }
    }

    async getPlaylist(url: string): Promise<TofuYoutubePlaylist | undefined> {
        try {
            const id = TofuYoutubeUtils.parsePlaylistId(url)!;
            const client = await this.getClient();
            const playlist = await client.getPlaylist(id);
            // @ts-expect-error
            playlist.supportedVideos = TofuYoutubeUtils.filterSupportedVideos(
                playlist.videos,
            );
            return playlist as TofuYoutubePlaylist;
        } catch (err) {
            log.error(
                `Unable to fetch YouTube playlist information for "${url}".`,
            );
            log.logError(err);
        }
    }

    async generateSongWebmStream(song: TofuSong) {
        try {
            const id = TofuYoutubeUtils.parseVideoId(song.metadata.url)!;
            const client = await this.getClient({
                client_type: youtube.ClientType.IOS,
            });
            const stream = await client.download(id, {
                type: "audio",
                quality: "best",
                client: "IOS",
            });
            // @ts-expect-error
            return Readable.fromWeb(stream);
        } catch (err) {
            log.error(
                `Unable to generate YouTube song stream for "${song.metadata.url}".`,
            );
            log.logError(err);
        }
    }

    async getClient(config?: youtube.Types.InnerTubeConfig) {
        return youtube.Innertube.create(config);
    }
}

export class TofuYoutubeUtils {
    static baseURL = "https://www.youtube.com";
    static watchURLRegex = /\/watch\?v=([a-zA-Z0-9-_]{11})/;
    static playlistURLRegex = /\/playlist\?list=([A-Za-z0-9_]+)/;

    static isWatchURL(url?: string) {
        return !!url?.match(TofuYoutubeUtils.watchURLRegex);
    }

    static parseVideoId(url?: string) {
        return url?.match(TofuYoutubeUtils.watchURLRegex)?.[1];
    }

    static constructVideoURL(id: string) {
        return `${TofuYoutubeUtils.baseURL}/watch?v=${id}`;
    }

    static isPlaylistURL(url?: string) {
        return !!url?.match(TofuYoutubeUtils.playlistURLRegex);
    }

    static parsePlaylistId(url?: string) {
        return url?.match(TofuYoutubeUtils.playlistURLRegex)?.[1];
    }

    static convertSearchVideoToSongMetadata(video: TofuYoutubeSearchVideo) {
        return this.convertSupportedVideoToSongMetadata(video);
    }

    static convertPlaylistVideoToSongMetadata(
        video: TofuYoutubeSupportedVideo,
    ) {
        return this.convertSupportedVideoToSongMetadata(video);
    }

    static convertSupportedVideoToSongMetadata(
        video: TofuYoutubeSupportedVideo,
    ) {
        const metadata: TofuSongMetadata = {
            title: video.title.text ?? "?",
            channel: video.author.name,
            url: TofuYoutubeUtils.constructVideoURL(video.id),
            thumbnail: video.best_thumbnail?.url,
            duration: DurationUtils.prettySeconds(
                video.duration.seconds,
                "short",
            ),
        };
        return metadata;
    }

    static convertVideoInfoToSongMetadata(video: TofuYoutubeVideo) {
        const metadata: TofuSongMetadata = {
            title: video.basic_info.title ?? "?",
            channel: video.basic_info.author ?? "?",
            url: TofuYoutubeUtils.constructVideoURL(video.basic_info.id!),
            thumbnail: video.basic_info.thumbnail?.reduce((pv, cv) => {
                if (!pv || cv.height > pv.height) {
                    return cv;
                }
                return pv;
            }, video.basic_info.thumbnail[0])?.url,
            duration: DurationUtils.prettySeconds(
                video.basic_info.duration ?? 0,
                "short",
            ),
        };
        return metadata;
    }

    static filterSupportedVideos(
        videos: youtube.Helpers.YTNode[],
    ): TofuYoutubeSupportedVideo[] {
        return videos.filter(
            (x): x is TofuYoutubeSupportedVideo =>
                x instanceof youtube.YTNodes.Video,
        );
    }
}
