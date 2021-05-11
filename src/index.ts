import * as core from '@actions/core';
import * as client from './github-graphql';
import * as aggregate from './aggregate-user-info';
import * as create from './create-svg';
import * as f from './file-writer';

export const main = async (): Promise<void> => {
    try {
        const token = process.env.GITHUB_TOKEN;
        if (!token) {
            core.setFailed('GITHUB_TOKEN is empty');
            return;
        }
        const userName = process.env.USERNAME;
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

        const seasonMode = userInfo.isHalloween ? 'halloween' : 'green';

        const svgString1 = create.createSvg(userInfo, 'season', true);
        f.writeFile('profile-season-animate.svg', svgString1);

        const svgString2 = create.createSvg(userInfo, seasonMode, true);
        f.writeFile('profile-green-animate.svg', svgString2);

        const svgString3 = create.createSvg(userInfo, 'season', false);
        f.writeFile('profile-season.svg', svgString3);

        const svgString4 = create.createSvg(userInfo, seasonMode, false);
        f.writeFile('profile-green.svg', svgString4);
    } catch (error) {
        console.error(error);
        core.setFailed('error');
    }
};

void main();
