import { TofuCommand } from "@/core/command";
import { colors } from "@/utils/colors";
import { constants } from "@/utils/constants";

export const aboutCommand: TofuCommand = {
    config: {
        name: "about",
        description: `About ${constants.project.name}.`,
    },
    invoke: async () => {
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
