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

export type SeasonMode = 'season' | 'green' | 'halloween';
