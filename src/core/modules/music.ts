import { VoiceConnection } from "eris";
import * as ytext from "youtube-ext";
import { Tofu } from "@/core/tofu";
import { log } from "@/utils/log";
import { PrettyDuration } from "@/utils/duration";

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
            }
        );
        const connection = new TofuMusicConnection(
            this.tofu,
            guildId,
            voiceChannelId,
            voiceConnection
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

export class TofuMusicConnection {
    index = -1;
    songs: TofuSong[] = [];
    loop: 0 | 1 | 2 = TofuMusicUtils.LOOP_NONE;
    active = false;

    constructor(
        public readonly tofu: Tofu,
        public readonly guildId: string,
        public readonly voiceChannelId: string,
        public readonly voiceConnection: VoiceConnection
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
        if (!song) return;
        const stream = await TofuMusicUtils.generateSongStream(song);
        if (!stream) {
            this.onVoiceConnectionEnd();
            return;
        }
        this.voiceConnection.play(stream);
    }

    async onVoiceConnectionEnd() {
        let nIndex =
            this.loop === TofuMusicUtils.LOOP_TRACK
                ? this.index
                : this.index + 1;
        if (
            !this.songs[nIndex] &&
            this.loop === TofuMusicUtils.LOOP_QUEUE &&
            this.songs.length > 0
        ) {
            nIndex = 0;
        }
        this.index = nIndex;
        await this.play();
    }

    async onVoiceConnectionError(err: unknown) {
        log.error(
            `Voice connection error in guild "${
                this.guildId
            }" and voice channel "${this.voiceChannelId}" (${log.errorColor(
                `${err}`
            )})`
        );
    }

    pause() {
        if (!this.isPlaying) return false;
        this.voiceConnection.pause();
        return true;
    }

    resume() {
        const isPlaying = this.isPlaying;
        if (isPlaying) return false;
        if (this.index === -1) {
            this.play();
        } else {
            this.voiceConnection.resume();
        }
        return true;
    }

    destroy() {
        this.tofu.music.deleteConnection(this.guildId);
        this.voiceConnection.disconnect();
        this.index = -1;
    }

    get isPlaying() {
        return this.voiceConnection.playing;
    }

    get duration() {
        return this.voiceConnection.frameDuration;
    }
}

export class TofuMusicUtils {
    static LOOP_NONE = 0 as const;
    static LOOP_QUEUE = 1 as const;
    static LOOP_TRACK = 2 as const;

    static async search(terms: string) {
        try {
            const { videos } = await ytext.search(terms, {
                filterType: "video",
            });
            return videos;
        } catch (err) {
            log.error(
                `Unable to generate search results for "${terms}" (${log.errorColor(
                    `${err}`
                )})`
            );
            return [];
        }
    }

    static async getVideo(url: string) {
        try {
            const video = await ytext.videoInfo(url);
            return video;
        } catch (err) {
            log.error(
                `Unable to fetch video information for "${url}" (${log.errorColor(
                    `${err}`
                )})`
            );
        }
    }

    static async getPlaylist(url: string) {
        try {
            const playlist = await ytext.playlistInfo(url);
            return playlist;
        } catch (err) {
            log.error(
                `Unable to fetch playlist information for "${url}" (${log.errorColor(
                    `${err}`
                )})`
            );
        }
    }

    static async generateSongStream(song: TofuSong) {
        try {
            const streamInfo = await ytext.extractStreamInfo(song.metadata.url);
            const formats = await ytext.getFormats(streamInfo);
            const isLive = ytext.utils.isLiveContentURL(
                streamInfo.hlsManifestUrl
            );
            const format = isLive
                ? this.findBestLiveStream(formats)
                : this.findBestAudioStream(formats);
            if (!format) return;
            const stream = await ytext.getReadableStream(format);
            return stream;
        } catch (err) {
            log.error(
                `Unable to generate YouTube song stream for "${
                    song.metadata.url
                }" (${log.errorColor(`${err}`)})`
            );
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
            duration: PrettyDuration.formatSeconds(
                parseInt(video.duration.lengthSec)
            ),
        };
        return metadata;
    }

    static shortenVideoURL(url: string) {
        const id = ytext.utils.getYoutubeVideoId(url)!;
        return ytext.utils.constants.urls.video.base(id);
    }
}
