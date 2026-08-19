import { createSvg } from '../src/create-svg';
import * as aggregate from '../src/aggregate-user-info';
import { NormalSettings } from '../src/color-template';
import { dummyData } from './dummy-data';

describe('create-svg', () => {
    const userInfo = aggregate.aggregateUserInfo(dummyData);

    it('renders original SVG with pie language chart and stats', () => {
        const svg = createSvg(userInfo, NormalSettings, false);
        expect(svg).toContain('Jupyter Notebook');
        expect(svg).toContain('contributions');
    });

    it('removes language pie chart when hidePieLang is true', () => {
        const customSettings = {
            ...NormalSettings,
            hidePieLang: true,
        };
        const svg = createSvg(userInfo, customSettings, false);
        expect(svg).not.toContain('Jupyter Notebook');
        expect(svg).toContain('contributions');
    });

    it('removes set of contributions, stars and forks when hideStats is true', () => {
        const customSettings = {
            ...NormalSettings,
            hideStats: true,
        };
        const svg = createSvg(userInfo, customSettings, false);
        expect(svg).toContain('Jupyter Notebook');
        expect(svg).not.toContain('contributions');
    });

    it('removes both language pie chart and set of contributions, stars and forks when both hidePieLang and hideStats are true', () => {
        const customSettings = {
            ...NormalSettings,
            hidePieLang: true,
            hideStats: true,
        };
        const svg = createSvg(userInfo, customSettings, false);
        expect(svg).not.toContain('Jupyter Notebook');
        expect(svg).not.toContain('contributions');
    });
});
