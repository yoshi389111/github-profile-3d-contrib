export interface CalendarInfo {
    contributionCount: number,
    contributionLevel: number,
    date: Date,
}

export interface LangInfo {
    language: string,
    color: string,
    contributions: number,
}

export interface UserInfo {
    contributionCalendar: Array<CalendarInfo>;
    contributesLanguage: Array<LangInfo>;
    totalContributions: number;
    totalCommitContributions: number;
    totalIssueContributions: number;
    totalPullRequestContributions: number;
    totalPullRequestReviewContributions: number;
    totalRepositoryContributions: number;
    totalForkCount: number,
    totalStargazerCount: number,
};
