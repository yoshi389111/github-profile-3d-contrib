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

    const group = svg
        .append('g')
        .attr('transform', `translate(${x + cx}, ${y + cy})`);

    for (let j = 0; j < levels; j++) {
        const length = radius * ((j + 1) / levels);
        group
            .selectAll(null)
            .data(data)
            .enter()
            .append('line')
            .attr('x1', (d, i) => length * Math.sin((i / total) * radians))
            .attr('y1', (d, i) => length * -Math.cos((i / total) * radians))
            .attr(
                'x2',
                (d, i) => length * Math.sin(((i + 1) / total) * radians)
            )
            .attr(
                'y2',
                (d, i) => length * -Math.cos(((i + 1) / total) * radians)
            )
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
        .style('font-size', `${radius / 10}px`)
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
        .attr(
            'x1',
            (d, i) => (radius / levels) * Math.sin((i / total) * radians)
        )
        .attr(
            'y1',
            (d, i) => (radius / levels) * -Math.cos((i / total) * radians)
        )
        .attr('x2', (d, i) => radius * Math.sin((i / total) * radians))
        .attr('y2', (d, i) => radius * -Math.cos((i / total) * radians))
        .style('stroke', 'grey')
        .style('stroke-dasharray', '4 4')
        .style('stroke-width', '1px');

    axis.append('text')
        .text((d) => d.name)
        .style('font-size', `${radius / 7.5}px`)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('x', (d, i) => radius * 1.25 * Math.sin((i / total) * radians))
        .attr('y', (d, i) => radius * 1.17 * -Math.cos((i / total) * radians))
        .append('title')
        .text((d) => d.value);

    const dataValues = data
        .map((d) => toLevel(d.value))
        .map(
            (d, i) =>
                `${radius * ((d / levels) * Math.sin((i / total) * radians))},${
                    radius * ((-d / levels) * Math.cos((i / total) * radians))
                }`
        );

    group
        .selectAll(null)
        .data([dataValues])
        .enter()
        .append('polygon')
        .style('stroke-width', '4px')
        .style('stroke', radarColor)
        .attr('points', (d) => d.join(' '))
        .style('fill', radarColor)
        .style('fill-opacity', 0.5);
};
