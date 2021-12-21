import * as core from '@actions/core';
import * as client from './github-graphql';
import * as aggregate from './aggregate-user-info';
import * as create from './create-svg';
import * as f from './file-writer';
import * as template from './color-template';

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

        const settings = userInfo.isHalloween
            ? template.HalloweenSettings
            : template.NormalSettings;

        const svgString1 = create.createSvg(
            userInfo,
            template.NorthSeasonSettings,
            true
        );
        f.writeFile('profile-season-animate.svg', svgString1);

        const svgString2 = create.createSvg(userInfo, settings, true);
        f.writeFile('profile-green-animate.svg', svgString2);

        const svgString3 = create.createSvg(
            userInfo,
            template.NorthSeasonSettings,
            false
        );
        f.writeFile('profile-season.svg', svgString3);

        const svgString4 = create.createSvg(userInfo, settings, false);
        f.writeFile('profile-green.svg', svgString4);

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
            'profile-night-rainbow.svg',
            create.createSvg(userInfo, template.NightRainbowSettings, true)
        );
    } catch (error) {
        console.error(error);
        core.setFailed('error');
    }
};

void main();
