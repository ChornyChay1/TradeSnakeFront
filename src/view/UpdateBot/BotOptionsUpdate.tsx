import React, { useEffect, useState } from "react";
import { StrategyOptions } from "../../interfaces/chart_interfaces";
import { ChartViewModel } from "../../viewmodel/chartViewModel";
import { BotsViewModel } from "../../viewmodel/botsViewModel";
import ToolTip from "../Common/Tooltip";
// @ts-ignore
import arrow_img from "../../img/arrow.svg";

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
    brokerId: number;
    setBrokerId: (value: number) => void;
    setBrokerDataLoaded: (value: boolean) => void;
    isBrokerDataLoaded: boolean;
}

const BotOptionsStart: React.FC<ChartOptionsProps> = ({
                                                          interval, setInterval, money, setMoney, symbol, setSymbol,
                                                          startDate, setStartDate, endDate, setEndDate,
                                                          strategy, setStrategy, brokerId, setBrokerId,setBrokerDataLoaded,isBrokerDataLoaded
                                                      }) => {
    const [availableStrategies, setAvailableStrategies] = useState<any[]>([]);
    const [showSettings, setShowSettings] = useState(false);

    // Временные состояния для полей ввода
    const [tempMoney, setTempMoney] = useState(money);
    const [tempInterval, setTempInterval] = useState(interval);

    useEffect(() => {
        const today = new Date();
        setEndDate(today.toISOString().split('T')[0]);

        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(today.getDate() - 14);
        setStartDate(twoWeeksAgo.toISOString().split('T')[0]);
    }, [setStartDate, setEndDate]);

    useEffect(() => {
        const fetchData = async () => {
            const chartViewModel = ChartViewModel.getInstance();
            const botsViewModel = BotsViewModel.getInstance();

            // Загружаем стратегии
            const strategies = await chartViewModel.fetchAllStrategies();
            setAvailableStrategies(strategies);

            if (strategies.length > 0 && isBrokerDataLoaded) {
                const firstStrategy = strategies[0];
                setStrategy({
                    id: firstStrategy.id.toString(),
                    name: firstStrategy.name,
                    settings: Object.keys(firstStrategy.strategy_parameters).reduce((acc, key) => {
                        acc[key] = firstStrategy.strategy_parameters[key].default;
                        return acc;
                    }, {} as Record<string, any>),
                });

            }



            setTempMoney(money);
            setTempInterval(interval);


        };

        fetchData();
    }, [setStrategy, brokerId]);


    // Обработчик для поля "Начальный капитал"
    const handleMoneyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTempMoney(Number(e.target.value)); // Обновляем временное состояние
        setBrokerDataLoaded(true);

    };

    const handleMoneyBlur = () => {
        setMoney(tempMoney); // Сохраняем значение после потери фокуса
    };

    const handleMoneyKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            setMoney(tempMoney); // Сохраняем значение при нажатии Enter
        }
    };

    // Обработчик для поля "Таймфрейм"
    const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTempInterval(e.target.value); // Обновляем временное состояние
        setBrokerDataLoaded(true);

    };

    const handleIntervalBlur = () => {
        setInterval(tempInterval); // Сохраняем значение после потери фокуса
    };



    const handleStrategyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedStrategyId = parseInt(e.target.value);
        const selectedStrategy = availableStrategies.find(s => s.id === selectedStrategyId);
        if (selectedStrategy) {
            setStrategy({
                id: selectedStrategy.id.toString(),
                name: selectedStrategy.name,
                settings: Object.keys(selectedStrategy.strategy_parameters).reduce((acc, key) => {
                    acc[key] = selectedStrategy.strategy_parameters[key].default;
                    return acc;
                }, {} as Record<string, any>),
            });
        }
        setBrokerDataLoaded(true);

    };

    const handleSettingChange = (setting: string, value: string | number) => {
        const updatedSettings = { ...strategy.settings, [setting]: value };
        setBrokerDataLoaded(true);

        setStrategy({ ...strategy, settings: updatedSettings });
    };


    return (
        <>
            <div className="option-start-bot">
                <div className="input-group">
                    <div className="input-group-addon">
                        <label htmlFor="strategy">Стратегия:</label>
                        <select id="strategy" value={strategy.id} onChange={handleStrategyChange}>
                            {availableStrategies.map((strategy) => (
                                <option key={strategy.id} value={strategy.id}>
                                    {strategy.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <ToolTip text="Выберите стратегию для торговли" />
                </div>




                <div className="input-group">
                    <div className="input-group-addon">
                        <label htmlFor="interval">Таймфрейм:</label>
                        <select
                            id="interval"
                            value={tempInterval}
                            onChange={handleIntervalChange}
                            onBlur={handleIntervalBlur}
                        >
                            <option value="5">5min</option>
                            <option value="15">15min</option>
                            <option value="60">1h</option>
                            <option value="d">1d</option>
                        </select>
                    </div>
                    <ToolTip text="Выберите таймфрейм(расстояние во времени между свечами) для анализа" />
                </div>

                <div className="input-group">
                    <div className="input-group-addon">
                        <label htmlFor="money">Капитал:</label>
                        <input
                            id="money"
                            type="number"
                            value={tempMoney}
                            onChange={handleMoneyChange}
                            onBlur={handleMoneyBlur}
                            onKeyPress={handleMoneyKeyPress}
                        />
                    </div>
                    <ToolTip text="Укажите капитал для торговли" />
                </div>
            </div>

            <div className="option-start-bot">
                <div className="settings-header" onClick={() => setShowSettings(!showSettings)}>
                    <div className="bot-options-more-button" onClick={() => {
                        setShowSettings(!showSettings)
                    }} style={{ cursor: "pointer" }}>
                        <p>Настройки </p>
                        <img
                            src={arrow_img}
                            width={20}
                            alt="Toggle Statistics"
                            className={`arrow-icon ${showSettings ? "rotated" : ""}`}
                        />
                    </div>
                </div>

                <div className={`custom-settings ${showSettings ? "visible" : "hidden"}`}>
                    {Object.keys(strategy.settings).map((settingKey) => {
                        const paramNameRu = strategy.settings[settingKey]?.name_ru || settingKey;
                        return (
                            <div key={settingKey} className="input-group">
                                <label htmlFor={settingKey}>{paramNameRu}:</label>
                                <input
                                    id={settingKey}
                                    type="number"
                                    value={strategy.settings[settingKey] || ""}
                                    onChange={(e) => handleSettingChange(settingKey, e.target.value)}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default BotOptionsStart;