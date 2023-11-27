import * as d3 from 'd3';
import * as type from './type';

const OTHER_NAME = 'other';
const OTHER_COLOR = '#444444';

export const createPieLanguage = (
    svg: d3.Selection<SVGSVGElement, unknown, null, unknown>,
    userInfo: type.UserInfo,
    x: number,
    y: number,
    width: number,
    height: number,
    settings: type.PieLangSettings,
    isForcedAnimation: boolean
): void => {
    if (userInfo.totalContributions === 0) {
        return;
    }

    const defaultMaxLanguages = 5;
    let maxLanguages = process.env.MAX_LANGUAGES
        ? Number(process.env.MAX_LANGUAGES)
        : defaultMaxLanguages;
    if (Number.isNaN(maxLanguages)) {
        maxLanguages = defaultMaxLanguages;
        return;
    }
    const ignoreLanguagesVal = process.env.IGNORE_LANGUAGES
        ? process.env.IGNORE_LANGUAGES
        : "";
    const ignoreLanguages = ignoreLanguagesVal.split(",").map(lang => lang.trim().replace(/\s+/g, '').toLowerCase());

    const filteredLanguages = userInfo.contributesLanguage
        .filter(lang => !ignoreLanguages.includes(lang.language.trim().replace(/\s+/g, '').toLowerCase()));

    if (maxLanguages > filteredLanguages.length) {
        maxLanguages = filteredLanguages.length;
    }

    if (maxLanguages < defaultMaxLanguages) {
        maxLanguages = defaultMaxLanguages;
    }

    const languages = filteredLanguages.slice(0, maxLanguages);

    const sumContrib = languages
        .map((lang) => lang.contributions)
        .reduce((a, b) => a + b, 0);

    const totalContributions = filteredLanguages.reduce((accumulator, currentObject) => accumulator + currentObject.contributions, 0);
    const otherContributions = totalContributions - sumContrib;
    if (0 < otherContributions) {
        languages.push({
            language: OTHER_NAME,
            color: OTHER_COLOR,
            contributions: otherContributions,
        });
    }

    const isAnimate = settings.growingAnimation || isForcedAnimation;
    const animeSteps = 5;
    const animateOpacity = (num: number) =>
        Array<string>(languages.length + animeSteps)
            .fill('')
            .map((d, i) => (i < num ? 0 : Math.min((i - num) / animeSteps, 1)))
            .join(';');

    const radius = height / 2 + (languages.length - defaultMaxLanguages) * 2;
    const margin = radius / 10;

    const row = languages.length + 3;
    const offset = (row - languages.length) / 2 + 0.5;
    const fontSize = height / row / 1.2;

    const pie = d3
        .pie<type.LangInfo>()
        .value((d) => d.contributions)
        .sortValues(null);
    const pieData = pie(languages);

    const group = svg.append('g').attr('transform', `translate(${x}, ${y})`);

    const groupLabel = group
        .append('g')
        .attr('transform', `translate(${radius * 2.1}, ${0})`);

    // markers for label
    const markers = groupLabel
        .selectAll(null)
        .data(pieData)
        .enter()
        .append('rect')
        .attr('x', 0)
        .attr('y', (d) => (d.index + offset) * (height / row) - fontSize / 2)
        .attr('width', fontSize)
        .attr('height', fontSize)
        .attr('fill', (d) => d.data.color)
        .attr('stroke', settings.backgroundColor)
        .attr('stroke-width', '1px');
    if (isAnimate) {
        markers
            .append('animate')
            .attr('attributeName', 'fill-opacity')
            .attr('values', (d, i) => animateOpacity(i))
            .attr('dur', '3s')
            .attr('repeatCount', '1');
    }

    // labels with percentage
    const labels = groupLabel
        .selectAll(null)
        .data(pieData)
        .enter()
        .append('text')
        .attr('dominant-baseline', 'middle')
        .text((d) => {
            // Calculate the percentage
            const percentage = (d.data.contributions / totalContributions) * 100;
            // Format to one decimal place and create the label text
            return `${d.data.language}: ${percentage.toFixed(1)}%`;
        })
        .attr('x', fontSize * 1.2)
        .attr('y', (d) => (d.index + offset) * (height / row))
        .attr('fill', settings.foregroundColor)
        .attr('font-size', `${fontSize}px`);

    const arc = d3
        .arc<d3.PieArcDatum<type.LangInfo>>()
        .outerRadius(radius - margin)
        .innerRadius(radius / 2);

    // pie chart
    const paths = group
        .append('g')
        .attr('transform', `translate(${radius}, ${radius})`)
        .selectAll(null)
        .data(pieData)
        .enter()
        .append('path')
        .attr('d', arc)
        .style('fill', (d) => d.data.color)
        .attr('stroke', settings.backgroundColor)
        .attr('stroke-width', '2px');
    paths
        .append('title')
        .text((d) => `${d.data.language} ${d.data.contributions}`);
    if (isAnimate) {
        paths
            .append('animate')
            .attr('attributeName', 'fill-opacity')
            .attr('values', (d, i) => animateOpacity(i))
            .attr('dur', '3s')
            .attr('repeatCount', '1');
    }

    throw new Error(JSON.stringify(userInfo.contributesLanguage) + "----------" + JSON.stringify(filteredLanguages));
};
