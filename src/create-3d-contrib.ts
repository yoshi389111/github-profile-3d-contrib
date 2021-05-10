import * as d3 from 'd3';
import * as type from './type';

const colors = [
    ['#efefef', '#ffe7ff', '#edaeda', '#e492ca', '#ba7aad'], // spring
    ['#efefef', '#d8e887', '#8cc569', '#47a042', '#1d6a23'], // summer
    ['#efefef', '#ffed4a', '#ffc402', '#fe9400', '#fa6100'], // autumn
    ['#efefef', '#999999', '#cccccc', '#dddddd', '#eeeeee'], // winter
];

const diffDate = (beforeDate: number, afterDate: number): number => {
    return Math.floor((afterDate - beforeDate) / (24 * 60 * 60 * 1000));
};

const createGradation = (
    dayOfMonth: number,
    color1: string,
    color2: string,
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
}

const decideColor = (
    date: Date,
    contributionLevel: number,
    isSeason: boolean
): string => {
    if (!isSeason) {
        // summer (as normal)
        return colors[1][contributionLevel];
    }

    const sunday = new Date(date.getTime());
    sunday.setDate(sunday.getDate() - sunday.getDay());

    const month = sunday.getUTCMonth();
    const dayOfMonth = sunday.getUTCDate();

    switch (month + 1) {
        case 9:
            // summer -> autumn
            return createGradation(
                dayOfMonth,
                colors[1][contributionLevel],
                colors[2][contributionLevel]
            );
        case 10:
        case 11:
            // autumn
            return colors[2][contributionLevel];

        case 12:
            // autumn -> winter
            return createGradation(
                dayOfMonth,
                colors[2][contributionLevel],
                colors[3][contributionLevel]
            );
        case 1:
        case 2:
            // winter
            return colors[3][contributionLevel];

        case 3:
            // winter -> spring
            return createGradation(
                dayOfMonth,
                colors[3][contributionLevel],
                colors[0][contributionLevel]
            );
        case 4:
        case 5:
            // spring
            return colors[0][contributionLevel];

        case 6:
            // spring -> summer
            return createGradation(
                dayOfMonth,
                colors[0][contributionLevel],
                colors[1][contributionLevel]
            );
        case 7:
        case 8:
        default:
            // summer
            return colors[1][contributionLevel];
    }
}

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

export const create3DContrib = (
    svg: d3.Selection<SVGSVGElement, unknown, null, unknown>,
    userInfo: type.UserInfo,
    x: number,
    y: number,
    width: number,
    height: number,
    isSeason: boolean,
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
        const dayOfWeek = cal.date.getUTCDay(); // sun = 0, mnn = 1, ...
        const week = Math.floor(diffDate(startTime, cal.date.getTime()) / 7);

        const baseX = offsetX + (week - dayOfWeek) * dx;
        const baseY = offsetY + (week + dayOfWeek) * dy;
        const calHeight = Math.min(50, cal.contributionCount) * 3 + 3; // TODO 仮実装

        const colorBase = decideColor(cal.date, cal.contributionLevel, isSeason);
        const colorTop = d3.rgb(colorBase);
        const colorRight = d3.rgb(colorBase).darker(0.5);
        const colorLeft = d3.rgb(colorBase).darker(1);

        const plainLeft0 = createRightPanelPath(baseX, baseY, 3, dxx, dyy);
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
            .attr('stroke', colorLeft.toString())
            .attr('stroke-width', '0px')
            .attr('fill', colorLeft.toString());
        if (isAnimate) {
            pathLeft
                .append('animate')
                .attr('attributeName', 'd')
                .attr('values', `${plainLeft0};${plainLeft}`)
                .attr('dur', '3s')
                .attr('repeatCount', '1');
        }

        const plainRigth0 = createLeftPanelPath(baseX, baseY, 3, dxx, dyy);
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
            .attr('stroke', colorRight.toString())
            .attr('stroke-width', '0px')
            .attr('fill', colorRight.toString());
        if (isAnimate) {
            pathRight
                .append('animate')
                .attr('attributeName', 'd')
                .attr('values', `${plainRigth0};${plainRight}`)
                .attr('dur', '3s')
                .attr('repeatCount', '1');
        }

        const plainTop0 = createTopPanelPath(baseX, baseY, 3, dxx, dyy);
        const plainTop = createTopPanelPath(baseX, baseY, calHeight, dxx, dyy);
        const pathTop = group
            .append('path')
            .attr('d', plainTop)
            .attr('stroke', colorTop.toString())
            .attr('stroke-width', '0px')
            .attr('fill', colorTop.toString())
            .append('animate');
        if (isAnimate) {
            pathTop
                .attr('attributeName', 'd')
                .attr('values', `${plainTop0};${plainTop}`)
                .attr('dur', '3s')
                .attr('repeatCount', '1');
        }
    });
};
