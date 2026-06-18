import * as aggregate from './aggregate-user-info';
import * as template from './color-template';
import * as create from './create-svg';
import * as f from './file-writer';
import * as r from './settings-reader';
import * as client from './github-graphql';

export const main = async (): Promise<void> => {
    try {
        const token = process.env.GITHUB_TOKEN;
        if (!token) {
            console.error('GITHUB_TOKEN is empty');
            process.exitCode = 1;
            return;
        }
        const userName =
            3 <= process.argv.length ? process.argv[2] : process.env.USERNAME;
        if (!userName) {
            console.error('USERNAME is empty');
            process.exitCode = 1;
            return;
        }
        const maxRepos = process.env.MAX_REPOS
            ? Number(process.env.MAX_REPOS)
            : 100;
        if (Number.isNaN(maxRepos)) {
            console.error('MAX_REPOS is NaN');
            process.exitCode = 1;
            return;
        }
        const year = process.env.YEAR ? Number(process.env.YEAR) : null;
        if (Number.isNaN(year)) {
            console.error('YEAR is NaN');
            process.exitCode = 1;
            return;
        }
        const heightScale = process.env.HEIGHT_SCALE
            ? Number(process.env.HEIGHT_SCALE)
            : 20;
        if (Number.isNaN(heightScale) || heightScale <= 0) {
            console.error('HEIGHT_SCALE must be a positive number');
            process.exitCode = 1;
            return;
        }

        const response = await client.fetchData(
            token,
            userName,
            maxRepos,
            year,
        );
        const userInfo = aggregate.aggregateUserInfo(response);

        if (process.env.SETTING_JSON) {
            const settingFile = r.readSettingJson(process.env.SETTING_JSON);
            const settingInfos =
                'length' in settingFile ? settingFile : [settingFile];
            for (const settingInfo of settingInfos) {
                const fileName =
                    settingInfo.fileName || 'profile-customize.svg';
                f.writeFile(
                    fileName,
                    create.createSvg(userInfo, settingInfo, false, heightScale),
                );
            }
        } else {
            const settings = userInfo.isHalloween
                ? template.HalloweenSettings
                : template.NormalSettings;

            f.writeFile(
                'profile-green-animate.svg',
                create.createSvg(userInfo, settings, true, heightScale),
            );
            f.writeFile(
                'profile-green.svg',
                create.createSvg(userInfo, settings, false, heightScale),
            );

            // Northern hemisphere
            f.writeFile(
                'profile-season-animate.svg',
                create.createSvg(
                    userInfo,
                    template.NorthSeasonSettings,
                    true,
                    heightScale,
                ),
            );
            f.writeFile(
                'profile-season.svg',
                create.createSvg(
                    userInfo,
                    template.NorthSeasonSettings,
                    false,
                    heightScale,
                ),
            );

            // Southern hemisphere
            f.writeFile(
                'profile-south-season-animate.svg',
                create.createSvg(
                    userInfo,
                    template.SouthSeasonSettings,
                    true,
                    heightScale,
                ),
            );
            f.writeFile(
                'profile-south-season.svg',
                create.createSvg(
                    userInfo,
                    template.SouthSeasonSettings,
                    false,
                    heightScale,
                ),
            );

            f.writeFile(
                'profile-night-view.svg',
                create.createSvg(
                    userInfo,
                    template.NightViewSettings,
                    true,
                    heightScale,
                ),
            );

            f.writeFile(
                'profile-night-green.svg',
                create.createSvg(
                    userInfo,
                    template.NightGreenSettings,
                    true,
                    heightScale,
                ),
            );

            f.writeFile(
                'profile-night-rainbow.svg',
                create.createSvg(
                    userInfo,
                    template.NightRainbowSettings,
                    true,
                    heightScale,
                ),
            );

            f.writeFile(
                'profile-gitblock.svg',
                create.createSvg(
                    userInfo,
                    template.GitBlockSettings,
                    true,
                    heightScale,
                ),
            );
        }
    } catch (error) {
        console.error(error);
        process.exitCode = 1;
    }
};

void main();
