export const toIsoDate = (date: Date): string =>
    date.toISOString().substring(0, 10);

export const inertThousandSeparator = (value: number): string => {
    if (value <= 9999) {
        // 4 digits or less, do not need to be separated.
        // e.g. "1234"
        return value.toFixed(0);
    }
    // 5 digits or more, separate each 3 digits with a space(SI format).
    // e.g. "12 345"
    return value.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1 ');
};

/** Round large numbers */
export const toScale = (value: number): string => {
    if (value <= 9999) {
        // 0 - 9999
        return value.toFixed(0);
    } else if (value <= 999999) {
        // 10K - 999K
        return Math.floor(value / 1_000).toFixed(0) + 'K';
    } else {
        return '1M+';
    }
};

/** Round to two decimal places. */
export const toFixed = (value: number): number => +value.toFixed(2);
