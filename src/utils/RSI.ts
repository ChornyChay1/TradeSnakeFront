export function calculateRSISeriesData(candleData: { time: number; close: number }[], rsiLength: number) {
    const rsiData = [];

    for (let i = 0; i < candleData.length; i++) {
        if (i < rsiLength) {
            // Provide whitespace data points until the RSI can be calculated
            rsiData.push({ time: candleData[i].time });
        } else {
            let gains = 0;
            let losses = 0;

            // Calculate average gains and losses over the RSI period
            for (let j = 0; j < rsiLength; j++) {
                const change = candleData[i - j].close - candleData[i - j - 1].close;
                if (change > 0) {
                    gains += change;
                } else {
                    losses += Math.abs(change);
                }
            }

            // Calculate average gain and loss
            const avgGain = gains / rsiLength;
            const avgLoss = losses / rsiLength;

            // Avoid division by zero
            const rs = avgLoss === 0 ? 0 : avgGain / avgLoss;

            // Calculate RSI
            const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);

            rsiData.push({ time: candleData[i].time, value: rsi });
        }
    }

    return rsiData;
}
