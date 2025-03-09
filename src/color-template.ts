import * as type from './type';

import normalSettings from './settings/NormalSettings.json';
export const NormalSettings = normalSettings as type.NormalColorSettings;

import halloweenSettings from './settings/HalloweenSettings.json';
export const HalloweenSettings = halloweenSettings as type.NormalColorSettings;

// Northern hemisphere
import northSeasonSettings from './settings/NorthSeasonSettings.json';
export const NorthSeasonSettings =
    northSeasonSettings as type.SeasonColorSettings;

// Southern hemisphere
import southSeasonSettings from './settings/SouthSeasonSettings.json';
export const SouthSeasonSettings =
    southSeasonSettings as type.SeasonColorSettings;

import nightViewSettings from './settings/NightViewSettings.json';
export const NightViewSettings = nightViewSettings as type.NormalColorSettings;

import nightGreenSettings from './settings/NightGreenSettings.json';
export const NightGreenSettings =
    nightGreenSettings as type.NormalColorSettings;

import nightRainbowSettings from './settings/NightRainbowSettings.json';
export const NightRainbowSettings =
    nightRainbowSettings as type.RainbowColorSettings;

import gitBlockSettings from './settings/GitBlockSettings.json';
export const GitBlockSettings = gitBlockSettings as type.BitmapPatternSettings;
