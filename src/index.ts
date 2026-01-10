import * as core from '@actions/core';
import * as aggregate from './aggregate-user-info';
import * as template from './color-template';
import * as create from './create-svg';
import * as f from './file-writer';
import * as r from './settings-reader';
import * as client from './github-graphql';

const parseDateFromEnv = (value: string, label: string): Date | null => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        core.setFailed(`${label} is invalid`);
        return null;
    }
    return date;
};

const DAY_MS = 24 * 60 * 60 * 1000;

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
        const year = process.env.YEAR ? Number(process.env.YEAR) : null;
        if (Number.isNaN(year)) {
            core.setFailed('YEAR is NaN');
            return;
        }

        const calendarStartEnv = process.env.CALENDAR_START_DATE;
        const calendarEndEnv = process.env.CALENDAR_END_DATE;
        let calendarRange: client.CalendarRangeArgs | undefined;

        if (calendarStartEnv) {
            const userStartDate = parseDateFromEnv(
                calendarStartEnv,
                'CALENDAR_START_DATE',
            );
            if (!userStartDate) {
                return;
            }
            const endDate = calendarEndEnv
                ? parseDateFromEnv(
                      calendarEndEnv,
                      'CALENDAR_END_DATE',
                  )
                : new Date();
            if (!endDate) {
                return;
            }
            if (userStartDate > endDate) {
                core.setFailed(
                    'CALENDAR_START_DATE must be on or before CALENDAR_END_DATE',
                );
                return;
            }

            // GitHub GraphQL rejects contribution ranges spanning > 1 year.
            // Keep the graph up to date by ending at `endDate` (defaults to now), and shifting the start forward when needed.
            // Also avoid showing "pre-history" null days by never starting earlier than the user-provided start.
            const rollingStartDate = new Date(endDate.getTime() - 364 * DAY_MS);
            const effectiveStartDate =
                userStartDate > rollingStartDate
                    ? userStartDate
                    : rollingStartDate;
            if (effectiveStartDate.getTime() !== userStartDate.getTime()) {
                core.info(
                    `CALENDAR_START_DATE adjusted to ${effectiveStartDate.toISOString()} to satisfy GitHub's 1-year limit`,
                );
            }

            calendarRange = {
                from: effectiveStartDate.toISOString(),
                to: endDate.toISOString(),
            };
        } else if (year !== null) {
            const startOfYear = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
            const endOfYear = new Date(
                Date.UTC(year, 11, 31, 23, 59, 59),
            );
            calendarRange = {
                from: startOfYear.toISOString(),
                to: endOfYear.toISOString(),
            };
        }

        const response = await client.fetchData(
            token,
            userName,
            maxRepos,
            calendarRange,
        );
        const isRateLimitError = (msg?: string) => {
            if (!msg) return false;
            return /rate limit|rateLimit|exceeded/i.test(msg);
        };

        if (!response || !response.data) {
            if (response && response.errors && response.errors.length) {
                const msg = response.errors[0].message || '';
                if (isRateLimitError(msg)) {
                    core.info('GitHub GraphQL rate limit exceeded: ' + msg);
                    // exit gracefully so workflows don't crash.
                    return;
                }
                core.setFailed(response.errors[0].message);
            } else {
                console.error('Empty GraphQL response:', JSON.stringify(response, null, 2));
                core.setFailed('Empty GraphQL response');
            }
            return;
        }
        if (!response.data.user) {
            // If the API responded with errors, treat rate-limit specially.
            const errMsg = response.errors && response.errors.length ? response.errors[0].message : undefined;
            if (isRateLimitError(errMsg)) {
                core.info('GitHub GraphQL rate limit exceeded: ' + errMsg);
                return;
            }
            console.error('GraphQL response missing `user` field:', JSON.stringify(response, null, 2));
            core.setFailed('GraphQL response missing `user` — check USERNAME and token');
            return;
        }
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
                    create.createSvg(userInfo, settingInfo, false),
                );
            }
        } else {
            const settings = userInfo.isHalloween
                ? template.HalloweenSettings
                : template.NormalSettings;

            f.writeFile(
                'profile-green-animate.svg',
                create.createSvg(userInfo, settings, true),
            );
            f.writeFile(
                'profile-green.svg',
                create.createSvg(userInfo, settings, false),
            );

            // Northern hemisphere
            f.writeFile(
                'profile-season-animate.svg',
                create.createSvg(userInfo, template.NorthSeasonSettings, true),
            );
            f.writeFile(
                'profile-season.svg',
                create.createSvg(userInfo, template.NorthSeasonSettings, false),
            );

            // Southern hemisphere
            f.writeFile(
                'profile-south-season-animate.svg',
                create.createSvg(userInfo, template.SouthSeasonSettings, true),
            );
            f.writeFile(
                'profile-south-season.svg',
                create.createSvg(userInfo, template.SouthSeasonSettings, false),
            );

            f.writeFile(
                'profile-night-view.svg',
                create.createSvg(userInfo, template.NightViewSettings, true),
            );

            f.writeFile(
                'profile-night-green.svg',
                create.createSvg(userInfo, template.NightGreenSettings, true),
            );

            f.writeFile(
                'profile-night-rainbow.svg',
                create.createSvg(userInfo, template.NightRainbowSettings, true),
            );

            f.writeFile(
                'profile-gitblock.svg',
                create.createSvg(userInfo, template.GitBlockSettings, true),
            );
        }
    } catch (error) {
        console.error(error);
        core.setFailed('error');
    }
};

void main();
