"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create3DContrib = void 0;
const d3 = __importStar(require("d3"));
const colors = [
    ['#efefef', '#ffe7ff', '#edaeda', '#e492ca', '#ba7aad'],
    ['#efefef', '#d8e887', '#8cc569', '#47a042', '#1d6a23'],
    ['#efefef', '#ffed4a', '#ffc402', '#fe9400', '#fa6100'],
    ['#efefef', '#666666', '#999999', '#bbbbbb', '#eeeeee'], // winter
];
const diffDate = (beforeDate, afterDate) => {
    return Math.floor((afterDate - beforeDate) / (24 * 60 * 60 * 1000));
};
const getSeason = (month, isSeason) => {
    if (!isSeason) {
        return 1; // summer (as normal)
    }
    switch (month + 1) {
        case 9:
        case 10:
        case 11:
            return 2; // autumn
        case 12:
        case 1:
        case 2:
            return 3; // winter
        case 3:
        case 4:
        case 5:
            return 0; // spring
        case 6:
        case 7:
        case 8:
        default:
            return 1; // summer
    }
};
const createLeftPanelPath = (baseX, baseY, calHeight, dx, dy) => {
    const plainLeft = d3.path();
    plainLeft.moveTo(baseX, baseY);
    plainLeft.lineTo(baseX + dx, baseY + dy);
    plainLeft.lineTo(baseX + dx, baseY + dy - calHeight);
    plainLeft.lineTo(baseX, baseY - calHeight);
    plainLeft.closePath();
    return plainLeft.toString();
};
const createRightPanelPath = (baseX, baseY, calHeight, dx, dy) => {
    const plainRigth = d3.path();
    plainRigth.moveTo(baseX + dx, baseY + dy);
    plainRigth.lineTo(baseX + dx * 2, baseY);
    plainRigth.lineTo(baseX + dx * 2, baseY - calHeight);
    plainRigth.lineTo(baseX + dx, baseY + dy - calHeight);
    plainRigth.closePath();
    return plainRigth.toString();
};
const createTopPanelPath = (baseX, baseY, calHeight, dx, dy) => {
    const plainTop = d3.path();
    plainTop.moveTo(baseX, baseY - calHeight);
    plainTop.lineTo(baseX + dx, baseY + dy - calHeight);
    plainTop.lineTo(baseX + dx * 2, baseY - calHeight);
    plainTop.lineTo(baseX + dx, baseY - dy - calHeight);
    plainTop.closePath();
    return plainTop.toString();
};
const create3DContrib = (svg, userInfo, x, y, width, height, isSeason, isAnimate) => {
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
        const month = cal.date.getUTCMonth();
        const week = Math.floor(diffDate(startTime, cal.date.getTime()) / 7);
        const baseX = offsetX + (week - dayOfWeek) * dx;
        const baseY = offsetY + (week + dayOfWeek) * dy;
        const calHeight = Math.min(50, cal.contributionCount) * 3 + 3; // TODO 仮実装
        const season = getSeason(month, isSeason);
        const colorBase = colors[season][cal.contributionLevel];
        const colorTop = d3.rgb(colorBase);
        const colorRight = d3.rgb(colorBase).darker(0.5);
        const colorLeft = d3.rgb(colorBase).darker(1);
        const plainLeft0 = createRightPanelPath(baseX, baseY, 3, dxx, dyy);
        const plainLeft = createRightPanelPath(baseX, baseY, calHeight, dxx, dyy);
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
                .attr('attributeName', 'd')
                .attr('values', `${plainLeft0};${plainLeft}`)
                .attr('dur', '3s')
                .attr('repeatCount', '1');
        }
        const plainRigth0 = createLeftPanelPath(baseX, baseY, 3, dxx, dyy);
        const plainRight = createLeftPanelPath(baseX, baseY, calHeight, dxx, dyy);
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
                .attr('attributeName', 'd')
                .attr('values', `${plainTop0};${plainTop}`)
                .attr('dur', '3s')
                .attr('repeatCount', '1');
        }
    });
};
exports.create3DContrib = create3DContrib;
//# sourceMappingURL=create-3d-contrib.js.map