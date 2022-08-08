import * as d3 from 'd3';
import { JSDOM } from 'jsdom';
import * as contrib from './create-3d-contrib';
import * as pie from './create-pie-language';
import * as radar from './create-radar-contrib';
import * as util from './utils';
import * as type from './type';

const width = 1280;
const height = 850;

const pieHeight = 200 * 1.3;
const pieWidth = pieHeight * 2;

const radarWidth = 400 * 1.3;
const radarHeight = (radarWidth * 3) / 4;
const radarX = width - radarWidth - 40;

export const createSvg = (
    userInfo: type.UserInfo,
    settings: type.Settings,
    isForcedAnimation: boolean
): string => {
    let svgWidth = width;
    let svgHeight = height;
    if (settings.type === 'pie_lang_only') {
        svgWidth = pieWidth;
        svgHeight = pieHeight;
    } else if (settings.type === 'radar_contrib_only') {
        svgWidth = radarWidth;
        svgHeight = radarHeight;
    }

    const fakeDom = new JSDOM(
        '<!DOCTYPE html><html><body><div class="container"></div></body></html>'
    );
    const container = d3.select(fakeDom.window.document).select('.container');
    const svg = container
        .append('svg')
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`);

    svg.append('style').html(
        '* { font-family: "Ubuntu", "Helvetica", "Arial", sans-serif; }'
    );

    contrib.addDefines(svg, settings);

    // background
    svg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .attr('fill', settings.backgroundColor);

    if (settings.type === 'pie_lang_only') {
        // pie chart only
        pie.createPieLanguage(
            svg,
            userInfo,
            0,
            0,
            pieWidth,
            pieHeight,
            settings,
            isForcedAnimation
        );
    } else if (settings.type === 'radar_contrib_only') {
        // radar chart only
        radar.createRadarContrib(
            svg,
            userInfo,
            0,
            0,
            radarWidth,
            radarHeight,
            settings,
            isForcedAnimation
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
            isForcedAnimation
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
            isForcedAnimation
        );

        // pie chart
        pie.createPieLanguage(
            svg,
            userInfo,
            40,
            height - pieHeight - 70,
            pieWidth,
            pieHeight,
            settings,
            isForcedAnimation
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
            .attr('fill', settings.strongColor);

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
            .attr('fill', settings.foregroundColor);

        const positionXStar = (width * 5) / 10;
        const positionYStar = positionYContrib;

        // icon of star
        group
            .append('g')
            .attr(
                'transform',
                `translate(${positionXStar - 32}, ${
                    positionYStar - 28
                }), scale(2)`
            )
            .append('path')
            .attr('fill-rule', 'evenodd')
            .attr(
                'd',
                'M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z'
            )
            .attr('fill', settings.foregroundColor);

        group
            .append('text')
            .style('font-size', '32px')
            .style('font-weight', 'bold')
            .attr('x', positionXStar + 10)
            .attr('y', positionYStar)
            .attr('text-anchor', 'start')
            .text(util.toScale(userInfo.totalStargazerCount))
            .attr('fill', settings.foregroundColor)
            .append('title')
            .text(userInfo.totalStargazerCount);

        const positionXFork = (width * 6) / 10;
        const positionYFork = positionYContrib;

        // icon of fork
        group
            .append('g')
            .attr(
                'transform',
                `translate(${positionXFork - 32}, ${
                    positionYFork - 28
                }), scale(2)`
            )
            .append('path')
            .attr('fill-rule', 'evenodd')
            .attr(
                'd',
                'M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z'
            )
            .attr('fill', settings.foregroundColor);

        group
            .append('text')
            .style('font-size', '32px')
            .style('font-weight', 'bold')
            .attr('x', positionXFork + 4)
            .attr('y', positionYFork)
            .attr('text-anchor', 'start')
            .text(util.toScale(userInfo.totalForkCount))
            .attr('fill', settings.foregroundColor)
            .append('title')
            .text(userInfo.totalForkCount);

        // ISO 8601 format
        const startDate = userInfo.contributionCalendar[0].date;
        const endDate =
            userInfo.contributionCalendar[
                userInfo.contributionCalendar.length - 1
            ].date;
        const period = `${util.toIsoDate(startDate)} / ${util.toIsoDate(
            endDate
        )}`;

        group
            .append('text')
            .style('font-size', '16px')
            .attr('x', width - 20)
            .attr('y', 20)
            .attr('dominant-baseline', 'hanging')
            .attr('text-anchor', 'end')
            .text(period)
            .attr('fill', settings.weakColor);
    }
    return container.html();
};
