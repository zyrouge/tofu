import { TofuCommand } from "@/core/command";
import { colors } from "@/utils/colors";
import { constants } from "@/utils/constants";
import { DurationUtils } from "@/utils/duration";
import { getEnvMode } from "@/utils/env";
import { getVersion } from "@/utils/version";

export const aboutCommand: TofuCommand = {
    config: {
        name: "about",
        description: `About ${constants.project.name}.`,
    },
    invoke: async (tofu) => {
        const mode = getEnvMode();
        const version = await getVersion();
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
                                    `Version: \`v${version}\``,
                                    `Uptime: **${DurationUtils.prettyMilliseconds(
                                        tofu.uptime,
                                        "human",
                                    )}**`,
                                ].join("\n"),
                            },
                            {
                                name: "More information",
                                value: [
                                    `${constants.project.author}'s GitHub: **${constants.urls.github.author}**`,
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
