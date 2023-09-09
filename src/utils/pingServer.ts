import http from "http";
import { ListenOptions } from "net";
import { URL } from "url";
import { log } from "@/utils/log";

export interface PingServerOptions {
    host: string;
    port: number;
}

export interface PingServerStats {
    hits: number;
}

export interface PingServer {
    server: http.Server;
    stats: PingServerStats;
}

export const startPingServer = (options: PingServerOptions) => {
    const stats: PingServerStats = {
        hits: 0,
    };
    const server = http.createServer((req, res) => {
        if (req.url) {
            const url = new URL(req.url, `http://${req.headers.host}`);
            if (url.pathname === "/ping") {
                stats.hits++;
                res.writeHead(200);
                res.end("Pong!");
                return;
            }
        }
        res.writeHead(418);
        res.end("I'm a teapot");
    });
    const pingServer: PingServer = { stats, server };
    return new Promise<PingServer>((resolve, reject) => {
        const listenOptions: ListenOptions = {
            host: options.host,
            port: options.port,
        };
        let onError = (err: any) => {
            server.removeListener("error", onError);
            reject(err);
        };
        server.on("error", onError);
        server.listen(listenOptions, () => {
            server.removeListener("error", onError);
            log.info(
                `Ping server started at ${log.infoColor(
                    `http://${options.host}:${options.port}/ping`
                )}.`
            );
            resolve(pingServer);
        });
    });
};
