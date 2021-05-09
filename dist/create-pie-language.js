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
exports.createPieLanguage = void 0;
const d3 = __importStar(require("d3"));
const OTHER_NAME = 'other';
const OTHER_COLOR = '#444444';
const bgcolor = '#ffffff';
const fgcolor = '#00000f';
const createPieLanguage = (svg, userInfo, x, y, width, height) => {
    if (userInfo.totalContributions === 0) {
        return;
    }
    const languages = userInfo.contributesLanguage.slice(0, 5);
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
    const pie = d3
        .pie()
        .value((d) => d.contributions)
        .sortValues(null);
    const pieData = pie(languages);
    const group = svg.append('g').attr('transform', `translate(${x}, ${y})`);
    const groupLabel = group
        .append('g')
        .attr('transform', `translate(${radius * 2.1}, ${0})`);
    // markers for label
    groupLabel
        .selectAll(null)
        .data(pieData)
        .enter()
        .append('rect')
        .attr('x', 0)
        .attr('y', (d) => (d.index + offset) * (height / row) - fontSize / 2)
        .attr('width', fontSize)
        .attr('height', fontSize)
        .attr('fill', (d) => d.data.color)
        .attr('stroke', bgcolor)
        .attr('stroke-width', '1px');
    // labels
    groupLabel
        .selectAll(null)
        .data(pieData)
        .enter()
        .append('text')
        .attr('dominant-baseline', 'middle')
        .text((d) => d.data.language)
        .attr('x', fontSize * 1.2)
        .attr('y', (d) => (d.index + offset) * (height / row))
        .attr('fill', fgcolor)
        .attr('font-size', `${fontSize}px`);
    const arc = d3
        .arc()
        .outerRadius(radius - margin)
        .innerRadius(radius / 2);
    // pie chart
    group
        .append('g')
        .attr('transform', `translate(${radius}, ${radius})`)
        .selectAll(null)
        .data(pieData)
        .enter()
        .append('path')
        .attr('d', arc)
        .style('fill', (d) => d.data.color)
        .attr('stroke', bgcolor)
        .attr('stroke-width', '2px');
};
exports.createPieLanguage = createPieLanguage;
//# sourceMappingURL=create-pie-language.js.map