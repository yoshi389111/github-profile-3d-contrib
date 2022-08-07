import * as core from '@actions/core';
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
            core.setFailed('GITHUB_TOKEN is empty');
            return;
        }
        const userName =
            3 <= process.argv.length ? process.argv[2] : process.env.USERNAME;
        if (!userName) {
            core.setFailed('USERNAME is empty');
            return;
        }
        const maxRepos = process.env.MAX_REPOS
            ? Number(process.env.MAX_REPOS)
            : 100;
        if (Number.isNaN(maxRepos)) {
            core.setFailed('MAX_REPOS is NaN');
            return;
        }

        const response = await client.fetchData(token, userName, maxRepos);
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
                    create.createSvg(userInfo, settingInfo, false)
                );
            }
        } else {
            const settings = userInfo.isHalloween
                ? template.HalloweenSettings
                : template.NormalSettings;

            f.writeFile(
                'profile-green-animate.svg',
                create.createSvg(userInfo, settings, true)
            );
            f.writeFile(
                'profile-green.svg',
                create.createSvg(userInfo, settings, false)
            );

            // Northern hemisphere
            f.writeFile(
                'profile-season-animate.svg',
                create.createSvg(userInfo, template.NorthSeasonSettings, true)
            );
            f.writeFile(
                'profile-season.svg',
                create.createSvg(userInfo, template.NorthSeasonSettings, false)
            );

            // Southern hemisphere
            f.writeFile(
                'profile-south-season-animate.svg',
                create.createSvg(userInfo, template.SouthSeasonSettings, true)
            );
            f.writeFile(
                'profile-south-season.svg',
                create.createSvg(userInfo, template.SouthSeasonSettings, false)
            );

            f.writeFile(
                'profile-night-view.svg',
                create.createSvg(userInfo, template.NightViewSettings, true)
            );

            f.writeFile(
                'profile-night-green.svg',
                create.createSvg(userInfo, template.NightGreenSettings, true)
            );

            f.writeFile(
                'profile-night-rainbow.svg',
                create.createSvg(userInfo, template.NightRainbowSettings, true)
            );

            f.writeFile(
                'profile-gitblock.svg',
                create.createSvg(userInfo, template.GitBlockSettings, true)
            );
        }
    } catch (error) {
        console.error(error);
        core.setFailed('error');
    }
};

void main();
