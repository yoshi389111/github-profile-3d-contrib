import * as d3 from 'd3';
import { JSDOM } from 'jsdom';
import * as contrib from './create-3d-contrib';
import * as pie from './create-pie-language';
import * as radar from './create-radar-contrib';
import * as type from './type';

const bgcolor = '#ffffff';
const width = 1280;
const height = 850;

export const createSvg = (userInfo: type.UserInfo): string => {
    const fakeDom = new JSDOM(
        '<!DOCTYPE html><html><body><div class="container"></div></body></html>'
    );
    const container = d3.select(fakeDom.window.document).select('.container');
    const svg = container
        .append('svg')
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);

    svg.append('style').html(
        '* { font-family: "Ubuntu", "Helvetica", "Arial", sans-serif; }'
    );

    // background
    svg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height)
        .attr('fill', bgcolor);

    contrib.create3DContrib(svg, userInfo, 0, 0, width, height);

    // radar chart
    const radarWidth = 400 * 1.3;
    const radarHeight = radarWidth * 3 / 4;
    radar.createRadarContrib(svg, userInfo, width - radarWidth - 20, 20, radarWidth, radarHeight);

    // pie chart
    const pieHeight = 200 * 1.3;
    const pieWidth = pieHeight * 2;
    pie.createPieLanguage(svg, userInfo, 20, height - pieHeight - 20, pieWidth, pieHeight);

    // TODO
    return container.html();
};
