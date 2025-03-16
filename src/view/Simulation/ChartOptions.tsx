import React, { useEffect, useState } from "react";
import { StrategyOptions } from "../../interfaces/chart_interfaces";
import { ChartViewModel } from "../../viewmodel/chartViewModel";

interface ChartOptionsProps {
    interval: string;
    setInterval: (value: string) => void;
    money: number;
    setMoney: (value: number) => void;
    symbol: string;
    setSymbol: (value: string) => void;
    startDate: string;
    setStartDate: (value: string) => void;
    endDate: string;
    setEndDate: (value: string) => void;
    strategy: StrategyOptions;
    setStrategy: (value: StrategyOptions) => void;
}

const ChartOptions: React.FC<ChartOptionsProps> = ({
                                                       interval,
                                                       setInterval,
                                                       money,
                                                       setMoney,
                                                       symbol,
                                                       setSymbol,
                                                       startDate,
                                                       setStartDate,
                                                       endDate,
                                                       setEndDate,
                                                       strategy,
                                                       setStrategy,
                                                   }) => {
    const [availableStrategies, setAvailableStrategies] = useState<any[]>([]); // Состояние для хранения стратегий
    const [availableSymbols, setAvailableSymbols] = useState<string[]>([]); // Состояние для хранения символов

    // Функция для вычисления максимальной endDate на основе interval и startDate
    const getMaxEndDate = (start: string, interval: string): string => {
        const startDateObj = new Date(start);
        let maxDateObj: Date;

        switch (interval) {
            case "5": // 5 минут
                maxDateObj = new Date(startDateObj);
                maxDateObj.setMonth(startDateObj.getMonth() + 1);
                break;
            case "15": // 15 минут
                maxDateObj = new Date(startDateObj);
                maxDateObj.setMonth(startDateObj.getMonth() + 3);
                break;
            case "60": // 1 час
                maxDateObj = new Date(startDateObj);
                maxDateObj.setFullYear(startDateObj.getFullYear() + 1);
                break;
            case "d": // 1 день
                maxDateObj = new Date(startDateObj);
                maxDateObj.setFullYear(startDateObj.getFullYear() + 24);
                break;
            default:
                maxDateObj = new Date(startDateObj);
                maxDateObj.setFullYear(startDateObj.getFullYear() + 1); // По умолчанию 1 год
        }

        return maxDateObj.toISOString().split("T")[0]; // Возвращаем дату в формате YYYY-MM-DD
    };

    // Функция для проверки и корректировки endDate
    const validateEndDate = (start: string, end: string, interval: string): string => {
        const maxEndDate = getMaxEndDate(start, interval);
        return end > maxEndDate ? maxEndDate : end;
    };

    // Обработчик изменения interval
    const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newInterval = e.target.value;
        setInterval(newInterval);

        // Корректируем endDate при изменении interval
        const newEndDate = validateEndDate(startDate, endDate, newInterval);
        setEndDate(newEndDate);
    };

    // Обработчик изменения startDate
    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);

        // Корректируем endDate при изменении startDate
        const newEndDate = validateEndDate(newStartDate, endDate, interval);
        setEndDate(newEndDate);
    };

    // Обработчик изменения endDate
    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEndDate = e.target.value;
        const validatedEndDate = validateEndDate(startDate, newEndDate, interval);
        setEndDate(validatedEndDate);
    };

    useEffect(() => {
        const fetchStrategies = async () => {
            const chartViewModel = ChartViewModel.getInstance();
            const strategies = await chartViewModel.fetchAllStrategies();
            setAvailableStrategies(strategies);


            if (strategies.length > 0) {
                const firstStrategy = strategies[0];
                setStrategy({
                    id: firstStrategy.id.toString(),
                    name: firstStrategy.name,
                    settings: Object.keys(firstStrategy.strategy_parameters).reduce((acc, key) => {
                        acc[key] = firstStrategy.strategy_parameters[key].default;
                        return acc;
                    }, {} as Record<string, any>),
                });


                // Устанавливаем символы для первой стратегии
                if (firstStrategy.symbols) {
                    setAvailableSymbols(firstStrategy.symbols);
                }
            }
        };

        fetchStrategies();
    }, []);

    // Обработчик для изменения стратегии
    const handleStrategyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedStrategyId = parseInt(e.target.value);
        const selectedStrategy = availableStrategies.find(s => s.id === selectedStrategyId);
        if (selectedStrategy) {
            // Обновляем стратегию и её параметры
            setStrategy({
                id: selectedStrategy.id.toString(),
                name: selectedStrategy.name,
                settings: Object.keys(selectedStrategy.strategy_parameters).reduce((acc, key) => {
                    acc[key] = selectedStrategy.strategy_parameters[key].default;
                    return acc;
                }, {} as Record<string, any>),
            });

            // Обновляем символы для выбранной стратегии
            if (selectedStrategy.symbols) {
                setAvailableSymbols(selectedStrategy.symbols);
            }
        }
    };

    // Обработчик изменения значений в settings
    const handleSettingChange = (setting: string, value: string | number) => {
        const updatedSettings = { ...strategy.settings, [setting]: value };
        setStrategy({
            ...strategy,
            settings: updatedSettings,
        });
    };

    return (
        <>
            <div className="option">
                <div className="input-group">
                    <label htmlFor="strategy">Стратегия:</label>
                    <select
                        id="strategy"
                        value={strategy.id}
                        onChange={handleStrategyChange}
                    >
                        {availableStrategies.map((strategy) => (
                            <option key={strategy.id} value={strategy.id}>
                                {strategy.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Отображение настроек для выбранной стратегии */}
            <div className="option">
                {Object.keys(strategy.settings).map((settingKey) => {
                    // Получаем название параметра на русском (если есть)
                    const paramNameRu = strategy.settings[settingKey]?.name_ru || settingKey;

                    return (
                        <div key={settingKey} className="input-group">
                            <label htmlFor={settingKey}>{paramNameRu}:</label>
                            <input
                                id={settingKey}
                                type="number"
                                value={strategy.settings[settingKey] || ""}
                                onChange={(e) =>
                                    handleSettingChange(settingKey, e.target.value)
                                }
                            />
                        </div>
                    );
                })}
            </div>

            <div className="option">
                <div className="input-group">
                    <label htmlFor="interval">Таймфрейм:</label>
                    <select
                        id="interval"
                        value={interval}
                        onChange={handleIntervalChange}
                    >
                        <option value="5">5min</option>
                        <option value="15">15min</option>
                        <option value="60">1h</option>
                        <option value="d">1d</option>
                    </select>
                </div>

                <div className="input-group">
                    <label htmlFor="money">Начальный капитал:</label>
                    <input
                        id="money"
                        type="number"
                        value={money}
                        onChange={(e) => setMoney(Number(e.target.value))}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="symbol">Валютная пара:</label>
                    <select
                        id="symbol"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                    >
                        {availableSymbols.map((sym) => (
                            <option key={sym} value={sym}>
                                {sym}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="input-group">
                    <label htmlFor="start-date">Дата начала:</label>
                    <input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={handleStartDateChange}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="end-date">Дата конца:</label>
                    <input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={handleEndDateChange}
                        max={getMaxEndDate(startDate, interval)} // Устанавливаем максимальную дату
                    />
                </div>
            </div>
        </>
    );
};

export default ChartOptions;