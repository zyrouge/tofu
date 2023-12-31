import { VoiceChannel, VoiceConnection } from "eris";
import Undici from "undici";
import * as ytext from "youtube-ext";
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

    constructor(public readonly tofu: Tofu) {}

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
        if (connection) return connection;
        return this.createConnection(guildId, voiceChannelId);
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
        if (!song) return false;
        const stream = await TofuMusicUtils.generateSongStream(song);
        if (!stream) {
            this.onVoiceConnectionEnd();
            return false;
        }
        this.voiceConnection.play(stream, {
            inlineVolume: true,
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
        if (this.index === -1) return;
        await this.play();
    }

    async onVoiceConnectionError(err: unknown) {
        if (err instanceof Undici.errors.RequestAbortedError) return;
        log.error(
            `Voice connection error in guild "${this.guildId}" and voice channel "${this.voiceChannelId}".`,
        );
        log.logError(err);
    }

    async pause() {
        if (!this.playing || this.paused) return false;
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
        if (!this.paused) return false;
        this.voiceConnection.resume();
        return true;
    }

    hasSongAt(index: number) {
        return index > -1 && index < this.songs.length;
    }

    async jump(index: number) {
        this.stopCurrentSong();
        if (!this.hasSongAt(index)) return false;
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
        if (this.scheduledLeaveTimeout) return;
        this.scheduledLeaveTimeout = setTimeout(() => {
            this.removeScheduledLeaveTimeout();
            if (this.isVoiceChannelEmpty()) {
                this.destroy();
            }
        }, TofuMusicUtils.SCHEDULED_TIMEOUT_MS);
    }

    removeScheduledLeaveTimeout() {
        const timeout = this.scheduledLeaveTimeout;
        if (!timeout) return;
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
}

export class TofuMusicUtils {
    static SCHEDULED_TIMEOUT_MS = 300000 as const;

    static async search(terms: string) {
        try {
            const { videos } = await ytext.search(terms, {
                filterType: "video",
            });
            return videos;
        } catch (err) {
            log.error(
                `Unable to generate YouTube search results for "${terms}".`,
            );
            log.logError(err);
            return [];
        }
    }

    static async getVideo(url: string) {
        try {
            const video = await ytext.videoInfo(url);
            return video;
        } catch (err) {
            log.error(
                `Unable to fetch YouTube video information for "${url}".`,
            );
            log.logError(err);
        }
    }

    static async getPlaylist(url: string) {
        try {
            const playlist = await ytext.playlistInfo(url);
            return playlist;
        } catch (err) {
            log.error(
                `Unable to fetch YouTube playlist information for "${url}".`,
            );
            log.logError(err);
        }
    }

    static async generateSongStream(song: TofuSong) {
        try {
            const streamInfo = await ytext.extractStreamInfo(song.metadata.url);
            const formats = await ytext.getFormats(streamInfo);
            const isLive = ytext.utils.isLiveContentURL(
                streamInfo.hlsManifestUrl,
            );
            const format = isLive
                ? this.findBestLiveStream(formats)
                : this.findBestAudioStream(formats);
            if (!format) return;
            const stream = await ytext.getReadableStream(format);
            return stream;
        } catch (err) {
            log.error(
                `Unable to generate YouTube song stream for "${song.metadata.url}".`,
            );
            log.logError(err);
        }
    }

    static findBestAudioStream(formats: ytext.VideoFormat[]) {
        for (let i = formats.length - 1; i > -1; i--) {
            const x = formats[i]!;
            if (!x.__decoded) continue;
            if (!(x.mimeType?.startsWith("audio/") ?? false)) continue;
            return x;
        }
    }

    static findBestLiveStream(formats: ytext.VideoFormat[]) {
        for (let i = formats.length - 1; i > -1; i--) {
            const x = formats[i]!;
            if (!x.__decoded) continue;
            if (
                ytext.utils.isLiveContentURL(x.url) &&
                ytext.utils.isHlsContentURL(x.url)
            ) {
                return x;
            }
        }
    }

    static convertSearchVideoToSongMetadata(video: ytext.SearchVideo) {
        const metadata: TofuSongMetadata = {
            title: video.title,
            channel: video.channel.name,
            url: video.url,
            thumbnail: video.thumbnails[0]?.url,
            duration: video.duration.pretty,
        };
        return metadata;
    }

    static convertPlaylistVideoToSongMetadata(video: ytext.PlaylistVideo) {
        const metadata: TofuSongMetadata = {
            title: video.title,
            channel: video.channel.name,
            url: video.url,
            thumbnail: video.thumbnails[0]?.url,
            duration: video.duration.pretty,
        };
        return metadata;
    }

    static convertVideoInfoToSongMetadata(video: ytext.VideoInfo) {
        const metadata: TofuSongMetadata = {
            title: video.title,
            channel: video.channel.name,
            url: video.url,
            thumbnail: video.thumbnails?.reduce((pv, cv) => {
                if (!pv || cv.height > pv.height) {
                    return cv;
                }
                return pv;
            }, video.thumbnails[0])?.url,
            duration: DurationUtils.prettySeconds(
                parseInt(video.duration.lengthSec),
                "short",
            ),
        };
        return metadata;
    }

    static shortenVideoURL(url: string) {
        const id = ytext.utils.getYoutubeVideoId(url)!;
        return ytext.utils.constants.urls.video.base(id);
    }
}
