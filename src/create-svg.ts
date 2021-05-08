import * as d3 from 'd3';
import { JSDOM } from 'jsdom';
import * as contrib from './create-3d-contrib';
import * as pie from './create-pie-language';
import * as radar from './create-radar-contrib';
import * as type from './type';

const width = 1280;
const height = 1024;

export const createSvg = (userInfo: type.UserInfo): string => {

    const fakeDom = new JSDOM('<!DOCTYPE html><html><body><div class="container"></div></body></html>');
    const container = d3.select(fakeDom.window.document).select('.container');
    const svg = container
        .append('svg')
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);

    svg.append('style').html('* { font-family: "Ubuntu", "Helvetica", "Arial", sans-serif; }');

    // background
    svg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height)
        .attr('fill', "#eeddaa");

    contrib.create3DContrib(svg, userInfo, 0, 0, width, height);

    // radar chart
    radar.createRadarContrib(svg, userInfo, 800, 50, 400, 300);

    // pie chart
    pie.createPieLanguage(svg, userInfo, 50, 800, 400, 200);

    // TODO
    return container.html();
}
