export interface BollingerBandPoint {
    time: any;
    middle?: number;
    upper?: number;
    lower?: number;
}

export function calculateBollingerBandsSeriesData(
    candleData: {time: any, close: number}[],
    period: number = 20,
    deviation: number = 2
): BollingerBandPoint[] {
    const result: BollingerBandPoint[] = [];

    if (!candleData || candleData.length === 0) {
        return result;
    }

    for (let i = 0; i < candleData.length; i++) {
        const currentTime = candleData[i]?.time;
        const point: BollingerBandPoint = { time: currentTime };

        // Проверка на валидность данных
        if (currentTime === undefined || currentTime === null) {
            continue;
        }

        if (i >= period - 1) {
            // Расчет SMA и стандартного отклонения
            let sum = 0;
            let sumSquares = 0;
            let validPrices = 0;

            for (let j = 0; j < period; j++) {
                const price = candleData[i - j]?.close;
                if (typeof price === 'number' && !isNaN(price)) {
                    sum += price;
                    sumSquares += price * price;
                    validPrices++;
                }
            }

            // Если есть достаточное количество валидных цен
            if (validPrices >= period) {
                const sma = sum / period;
                const stdDev = Math.sqrt((sumSquares / period) - Math.pow(sma, 2));

                point.middle = sma;
                point.upper = sma + deviation * stdDev;
                point.lower = sma - deviation * stdDev;
            }
        }

        result.push(point);
    }

    return result;
}