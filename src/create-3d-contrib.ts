import * as d3 from 'd3';
import * as util from './utils';
import * as type from './type';

const ANGLE = 30;
const DARKER_RIGHT = 1;
const DARKER_LEFT = 0.5;
const DARKER_TOP = 0;

const diffDate = (beforeDate: number, afterDate: number): number =>
    Math.floor((afterDate - beforeDate) / (24 * 60 * 60 * 1000));

const createGradation = (
    dayOfMonth: number,
    color1: string,
    color2: string
): string => {
    let ratio;
    if (dayOfMonth <= 7) {
        ratio = 0.2;
    } else if (dayOfMonth <= 14) {
        ratio = 0.4;
    } else if (dayOfMonth <= 21) {
        ratio = 0.6;
    } else if (dayOfMonth <= 28) {
        ratio = 0.8;
    } else {
        return color2;
    }
    const color = d3.interpolate(color1, color2);
    return color(ratio);
};

const decideSeasonColor = (
    contributionLevel: number,
    settings: type.SeasonColorSettings,
    date: Date
): string => {
    const sunday = new Date(date.getTime());
    sunday.setDate(sunday.getDate() - sunday.getDay());

    const month = sunday.getUTCMonth();
    const dayOfMonth = sunday.getUTCDate();

    switch (month + 1) {
        case 9:
            // summer -> autumn
            return createGradation(
                dayOfMonth,
                settings.contribColors2[contributionLevel],
                settings.contribColors3[contributionLevel]
            );
        case 10:
        case 11:
            // autumn
            return settings.contribColors3[contributionLevel];

        case 12:
            // autumn -> winter
            return createGradation(
                dayOfMonth,
                settings.contribColors3[contributionLevel],
                settings.contribColors4[contributionLevel]
            );
        case 1:
        case 2:
            // winter
            return settings.contribColors4[contributionLevel];

        case 3:
            // winter -> spring
            return createGradation(
                dayOfMonth,
                settings.contribColors4[contributionLevel],
                settings.contribColors1[contributionLevel]
            );
        case 4:
        case 5:
            // spring
            return settings.contribColors1[contributionLevel];

        case 6:
            // spring -> summer
            return createGradation(
                dayOfMonth,
                settings.contribColors1[contributionLevel],
                settings.contribColors2[contributionLevel]
            );
        case 7:
        case 8:
        default:
            // summer
            return settings.contribColors2[contributionLevel];
    }
};

const addNormalColor = (
    path: d3.Selection<SVGRectElement, unknown, null, unknown>,
    contributionLevel: number,
    settings: type.NormalColorSettings,
    darker: number
): void => {
    const color = settings.contribColors[contributionLevel];
    path.attr('fill', d3.rgb(color).darker(darker).toString());
};

const addSeasonColor = (
    path: d3.Selection<SVGRectElement, unknown, null, unknown>,
    contributionLevel: number,
    settings: type.SeasonColorSettings,
    darker: number,
    date: Date
): void => {
    const color = decideSeasonColor(contributionLevel, settings, date);
    path.attr('fill', d3.rgb(color).darker(darker).toString());
};

const addRainbowColor = (
    path: d3.Selection<SVGRectElement, unknown, null, unknown>,
    contributionLevel: number,
    settings: type.RainbowColorSettings,
    darker: number,
    week: number
): void => {
    const offsetHue = week * settings.hueRatio;
    const saturation = settings.saturation;
    const lightness = settings.contribLightness[contributionLevel];
    const values = [...Array<undefined>(7)]
        .map((_, i) => (i * 60 + offsetHue) % 360)
        .map((hue) => `hsl(${hue},${saturation},${lightness})`)
        .map((c) => d3.rgb(c).darker(darker).toString())
        .join(';');

    path.append('animate')
        .attr('attributeName', 'fill')
        .attr('values', values)
        .attr('dur', settings.duration)
        .attr('repeatCount', 'indefinite');
};

type PanelType = 'top' | 'left' | 'right';

const addBitmapPattern = (
    path: d3.Selection<SVGRectElement, unknown, null, unknown>,
    contributionLevel: number,
    panel: PanelType
): void => {
    path.attr('fill', `url(#pattern_${contributionLevel}_${panel})`);
};

const atan = (value: number) => (Math.atan(value) * 360) / 2 / Math.PI;

const addPatternForBitmap = (
    defs: d3.Selection<SVGDefsElement, unknown, null, unknown>,
    panelPattern: type.PanelPattern,
    contributionLevel: number,
    panel: PanelType,
    backgroundColor: string,
    foregroundColor: string
): void => {
    const width = Math.max(1, panelPattern.width);
    const height = Math.max(1, panelPattern.bitmap.length);
    const pattern = defs
        .append('pattern')
        .attr('id', `pattern_${contributionLevel}_${panel}`)
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height)
        .attr('patternUnits', 'userSpaceOnUse');
    pattern
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height)
        .attr('fill', backgroundColor);
    const path = d3.path();
    for (const [y, bitmapValue] of panelPattern.bitmap.entries()) {
        const bitmap =
            typeof bitmapValue === 'string'
                ? parseInt(bitmapValue, 16)
                : bitmapValue;
        for (let x = 0; x < width; x++) {
            if ((bitmap & (1 << (width - x - 1))) !== 0) {
                path.rect(x, y, 1, 1);
            }
        }
    }
    pattern
        .append('path')
        .attr('stroke', 'none')
        .attr('fill', foregroundColor)
        .attr('d', path.toString());
};

export const addDefines = (
    svg: d3.Selection<SVGSVGElement, unknown, null, unknown>,
    settings: type.Settings
): void => {
    if (settings.type === 'bitmap') {
        const defs = svg.append('defs');

        for (const [contribLevel, info] of settings.contribPatterns.entries()) {
            addPatternForBitmap(
                defs,
                info.top,
                contribLevel,
                'top',
                info.top.backgroundColor,
                info.top.foregroundColor
            );

            addPatternForBitmap(
                defs,
                info.left,
                contribLevel,
                'left',
                info.left.backgroundColor ||
                    d3
                        .rgb(info.top.backgroundColor)
                        .darker(DARKER_LEFT)
                        .toString(),
                info.left.foregroundColor ||
                    d3
                        .rgb(info.top.foregroundColor)
                        .darker(DARKER_LEFT)
                        .toString()
            );

            addPatternForBitmap(
                defs,
                info.right,
                contribLevel,
                'right',
                info.right.backgroundColor ||
                    d3
                        .rgb(info.top.backgroundColor)
                        .darker(DARKER_RIGHT)
                        .toString(),
                info.right.foregroundColor ||
                    d3
                        .rgb(info.top.foregroundColor)
                        .darker(DARKER_RIGHT)
                        .toString()
            );
        }
    }
};

export const create3DContrib = (
    svg: d3.Selection<SVGSVGElement, unknown, null, unknown>,
    userInfo: type.UserInfo,
    x: number,
    y: number,
    width: number,
    height: number,
    settings: type.FullSettings,
    isForcedAnimation = false
): void => {
    if (userInfo.contributionCalendar.length === 0) {
        return;
    }

    const startTime = userInfo.contributionCalendar[0].date.getTime();
    const dx = width / 64;
    const dy = dx * Math.tan(ANGLE * ((2 * Math.PI) / 360));
    const weekcount = Math.ceil(userInfo.contributionCalendar.length / 7.0);
    const dxx = dx * 0.9;
    const dyy = dy * 0.9;

    const offsetX = dx * 7;
    const offsetY = height - (weekcount + 7) * dy;

    const group = svg.append('g');

    userInfo.contributionCalendar.forEach((cal) => {
        const dayOfWeek = cal.date.getUTCDay(); // sun = 0, mon = 1, ...
        const week = Math.floor(diffDate(startTime, cal.date.getTime()) / 7);

        const baseX = offsetX + (week - dayOfWeek) * dx;
        const baseY = offsetY + (week + dayOfWeek) * dy;
        // ref. https://github.com/yoshi389111/github-profile-3d-contrib/issues/27
        const calHeight = Math.log10(cal.contributionCount / 20 + 1) * 144 + 3;
        const contribLevel = cal.contributionLevel;

        const isAnimate = settings.growingAnimation || isForcedAnimation;

        const bar = group
            .append('g')
            .attr(
                'transform',
                `translate(${util.toFixed(baseX)} ${util.toFixed(
                    baseY - calHeight
                )})`
            );
        if (isAnimate && contribLevel !== 0) {
            bar.append('animateTransform')
                .attr('attributeName', 'transform')
                .attr('type', 'translate')
                .attr(
                    'values',
                    `${util.toFixed(baseX)} ${util.toFixed(
                        baseY - 3
                    )};${util.toFixed(baseX)} ${util.toFixed(
                        baseY - calHeight
                    )}`
                )
                .attr('dur', '3s')
                .attr('repeatCount', '1');
        }

        const widthTop =
            settings.type === 'bitmap'
                ? Math.max(1, settings.contribPatterns[contribLevel].top.width)
                : dxx;
        const topPanel = bar
            .append('rect')
            .attr('stroke', 'none')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', util.toFixed(widthTop))
            .attr('height', util.toFixed(widthTop))
            .attr(
                'transform',
                `skewY(${-ANGLE}) skewX(${util.toFixed(
                    atan(dxx / 2 / dyy)
                )}) scale(${util.toFixed(dxx / widthTop)} ${util.toFixed(
                    (2 * dyy) / widthTop
                )})`
            );

        if (settings.type === 'normal') {
            addNormalColor(topPanel, contribLevel, settings, DARKER_TOP);
        } else if (settings.type === 'season') {
            addSeasonColor(
                topPanel,
                contribLevel,
                settings,
                DARKER_TOP,
                cal.date
            );
        } else if (settings.type === 'rainbow') {
            addRainbowColor(topPanel, contribLevel, settings, DARKER_TOP, week);
        } else if (settings.type === 'bitmap') {
            addBitmapPattern(topPanel, contribLevel, 'top');
        }

        const widthLeft =
            settings.type === 'bitmap'
                ? Math.max(1, settings.contribPatterns[contribLevel].left.width)
                : dxx;
        const scaleLeft = Math.sqrt(dxx ** 2 + dyy ** 2) / widthLeft;
        const heightLeft = calHeight / scaleLeft;
        const leftPanel = bar
            .append('rect')
            .attr('stroke', 'none')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', util.toFixed(widthLeft))
            .attr('height', util.toFixed(heightLeft))
            .attr(
                'transform',
                `skewY(${ANGLE}) scale(${util.toFixed(
                    dxx / widthLeft
                )} ${util.toFixed(scaleLeft)})`
            );

        if (settings.type === 'normal') {
            addNormalColor(leftPanel, contribLevel, settings, DARKER_LEFT);
        } else if (settings.type === 'season') {
            addSeasonColor(
                leftPanel,
                contribLevel,
                settings,
                DARKER_LEFT,
                cal.date
            );
        } else if (settings.type === 'rainbow') {
            addRainbowColor(
                leftPanel,
                contribLevel,
                settings,
                DARKER_LEFT,
                week
            );
        } else if (settings.type === 'bitmap') {
            addBitmapPattern(leftPanel, contribLevel, 'left');
        }
        if (isAnimate && contribLevel !== 0) {
            leftPanel
                .append('animate')
                .attr('attributeName', 'height')
                .attr(
                    'values',
                    `${util.toFixed(3 / scaleLeft)};${util.toFixed(heightLeft)}`
                )
                .attr('dur', '3s')
                .attr('repeatCount', '1');
        }

        const widthRight =
            settings.type === 'bitmap'
                ? Math.max(
                      1,
                      settings.contribPatterns[contribLevel].right.width
                  )
                : dxx;
        const scaleRight = Math.sqrt(dxx ** 2 + dyy ** 2) / widthRight;
        const heightRight = calHeight / scaleRight;
        const rightPanel = bar
            .append('rect')
            .attr('stroke', 'none')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', util.toFixed(widthRight))
            .attr('height', util.toFixed(heightRight))
            .attr(
                'transform',
                `translate(${util.toFixed(dxx)} ${util.toFixed(
                    dyy
                )}) skewY(${-ANGLE}) scale(${util.toFixed(
                    dxx / widthRight
                )} ${util.toFixed(scaleRight)})`
            );

        if (settings.type === 'normal') {
            addNormalColor(rightPanel, contribLevel, settings, DARKER_RIGHT);
        } else if (settings.type === 'season') {
            addSeasonColor(
                rightPanel,
                contribLevel,
                settings,
                DARKER_RIGHT,
                cal.date
            );
        } else if (settings.type === 'rainbow') {
            addRainbowColor(
                rightPanel,
                contribLevel,
                settings,
                DARKER_RIGHT,
                week
            );
        } else if (settings.type === 'bitmap') {
            addBitmapPattern(rightPanel, contribLevel, 'right');
        }
        if (isAnimate && contribLevel !== 0) {
            rightPanel
                .append('animate')
                .attr('attributeName', 'height')
                .attr(
                    'values',
                    `${util.toFixed(3 / scaleRight)};${util.toFixed(
                        heightRight
                    )}`
                )
                .attr('dur', '3s')
                .attr('repeatCount', '1');
        }
    });
};
