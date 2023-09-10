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
            type: z
                .enum(["online", "idle", "dnd", "invisible"] as const)
                .optional(),
            text: z.string().optional(),
        })
        .optional(),
});

export type TofuConfig = z.infer<typeof TofuConfigSchema>;
