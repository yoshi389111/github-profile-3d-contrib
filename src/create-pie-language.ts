import * as d3 from 'd3';
import * as type from './type';

const OTHER_NAME = "other";1
const OTHER_COLOR = "#444444";
const bgcolor = "#ffffff";
const fgcolor = "#00000f";

export const createPieLanguage = (
    svg: d3.Selection<SVGSVGElement, unknown, null, unknown>,
    userInfo: type.UserInfo,
    x: number,
    y: number,
    width: number,
    height: number,
) => {
    const languages: Array<type.LangInfo> = userInfo.contributesLanguage.slice(0, 5);
    const sumContrib = languages
        .map((lang) => lang.contributions)
        .reduce((a, b) => a + b, 0);
    const otherContributions = userInfo.totalCommitContributions - sumContrib;
    if (0 < otherContributions) {
        languages.push({
            language: OTHER_NAME,
            color: OTHER_COLOR,
            contributions: otherContributions,
        });
    }

    const radius = height / 2;
    const margin = radius / 10;

    const row = 8;
    const offset = (row - languages.length) / 2 + 0.5;
    const fontSize = height / row / 1.5;

    const pie = d3.pie<type.LangInfo>().value((d) => d.contributions)
        .sortValues(null);
    const pieData = pie(languages);

    const group = svg.append("g")
        .attr("transform", `translate(${x}, ${y})`);

    group.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height)
        .attr('fill', bgcolor); // TODO

    const groupLabel = group.append("g")
        .attr("transform", `translate(${radius * 2.1}, ${0})`);

    // markers for label
    groupLabel.selectAll(null)
        .data(pieData)
        .enter()
        .append('rect')
        .attr('x', 0)
        .attr('y', (d) => (d.index + offset) * (height / row) - (fontSize / 2))
        .attr('width', fontSize)
        .attr('height', fontSize)
        .attr('fill', (d) => d.data.color)
        .attr('stroke', bgcolor)
        .attr('stroke-width', '1px');

    // labels
    groupLabel.selectAll(null)
        .data(pieData)
        .enter()
        .append('text')
        .attr('dominant-baseline', 'middle')
        .text((d) => d.data.language)
        .attr('x', fontSize * 1.2)
        .attr('y', (d) => (d.index + offset) * (height / row))
        .attr('fill', fgcolor)
        .attr('font-size', `${fontSize}px`);

    const arc = d3.arc<d3.PieArcDatum<type.LangInfo>>()
        .outerRadius(radius - margin)
        .innerRadius(radius / 2);

    // pie chart
    group.append("g")
        .attr("transform", `translate(${radius}, ${radius})`)
        .selectAll(null)
        .data(pieData)
        .enter()
        .append('path')
        .attr('d', arc)
        .style('fill', (d) => d.data.color)
        .attr('stroke', bgcolor)
        .attr('stroke-width', '2px');
};
