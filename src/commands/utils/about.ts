import { TofuCommand } from "@/core/command";
import { getBuildMetadata } from "@/utils/build-metadata";
import { colors } from "@/utils/colors";
import { constants } from "@/utils/constants";
import { getEnvMode } from "@/utils/env";

export const aboutCommand: TofuCommand = {
    config: {
        name: "about",
        description: `About ${constants.project.name}.`,
    },
    invoke: async () => {
        const mode = getEnvMode();
        const buildMetadata = await getBuildMetadata();
        return {
            message: {
                embeds: [
                    {
                        author: {
                            name: constants.project.name,
                            icon_url: constants.urls.logos.tofu,
                        },
                        description: constants.project.description,
                        fields: [
                            {
                                name: "Technical information",
                                value: [
                                    `Environment: \`${mode}\``,
                                    `Latest commit ID: \`${buildMetadata?.latestCommit ?? "?"}\``,
                                    `Built at: **${buildMetadata?.builtAt ? new Date(buildMetadata?.builtAt).toLocaleString() : "?"}**`,
                                ].join("\n"),
                            },
                            {
                                name: "More information",
                                value: [
                                    `${constants.project.author}'s Github: **${constants.urls.github.author}**`,
                                    `Github Repository: **${constants.urls.github.repository}**`,
                                    `License: **${constants.project.license}**`,
                                ].join("\n"),
                            },
                        ],
                        color: colors.orange500,
                        image: {
                            url: constants.urls.banners.tofu,
                        },
                        footer: {
                            text: `Made by ${constants.project.author}`,
                            icon_url: constants.urls.logos.zyrouge,
                        },
                    },
                ],
            },
        };
    },
};
