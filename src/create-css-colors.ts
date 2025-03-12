import * as d3 from 'd3';
import * as type from './type';

const DARKER_RIGHT = 1;
const DARKER_LEFT = 0.5;
const DARKER_TOP = 0;

const createColors = (settings: type.Settings): string => {
    const cssColors: string[] = [];

    cssColors.push(
        `.fill-fg { fill: ${settings.foregroundColor}; }`,
        `.stroke-fg { stroke: ${settings.foregroundColor}; }`,
        `.fill-bg { fill: ${settings.backgroundColor}; }`,
        `.stroke-bg { stroke: ${settings.backgroundColor}; }`,
    );

    if (
        settings.type == 'normal' ||
        settings.type == 'season' ||
        settings.type == 'rainbow' ||
        settings.type == 'bitmap'
    ) {
        cssColors.push(`.fill-strong { fill: ${settings.strongColor}; }`);
    }

    if (settings.type != 'pie_lang_only') {
        cssColors.push(
            `.fill-weak { fill: ${settings.weakColor}; }`,
            `.stroke-weak { stroke: ${settings.weakColor}; }`,
        );
        cssColors.push(
            '.radar {',
            'stroke-width: 4px;',
            `stroke: ${settings.radarColor};`,
            `fill: ${settings.radarColor};`,
            `fill-opacity: 0.5;`,
            '}',
        );
    }

    if (settings.type == 'normal') {
        settings.contribColors.forEach((color, i) => {
            const topColor = d3.rgb(color).darker(DARKER_TOP).toString();
            const leftColor = d3.rgb(color).darker(DARKER_LEFT).toString();
            const rightColor = d3.rgb(color).darker(DARKER_RIGHT).toString();
            cssColors.push(
                `.cont-top-${i} { fill: ${topColor}; }`,
                `.cont-left-${i} { fill: ${leftColor}; }`,
                `.cont-right-${i} { fill: ${rightColor}; }`,
            );
        });
    }

    if (settings.type == 'season') {
        let n = 0;
        const interpolator1 = d3.interpolate(
            settings.contribColors1,
            settings.contribColors2,
        );
        const interpolator2 = d3.interpolate(
            settings.contribColors2,
            settings.contribColors3,
        );
        const interpolator3 = d3.interpolate(
            settings.contribColors3,
            settings.contribColors4,
        );
        const interpolator4 = d3.interpolate(
            settings.contribColors4,
            settings.contribColors1,
        );
        [interpolator2, interpolator3, interpolator4, interpolator1].forEach(
            (interpolator) => {
                [
                    interpolator(0.2),
                    interpolator(0.4),
                    interpolator(0.6),
                    interpolator(0.8),
                    interpolator(1),
                ].forEach((colors) => {
                    colors.forEach((color, i) => {
                        const topColor = d3
                            .rgb(color)
                            .darker(DARKER_TOP)
                            .toString();
                        const leftColor = d3
                            .rgb(color)
                            .darker(DARKER_LEFT)
                            .toString();
                        const rightColor = d3
                            .rgb(color)
                            .darker(DARKER_RIGHT)
                            .toString();
                        cssColors.push(
                            `.cont-top-p${n}-${i} { fill: ${topColor}; }`,
                            `.cont-left-p${n}-${i} { fill: ${leftColor}; }`,
                            `.cont-right-p${n}-${i} { fill: ${rightColor}; }`,
                        );
                    });
                    n++;
                });
            },
        );
    }

    if (settings.type == 'bitmap') {
        settings.contribPatterns.forEach((pattern, i) => {
            const topBack = pattern.top.backgroundColor;
            const topFore = pattern.top.foregroundColor;
            const rightBack = pattern.right.backgroundColor
                ? pattern.right.backgroundColor
                : d3.rgb(topBack).darker(DARKER_RIGHT).toString();
            const rightFore = pattern.right.foregroundColor
                ? pattern.right.foregroundColor
                : d3.rgb(topFore).darker(DARKER_RIGHT).toString();
            const leftBack = pattern.left.backgroundColor
                ? pattern.left.backgroundColor
                : d3.rgb(topBack).darker(DARKER_LEFT).toString();
            const leftFore = pattern.left.foregroundColor
                ? pattern.left.foregroundColor
                : d3.rgb(topFore).darker(DARKER_LEFT).toString();
            cssColors.push(
                `.cont-top-bg-${i} { fill: ${topBack}; }`,
                `.cont-top-fg-${i} { fill: ${topFore}; }`,
                `.cont-right-bg-${i} { fill: ${rightBack}; }`,
                `.cont-right-fg-${i} { fill: ${rightFore}; }`,
                `.cont-left-bg-${i} { fill: ${leftBack}; }`,
                `.cont-left-fg-${i} { fill: ${leftFore}; }`,
            );
        });
    }

    return cssColors.join('\n');
};

export const createCssColors = (settings: type.Settings): string => {
    const cssColors: string[] = [];

    // insert colors of light mode.
    cssColors.push(createColors(settings));

    // insert colors of dark mode.
    if ('darkMode' in settings && settings.darkMode) {
        cssColors.push(
            '@media (prefers-color-scheme: dark) {',
            createColors(settings.darkMode),
            '}',
        );
    }

    return cssColors.join('\n');
};
