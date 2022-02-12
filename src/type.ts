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
    growingAnimation?: boolean;

    contribColors: [string, string, string, string, string];
}

export interface SeasonColorSettings {
    type: 'season';
    backgroundColor: string;
    foregroundColor: string;
    strongColor: string;
    weakColor: string;
    radarColor: string;
    growingAnimation?: boolean;

    /** first season (Mar. - Jun.) */
    contribColors1: [string, string, string, string, string];
    /** second season (Jun. - Sep.) */
    contribColors2: [string, string, string, string, string];
    /** third season (Sep. - Dec.) */
    contribColors3: [string, string, string, string, string];
    /** Fourth season (Dec. - Mar.) */
    contribColors4: [string, string, string, string, string];
}

export interface RainbowColorSettings {
    type: 'rainbow';
    backgroundColor: string;
    foregroundColor: string;
    strongColor: string;
    weakColor: string;
    radarColor: string;
    growingAnimation?: boolean;

    saturation: string;
    contribLightness: [string, string, string, string, string];
    duration: string; // ex. '10s'
    hueRatio: number; // hue per weeks
}

export interface PanelPattern {
    width: number;
    /** array of (number or hex-string) */
    bitmap: (number | string)[];
}

export interface TopPanelPattern extends PanelPattern {
    backgroundColor: string;
    foregroundColor: string;
}

export interface SidePanelPattern extends PanelPattern {
    /** If omitted, calculate from the topPanel backgroundColor */
    backgroundColor?: string;
    /** If omitted, calculate from the topPanel foregroundColor */
    foregroundColor?: string;
}

export interface ContribPattern {
    top: TopPanelPattern;
    left: SidePanelPattern;
    right: SidePanelPattern;
}

export interface BitmapPatternSettings {
    type: 'bitmap';
    backgroundColor: string;
    foregroundColor: string;
    strongColor: string;
    weakColor: string;
    radarColor: string;
    growingAnimation?: boolean;

    contribPatterns: [
        ContribPattern,
        ContribPattern,
        ContribPattern,
        ContribPattern,
        ContribPattern
    ];
}

export type Settings =
    | NormalColorSettings
    | SeasonColorSettings
    | RainbowColorSettings
    | BitmapPatternSettings;
