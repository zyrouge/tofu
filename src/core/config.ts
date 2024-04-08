import { BotActivityType, Constants } from "eris";
import { z } from "zod";

export const TofuConfigSchema = z.object({
    discordToken: z.string(),
    priviledgedUsers: z.string().array(),
    pingServer: z
        .object({
            host: z.string(),
            port: z.number(),
        })
        .optional(),
    discordStatus: z
        .object({
            type: z.enum(["online", "idle", "dnd", "invisible"]).optional(),
            activity: z
                .object({
                    type: z
                        .enum([
                            "game",
                            "streaming",
                            "listening",
                            "watching",
                            "competing",
                        ])
                        .optional()
                        .transform((value) => {
                            if (typeof value === "undefined") return;
                            return Constants.ActivityTypes[
                                value.toUpperCase() as keyof Constants["ActivityTypes"]
                            ] as BotActivityType;
                        }),
                    text: z.string().optional(),
                })
                .optional(),
        })
        .optional(),
    filteredGuilds: z
        .object({
            mode: z.enum(["whitelisted", "blacklisted"]),
            ids: z.string().array(),
        })
        .optional(),
    youtubeCookie: z.string().optional(),
});

export type TofuConfig = z.infer<typeof TofuConfigSchema>;
