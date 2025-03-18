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

export interface RadarContribSettings {
    backgroundColor: string;
    foregroundColor: string;
    weakColor: string;
    radarColor: string;

    growingAnimation?: boolean;

    fileName?: string;

    l10n?: {
        commit: string;
        repo: string;
        review: string;
        pullreq: string;
        issue: string;
    };
}

export interface PieLangSettings {
    backgroundColor: string;
    foregroundColor: string;

    growingAnimation?: boolean;

    fileName?: string;
}

export interface BaseSettings extends RadarContribSettings, PieLangSettings {
    backgroundColor: string;
    foregroundColor: string;
    strongColor: string;
    weakColor: string;
    radarColor: string;

    growingAnimation?: boolean;

    fileName?: string;

    l10n?: {
        commit: string;
        repo: string;
        review: string;
        pullreq: string;
        issue: string;
        contrib: string;
    };
}

export interface NormalColorSettings extends BaseSettings {
    type: 'normal';

    contribColors: [string, string, string, string, string];

    darkMode?: NormalColorSettings;
}

export interface SeasonColorSettings extends BaseSettings {
    type: 'season';

    /** first season (Mar. - Jun.) */
    contribColors1: [string, string, string, string, string];
    /** second season (Jun. - Sep.) */
    contribColors2: [string, string, string, string, string];
    /** third season (Sep. - Dec.) */
    contribColors3: [string, string, string, string, string];
    /** Fourth season (Dec. - Mar.) */
    contribColors4: [string, string, string, string, string];

    darkMode?: SeasonColorSettings;
}

export interface RainbowColorSettings extends BaseSettings {
    type: 'rainbow';

    saturation: string;
    contribLightness: [string, string, string, string, string];
    duration: string; // ex. '10s'
    hueRatio: number; // hue per weeks

    darkMode?: RainbowColorSettings;
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

export interface BitmapPatternSettings extends BaseSettings {
    type: 'bitmap';
    growingAnimation?: boolean;

    contribPatterns: [
        ContribPattern,
        ContribPattern,
        ContribPattern,
        ContribPattern,
        ContribPattern,
    ];

    darkMode?: BitmapPatternSettings;
}

export interface PieLangOnlySettings extends PieLangSettings {
    type: 'pie_lang_only';

    darkMode?: PieLangOnlySettings;

}

export interface RadarContribOnlySettings extends RadarContribSettings {
    type: 'radar_contrib_only';

    darkMode?: RadarContribOnlySettings;
}

export type FullSettings =
    | NormalColorSettings
    | SeasonColorSettings
    | RainbowColorSettings
    | BitmapPatternSettings;

export type Settings =
    | FullSettings
    | PieLangOnlySettings
    | RadarContribOnlySettings;

export type SettingFile = Settings | Settings[];
