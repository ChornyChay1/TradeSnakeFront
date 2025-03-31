export function calculateEMASeriesData(
    candleData: {time: number, close: number}[],
    emaLength: number,
    smoothingFactor?: number
) {
    const emaData: {time: number, value?: number}[] = [];
    const alpha = smoothingFactor || 2 / (emaLength + 1);
    let emaPrev: number | null = null;

    for (let i = 0; i < candleData.length; i++) {
        const currentClose = candleData[i].close;

        if (i === 0) {
            // First value is just the close price
            emaPrev = currentClose;
            emaData.push({ time: candleData[i].time });
            continue;
        }

        if (i < emaLength - 1) {
            // Not enough data points yet
            emaData.push({ time: candleData[i].time });
            continue;
        }

        // Calculate EMA
        const emaValue = alpha * currentClose + (1 - alpha) * (emaPrev || currentClose);
        emaPrev = emaValue;

        emaData.push({
            time: candleData[i].time,
            value: emaValue
        });
    }

    return emaData;
}