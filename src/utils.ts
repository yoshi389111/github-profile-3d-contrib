export const toIsoDate = (date: Date): string =>
    date.toISOString().substring(0, 10);

export const inertThousandSeparator = (value: number): string => {
    if (value <= 9999) {
        return value.toFixed(0);
    }
    // Separate every three digits with a space (SI format)
    return value.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1 ');
};

// Rounding large numbers
export const toScale = (value: number): string => {
    if (value < 10_000) {
        // 0 - 9999
        return value.toFixed(0);
    } else if (value < 1_000_000) {
        // 10K - 999K
        return Math.floor(value / 1_000).toFixed(0) + 'K';
    } else {
        return '1M+';
    }
};
