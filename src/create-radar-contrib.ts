import * as d3 from 'd3';
import * as type from './type';

const rangeLabels: ReadonlyArray<string> = ['1-', '10', '100', '1K', '10K+'];
const levels = rangeLabels.length;
const radians = 2 * Math.PI;
const radarColor = '#47a042';

const toLevel = (value: number): number => {
    if (value < 1) {
        return 1;
    }
    const result = Math.log10(value);
    return Math.min(result, 4) + 1;
};

export const createRadarContrib = (
    svg: d3.Selection<SVGSVGElement, unknown, null, unknown>,
    userInfo: type.UserInfo,
    x: number,
    y: number,
    width: number,
    height: number
): void => {
    const radius = (height / 2) * 0.8;
    const cx = width / 2;
    const cy = (height / 2) * 1.1;

    const data = [
        {
            name: 'Commit',
            value: userInfo.totalCommitContributions,
        },
        {
            name: 'Issue',
            value: userInfo.totalIssueContributions,
        },
        {
            name: 'PullReq',
            value: userInfo.totalPullRequestContributions,
        },
        {
            name: 'Review',
            value: userInfo.totalPullRequestReviewContributions,
        },
        {
            name: 'Repo',
            value: userInfo.totalRepositoryContributions,
        },
    ];
    const total = data.length;
    const posX = (level: number, num: number) =>
        radius * (level / levels) * Math.sin((num / total) * radians);
    const posY = (level: number, num: number) =>
        radius * (level / levels) * -Math.cos((num / total) * radians);

    const group = svg
        .append('g')
        .attr('transform', `translate(${x + cx}, ${y + cy})`);

    for (let j = 0; j < levels; j++) {
        group
            .selectAll(null)
            .data(data)
            .enter()
            .append('line')
            .attr('x1', (d, i) => posX(j + 1, i))
            .attr('y1', (d, i) => posY(j + 1, i))
            .attr('x2', (d, i) => posX(j + 1, i + 1))
            .attr('y2', (d, i) => posY(j + 1, i + 1))
            .style('stroke', 'grey')
            .style('stroke-dasharray', '4 4')
            .style('stroke-width', '1px');
    }

    group
        .selectAll(null)
        .data(rangeLabels)
        .enter()
        .append('text')
        .text((d) => d)
        .style('font-size', `${radius / 12}px`)
        .attr('text-anchor', 'start')
        .attr('dominant-baseline', 'auto')
        .attr('x', radius / 50)
        .attr('y', (d, i) => -radius * ((i + 1) / levels))
        .attr('fill', 'gray');

    const axis = group
        .selectAll(null)
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'axis');

    axis.append('line')
        .attr('x1', (d, i) => posX(1, i))
        .attr('y1', (d, i) => posY(1, i))
        .attr('x2', (d, i) => posX(levels, i))
        .attr('y2', (d, i) => posY(levels, i))
        .style('stroke', 'grey')
        .style('stroke-dasharray', '4 4')
        .style('stroke-width', '1px');

    axis.append('text')
        .text((d) => d.name)
        .style('font-size', `${radius / 7.5}px`)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('x', (d, i) => posX(1.25 * levels, i))
        .attr('y', (d, i) => posY(1.17 * levels, i))
        .append('title')
        .text((d) => d.value);

    const points = data
        .map((d) => toLevel(d.value))
        .map((level, i) => `${posX(level, i)},${posY(level, i)}`)
        .join(' ');

    group
        .append('polygon')
        .style('stroke-width', '4px')
        .style('stroke', radarColor)
        .attr('points', points)
        .style('fill', radarColor)
        .style('fill-opacity', 0.5);
};
