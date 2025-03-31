export function calculateADXSeriesData(
    candleData: { time: any; high: number; low: number; close: number }[],
    adxLength: number = 14
): { time: any; value?: number }[] {
    const adxData: { time: any; value?: number }[] = [];

    if (!candleData || candleData.length < adxLength * 2) {
        return candleData.map(candle => ({ time: candle.time }));
    }

    // Шаг 1: Рассчитываем +DM, -DM и True Range для каждого периода
    const dmResults: {
        time: number;
        plusDM: number;
        minusDM: number;
        trueRange: number;
    }[] = [];

    for (let i = 1; i < candleData.length; i++) {
        const current = candleData[i];
        const prev = candleData[i - 1];

        const upMove = current.high - prev.high;
        const downMove = prev.low - current.low;

        const plusDM = upMove > downMove && upMove > 0 ? upMove : 0;
        const minusDM = downMove > upMove && downMove > 0 ? downMove : 0;

        const trueRange = Math.max(
            current.high - current.low,
            Math.abs(current.high - prev.close),
            Math.abs(current.low - prev.close)
        );

        dmResults.push({
            time: current.time,
            plusDM,
            minusDM,
            trueRange
        });
    }

    // Шаг 2: Сглаживаем значения с периодом ADX
    let sumPlusDM = 0;
    let sumMinusDM = 0;
    let sumTR = 0;

    // Инициализация первых значений
    for (let i = 0; i < adxLength; i++) {
        sumPlusDM += dmResults[i].plusDM;
        sumMinusDM += dmResults[i].minusDM;
        sumTR += dmResults[i].trueRange;
    }

    let prevPlusDI = (sumPlusDM / sumTR) * 100;
    let prevMinusDI = (sumMinusDM / sumTR) * 100;
    let prevDX = (Math.abs(prevPlusDI - prevMinusDI) / (prevPlusDI + prevMinusDI)) * 100;

    // Первые adxLength*2-1 периодов заполняем пустыми значениями
    for (let i = 0; i < adxLength * 2 - 1; i++) {
        adxData.push({ time: candleData[i].time });
    }

    // Шаг 3: Расчет ADX
    for (let i = adxLength; i < dmResults.length; i++) {
        sumPlusDM = sumPlusDM - (sumPlusDM / adxLength) + dmResults[i].plusDM;
        sumMinusDM = sumMinusDM - (sumMinusDM / adxLength) + dmResults[i].minusDM;
        sumTR = sumTR - (sumTR / adxLength) + dmResults[i].trueRange;

        const plusDI = (sumPlusDM / sumTR) * 100;
        const minusDI = (sumMinusDM / sumTR) * 100;

        const dx = (Math.abs(plusDI - minusDI) / (plusDI + minusDI)) * 100;

        // Сглаживаем DX для получения ADX
        const adx = i === adxLength
            ? dx
            : ((prevDX * (adxLength - 1)) + dx) / adxLength;

        adxData.push({
            time: candleData[i + 1].time,
            value: adx
        });

        prevPlusDI = plusDI;
        prevMinusDI = minusDI;
        prevDX = adx;
    }

    return adxData;
}