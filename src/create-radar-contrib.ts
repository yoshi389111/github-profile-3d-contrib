import * as d3 from 'd3';
import * as type from './type';

const levels = 5;
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
            value: toLevel(userInfo.totalCommitContributions),
        },
        {
            name: 'Issue',
            value: toLevel(userInfo.totalIssueContributions),
        },
        {
            name: 'PullReq',
            value: toLevel(userInfo.totalPullRequestContributions),
        },
        {
            name: 'Review',
            value: toLevel(userInfo.totalPullRequestReviewContributions),
        },
        {
            name: 'Repo',
            value: toLevel(userInfo.totalRepositoryContributions),
        },
    ];

    const allAxis = data.map((dutam) => dutam.name);
    const total = allAxis.length;

    const group = svg.append('g').attr('transform', `translate(${x}, ${y})`);

    const groupCenter = group
        .append('g')
        .attr('transform', `translate(${cx}, ${cy})`);

    for (let j = 0; j < levels; j++) {
        const levelRadius = radius * ((j + 1) / levels);
        groupCenter
            .selectAll('.levels')
            .data(allAxis)
            .enter()
            .append('line')
            .attr('x1', (d, i) => levelRadius * Math.sin((i * radians) / total))
            .attr(
                'y1',
                (d, i) => levelRadius * -Math.cos((i * radians) / total)
            )
            .attr(
                'x2',
                (d, i) => levelRadius * Math.sin(((i + 1) * radians) / total)
            )
            .attr(
                'y2',
                (d, i) => levelRadius * -Math.cos(((i + 1) * radians) / total)
            )
            .attr('class', 'line')
            .style('stroke', 'grey')
            .style('stroke-dasharray', '4 4')
            .style('stroke-width', '1px');
    }

    groupCenter
        .selectAll(null)
        .data(['1-', '10', '100', '1K', '10K+'])
        .enter()
        .append('text')
        .text((d) => d)
        .style('font-size', `${radius / 10}px`)
        .attr('text-anchor', 'start')
        .attr('dominant-baseline', 'auto')
        .attr('x', radius / 50)
        .attr('y', (d, i) => -radius * ((i + 1) / levels))
        .attr('fill', 'gray');

    const axis = groupCenter
        .selectAll('.axis')
        .data(allAxis)
        .enter()
        .append('g')
        .attr('class', 'axis');

    axis.append('line')
        .attr(
            'x1',
            (d, i) => (radius / levels) * Math.sin((i * radians) / total)
        )
        .attr(
            'y1',
            (d, i) => (radius / levels) * -Math.cos((i * radians) / total)
        )
        .attr('x2', (d, i) => radius * Math.sin((i * radians) / total))
        .attr('y2', (d, i) => radius * -Math.cos((i * radians) / total))
        .attr('class', 'line')
        .style('stroke', 'grey')
        .style('stroke-dasharray', '4 4')
        .style('stroke-width', '1px');

    axis.append('text')
        .attr('class', 'legend')
        .text((d) => d)
        .style('font-size', `${radius / 7.5}px`)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('x', (d, i) => radius * 1.25 * Math.sin((i * radians) / total))
        .attr('y', (d, i) => radius * 1.17 * -Math.cos((i * radians) / total));

    const dataValues = data.flatMap((d, i) => [
        radius * ((d.value / levels) * Math.sin((i * radians) / total)),
        radius * ((-d.value / levels) * Math.cos((i * radians) / total)),
    ]);
    dataValues.push(dataValues[0], dataValues[1]); // close path

    groupCenter
        .selectAll('.area')
        .data([dataValues])
        .enter()
        .append('polygon')
        .style('stroke-width', '4px')
        .style('stroke', radarColor)
        .attr('points', (d) => d.join(','))
        .style('fill', radarColor)
        .style('fill-opacity', 0.5);
};
