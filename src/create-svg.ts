import * as d3 from 'd3';
import { JSDOM } from 'jsdom';
import * as contrib from './create-3d-contrib';
// pie chart removed — not useful with mostly private repos
import * as radar from './create-radar-contrib';
import * as colors from './create-css-colors';
import * as util from './utils';
import * as type from './type';

const width = 1280;
const height = 850;

const radarWidth = 400 * 1.3;
const radarHeight = (radarWidth * 3) / 4;
const radarX = width - radarWidth - 40;

export const createSvg = (
    userInfo: type.UserInfo,
    settings: type.Settings,
    isForcedAnimation: boolean,
): string => {
    let svgWidth = width;
    let svgHeight = height;
    if (settings.type === 'radar_contrib_only') {
        svgWidth = radarWidth;
        svgHeight = radarHeight;
    }

    const fakeDom = new JSDOM(
        '<!DOCTYPE html><html><body><div class="container"></div></body></html>',
    );
    const container = d3.select(fakeDom.window.document).select('.container');
    const svg = container
        .append('svg')
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`);

    svg.append('style').html(
        [
            '* { font-family: "Ubuntu", "Helvetica", "Arial", sans-serif; }',
            colors.createCssColors(settings),
        ].join('\n'),
    );

    contrib.addDefines(svg, settings);

    // background
    svg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .attr('class', 'fill-bg');

    if (settings.type === 'radar_contrib_only') {
        // radar chart only
        radar.createRadarContrib(
            svg,
            userInfo,
            0,
            0,
            radarWidth,
            radarHeight,
            settings,
            isForcedAnimation,
        );
    } else {
        // 3D-Contrib Calendar
        contrib.create3DContrib(
            svg,
            userInfo,
            0,
            0,
            width,
            height,
            settings,
            isForcedAnimation,
        );

        // radar chart
        radar.createRadarContrib(
            svg,
            userInfo,
            radarX,
            70,
            radarWidth,
            radarHeight,
            settings,
            isForcedAnimation,
        );

        const group = svg.append('g');

        const positionXContrib = (width * 3) / 10;
        const positionYContrib = height - 20;

        group
            .append('text')
            .style('font-size', '32px')
            .style('font-weight', 'bold')
            .attr('x', positionXContrib)
            .attr('y', positionYContrib)
            .attr('text-anchor', 'end')
            .text(util.inertThousandSeparator(userInfo.totalContributions))
            .attr('class', 'fill-strong');

        const contribLabel = settings.l10n
            ? settings.l10n.contrib
            : 'contributions';
        group
            .append('text')
            .style('font-size', '24px')
            .attr('x', positionXContrib + 10)
            .attr('y', positionYContrib)
            .attr('text-anchor', 'start')
            .attr('text-anchor', 'start')
            .text(contribLabel)
            .attr('class', 'fill-fg');

        // ISO 8601 format
        const startDate = userInfo.contributionCalendar[0].date;
        const endDate =
            userInfo.contributionCalendar[
                userInfo.contributionCalendar.length - 1
            ].date;
        const period = `${util.toIsoDate(startDate)} / ${util.toIsoDate(
            endDate,
        )}`;

        group
            .append('text')
            .style('font-size', '16px')
            .attr('x', width - 20)
            .attr('y', 20)
            .attr('dominant-baseline', 'hanging')
            .attr('text-anchor', 'end')
            .text(period)
            .attr('class', 'fill-weak');
    }
    return container.html();
};
