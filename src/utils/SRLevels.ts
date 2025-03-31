export interface LevelData {
    time: any;
    value: number;
    endTime?: number;
    type: 'support' | 'resistance';
}
function calculateSupportResistanceLevels(
    candleData: {time: number, high: number, low: number, close: number}[],
    lookbackPeriod: number = 5
): LevelData[] {
    const levels: LevelData[] = [];

    for (let i = lookbackPeriod; i < candleData.length - lookbackPeriod; i++) {
        const currentHigh = candleData[i].high;
        const currentLow = candleData[i].low;

        // Проверяем является ли текущая точка максимумом
        let isResistance = true;
        for (let j = 1; j <= lookbackPeriod; j++) {
            if (currentHigh < candleData[i - j].high || currentHigh < candleData[i + j].high) {
                isResistance = false;
                break;
            }
        }

        // Проверяем является ли текущая точка минимумом
        let isSupport = true;
        for (let j = 1; j <= lookbackPeriod; j++) {
            if (currentLow > candleData[i - j].low || currentLow > candleData[i + j].low) {
                isSupport = false;
                break;
            }
        }

        // Добавляем найденные уровни
        if (isResistance) {
            levels.push({
                time: candleData[i].time,
                value: currentHigh,
                type: 'resistance'
            });
        }

        if (isSupport) {
            levels.push({
                time: candleData[i].time,
                value: currentLow,
                type: 'support'
            });
        }
    }

    return levels;
}
export function calculateSRLevels(
    candleData: {time: number, high: number, low: number, close: number}[],
    lookbackPeriod: number = 5,
    mergeDistancePercent: number = 1.0
): LevelData[] {
    const rawLevels = calculateSupportResistanceLevels(candleData, lookbackPeriod);
    const mergedLevels: LevelData[] = [];

    // Группируем близкие уровни
    for (const level of rawLevels) {
        let found = false;

        for (const merged of mergedLevels) {
            const distancePct = Math.abs(level.value - merged.value) / merged.value * 100;

            if (distancePct <= mergeDistancePercent && level.type === merged.type) {
                // Объединяем близкие уровни
                merged.value = (merged.value + level.value) / 2;
                found = true;
                break;
            }
        }

        if (!found) {
            mergedLevels.push({...level});
        }
    }
    for (let i = 0; i < mergedLevels.length; i++) {
        if (i < mergedLevels.length - 2) {
            mergedLevels[i].endTime = mergedLevels[i + 2].time;
        }
    }
    // Фильтруем слабые уровни
    return mergedLevels.filter(level => {
        // Подсчитываем количество касаний уровня
        const touches = candleData.filter(candle =>
            Math.abs(candle[level.type === 'support' ? 'low' : 'high'] - level.value) <=
            level.value * 0.001
        ).length;

        return touches >= 2; // Минимум 2 касания
    });
}