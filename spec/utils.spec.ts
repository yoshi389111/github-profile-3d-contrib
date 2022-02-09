import * as util from "../src/utils";

describe('utils', () => {
    it('toIsoDate', () => {
        const date = new Date(Date.UTC(2022, 1, 3, 4, 5, 6, 7));
        expect(util.toIsoDate(date)).toEqual('2022-02-03');
    });

    it('inertThousandSeparator', () => {
        expect(util.inertThousandSeparator(0)).toEqual('0');
        expect(util.inertThousandSeparator(10)).toEqual('10');
        expect(util.inertThousandSeparator(100)).toEqual('100');
        expect(util.inertThousandSeparator(1000)).toEqual('1000');
        expect(util.inertThousandSeparator(9999)).toEqual('9999');
        expect(util.inertThousandSeparator(10_000)).toEqual('10 000');
        expect(util.inertThousandSeparator(100_000)).toEqual('100 000');
        expect(util.inertThousandSeparator(999_999)).toEqual('999 999');
        expect(util.inertThousandSeparator(1_000_000)).toEqual('1 000 000');
        expect(util.inertThousandSeparator(999_999_999)).toEqual('999 999 999');
        expect(util.inertThousandSeparator(1_000_000_000)).toEqual('1 000 000 000');
    });

    it('toScale', () => {
        expect(util.toScale(0)).toEqual('0');
        expect(util.toScale(10)).toEqual('10');
        expect(util.toScale(100)).toEqual('100');
        expect(util.toScale(1000)).toEqual('1000');
        expect(util.toScale(9999)).toEqual('9999');
        expect(util.toScale(10_000)).toEqual('10K');
        expect(util.toScale(99_999)).toEqual('99K');
        expect(util.toScale(100_000)).toEqual('100K');
        expect(util.toScale(999_999)).toEqual('999K');
        expect(util.toScale(1_000_000)).toEqual('1M+');
        expect(util.toScale(999_999_999)).toEqual('1M+');
        expect(util.toScale(1_000_000_000)).toEqual('1M+');
    });

});

