export interface CalendarInfo {
    contributionCount: number;
    contributionLevel: number;
    date: Date;
}

export interface LangInfo {
    language: string;
    color: string;
    contributions: number;
}

export interface UserInfo {
    isHalloween: boolean;
    contributionCalendar: Array<CalendarInfo>;
    contributesLanguage: Array<LangInfo>;
    totalContributions: number;
    totalCommitContributions: number;
    totalIssueContributions: number;
    totalPullRequestContributions: number;
    totalPullRequestReviewContributions: number;
    totalRepositoryContributions: number;
    totalForkCount: number;
    totalStargazerCount: number;
}

export type ContributionLevel =
    | 'NONE'
    | 'FIRST_QUARTILE'
    | 'SECOND_QUARTILE'
    | 'THIRD_QUARTILE'
    | 'FOURTH_QUARTILE';

export interface NormalColorSettings {
    type: 'normal';
    backgroundColor: string;
    foregroundColor: string;
    strongColor: string;
    weakColor: string;
    radarColor: string;

    contribColors: [string, string, string, string, string];
}

export interface SeasonColorSettings {
    type: 'season';
    backgroundColor: string;
    foregroundColor: string;
    strongColor: string;
    weakColor: string;
    radarColor: string;

    contribColors1: [string, string, string, string, string];
    contribColors2: [string, string, string, string, string];
    contribColors3: [string, string, string, string, string];
    contribColors4: [string, string, string, string, string];
}

export interface RainbowColorSettings {
    type: 'rainbow';
    backgroundColor: string;
    foregroundColor: string;
    strongColor: string;
    weakColor: string;
    radarColor: string;

    saturation: number;
    contribLightness: [string, string, string, string, string];
    duration: string; // ex. '10s'
    hueRatio: number; // hue per weeks
}

export type Settings =
    | NormalColorSettings
    | SeasonColorSettings
    | RainbowColorSettings;
