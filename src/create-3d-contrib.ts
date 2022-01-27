import * as d3 from 'd3';
import * as type from './type';

const darkerLeft = 1;
const darkerRight = 0.5;
const darkerTop = 0;

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

const createLeftPanelPath = (
    baseX: number,
    baseY: number,
    calHeight: number,
    dx: number,
    dy: number
): string => {
    const plainLeft = d3.path();
    plainLeft.moveTo(baseX, baseY);
    plainLeft.lineTo(baseX + dx, baseY + dy);
    plainLeft.lineTo(baseX + dx, baseY + dy - calHeight);
    plainLeft.lineTo(baseX, baseY - calHeight);
    plainLeft.closePath();
    return plainLeft.toString();
};

const createRightPanelPath = (
    baseX: number,
    baseY: number,
    calHeight: number,
    dx: number,
    dy: number
): string => {
    const plainRigth = d3.path();
    plainRigth.moveTo(baseX + dx, baseY + dy);
    plainRigth.lineTo(baseX + dx * 2, baseY);
    plainRigth.lineTo(baseX + dx * 2, baseY - calHeight);
    plainRigth.lineTo(baseX + dx, baseY + dy - calHeight);
    plainRigth.closePath();
    return plainRigth.toString();
};

const createTopPanelPath = (
    baseX: number,
    baseY: number,
    calHeight: number,
    dx: number,
    dy: number
): string => {
    const plainTop = d3.path();
    plainTop.moveTo(baseX, baseY - calHeight);
    plainTop.lineTo(baseX + dx, baseY + dy - calHeight);
    plainTop.lineTo(baseX + dx * 2, baseY - calHeight);
    plainTop.lineTo(baseX + dx, baseY - dy - calHeight);
    plainTop.closePath();
    return plainTop.toString();
};

const addNormalColor = (
    path: d3.Selection<SVGPathElement, unknown, null, unknown>,
    contributionLevel: number,
    settings: type.NormalColorSettings,
    darker: number
): void => {
    const color = settings.contribColors[contributionLevel];
    path.attr('fill', d3.rgb(color).darker(darker).toString());
};

const addSeasonColor = (
    path: d3.Selection<SVGPathElement, unknown, null, unknown>,
    contributionLevel: number,
    settings: type.SeasonColorSettings,
    darker: number,
    date: Date
): void => {
    const color = decideSeasonColor(contributionLevel, settings, date);
    path.attr('fill', d3.rgb(color).darker(darker).toString());
};

const addRainbowColor = (
    path: d3.Selection<SVGPathElement, unknown, null, unknown>,
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
        .map((hue) => `hsl(${hue},${saturation}%,${lightness})`)
        .map((c) => d3.rgb(c).darker(darker).toString())
        .join(';');

    path.append('animate')
        .attr('attributeName', 'fill')
        .attr('values', values)
        .attr('dur', settings.duration)
        .attr('repeatCount', 'indefinite');
};

export const create3DContrib = (
    svg: d3.Selection<SVGSVGElement, unknown, null, unknown>,
    userInfo: type.UserInfo,
    x: number,
    y: number,
    width: number,
    height: number,
    settings: type.Settings,
    isAnimate: boolean
): void => {
    if (userInfo.contributionCalendar.length === 0) {
        return;
    }

    const startTime = userInfo.contributionCalendar[0].date.getTime();
    const dx = width / 64;
    const dy = dx / Math.sqrt(3);
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
        const calHeight = Math.log10(cal.contributionCount / 20 + 1) * 144 + 3;

        const plainLeft = createRightPanelPath(
            baseX,
            baseY,
            calHeight,
            dxx,
            dyy
        );
        const pathLeft = group
            .append('path')
            .attr('d', plainLeft)
            .attr('stroke-width', '0px');
        if (settings.type === 'normal') {
            addNormalColor(
                pathLeft,
                cal.contributionLevel,
                settings,
                darkerLeft
            );
        } else if (settings.type === 'season') {
            addSeasonColor(
                pathLeft,
                cal.contributionLevel,
                settings,
                darkerLeft,
                cal.date
            );
        } else if (settings.type === 'rainbow') {
            addRainbowColor(
                pathLeft,
                cal.contributionLevel,
                settings,
                darkerLeft,
                week
            );
        }
        if (isAnimate) {
            const plainLeft0 = createRightPanelPath(baseX, baseY, 3, dxx, dyy);
            pathLeft
                .append('animate')
                .attr('attributeName', 'd')
                .attr('values', `${plainLeft0};${plainLeft}`)
                .attr('dur', '3s')
                .attr('repeatCount', '1');
        }

        const plainRight = createLeftPanelPath(
            baseX,
            baseY,
            calHeight,
            dxx,
            dyy
        );
        const pathRight = group
            .append('path')
            .attr('d', plainRight)
            .attr('stroke-width', '0px');
        if (settings.type === 'normal') {
            addNormalColor(
                pathRight,
                cal.contributionLevel,
                settings,
                darkerRight
            );
        } else if (settings.type === 'season') {
            addSeasonColor(
                pathRight,
                cal.contributionLevel,
                settings,
                darkerRight,
                cal.date
            );
        } else if (settings.type === 'rainbow') {
            addRainbowColor(
                pathRight,
                cal.contributionLevel,
                settings,
                darkerRight,
                week
            );
        }
        if (isAnimate) {
            const plainRigth0 = createLeftPanelPath(baseX, baseY, 3, dxx, dyy);
            pathRight
                .append('animate')
                .attr('attributeName', 'd')
                .attr('values', `${plainRigth0};${plainRight}`)
                .attr('dur', '3s')
                .attr('repeatCount', '1');
        }

        const plainTop = createTopPanelPath(baseX, baseY, calHeight, dxx, dyy);
        const pathTop = group
            .append('path')
            .attr('d', plainTop)
            .attr('stroke-width', '0px');
        if (settings.type === 'normal') {
            addNormalColor(pathTop, cal.contributionLevel, settings, darkerTop);
        } else if (settings.type === 'season') {
            addSeasonColor(
                pathTop,
                cal.contributionLevel,
                settings,
                darkerTop,
                cal.date
            );
        } else if (settings.type === 'rainbow') {
            addRainbowColor(
                pathTop,
                cal.contributionLevel,
                settings,
                darkerTop,
                week
            );
        }
        if (isAnimate) {
            const plainTop0 = createTopPanelPath(baseX, baseY, 3, dxx, dyy);
            pathTop
                .append('animate')
                .attr('attributeName', 'd')
                .attr('values', `${plainTop0};${plainTop}`)
                .attr('dur', '3s')
                .attr('repeatCount', '1');
        }
    });
};
