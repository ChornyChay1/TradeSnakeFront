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
}

const ChartOptions: React.FC<ChartOptionsProps> = ({
                                                       interval, setInterval, money, setMoney, symbol, setSymbol,
                                                       startDate, setStartDate, endDate, setEndDate,
                                                       strategy, setStrategy, brokerId, setBrokerId
                                                   }) => {
    const [availableStrategies, setAvailableStrategies] = useState<any[]>([]);
    const [availableSymbols, setAvailableSymbols] = useState<string[]>([]);
    const [brokers, setBrokers] = useState<any[]>([]);
    const [showSettings, setShowSettings] = useState(false);
    const [tempStartDate, setTempStartDate] = useState(startDate);
    const [tempEndDate, setTempEndDate] = useState(endDate);

    useEffect(() => {
        setTempStartDate(startDate);
        setTempEndDate(endDate);
    }, [startDate, endDate]);

    useEffect(() => {
        const fetchData = async () => {
            const chartViewModel = ChartViewModel.getInstance();
            const botsViewModel = BotsViewModel.getInstance();

            // Загрузка стратегий
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
            }

            // Загрузка брокеров
            await botsViewModel.fetchBrokers();
            const brokersData = botsViewModel.getBrokers();
            setBrokers(brokersData);

            if (brokersData.length > 0) {
                setBrokerId(brokersData[0].id);
                updateSymbolsForBroker(brokersData[0].id);
            }
        };

        fetchData();
    }, [setStrategy, setBrokerId]);

    useEffect(() => {
        if (brokerId && brokers.length > 0) {
            updateSymbolsForBroker(brokerId);
        }
    }, [brokerId, brokers]);

    const updateSymbolsForBroker = (brokerId: number) => {
        const selectedBroker = brokers.find(b => b.id === brokerId);
        if (selectedBroker && selectedBroker.symbols) {
            setAvailableSymbols(selectedBroker.symbols);
            if (selectedBroker.symbols.length > 0) {
                setSymbol(selectedBroker.symbols[0]);
            }
        } else {
            setAvailableSymbols([]);
        }
    };

    const getMaxEndDate = (start: string, interval: string): string => {
        const startDateObj = new Date(start);
        let maxDateObj: Date;

        switch (interval) {
            case "5": maxDateObj = new Date(startDateObj); maxDateObj.setMonth(startDateObj.getMonth() + 1); break;
            case "15": maxDateObj = new Date(startDateObj); maxDateObj.setMonth(startDateObj.getMonth() + 3); break;
            case "60": maxDateObj = new Date(startDateObj); maxDateObj.setFullYear(startDateObj.getFullYear() + 1); break;
            case "d": maxDateObj = new Date(startDateObj); maxDateObj.setFullYear(startDateObj.getFullYear() + 24); break;
            default: maxDateObj = new Date(startDateObj); maxDateObj.setFullYear(startDateObj.getFullYear() + 1);
        }

        return maxDateObj.toISOString().split("T")[0];
    };

    const validateEndDate = (start: string, end: string, interval: string): string => {
        const maxEndDate = getMaxEndDate(start, interval);
        return end > maxEndDate ? maxEndDate : end;
    };

    const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newInterval = e.target.value;
        setInterval(newInterval);
        const newEndDate = validateEndDate(tempStartDate, tempEndDate, newInterval);
        setEndDate(newEndDate);
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDate = e.target.value;
        setTempStartDate(newStartDate);

        // Only update the actual date when input is complete (on blur)
    };

    const handleStartDateBlur = () => {
        if (tempStartDate !== startDate) {
            setStartDate(tempStartDate);
            const newEndDate = validateEndDate(tempStartDate, tempEndDate, interval);
            setEndDate(newEndDate);
        }
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEndDate = e.target.value;
        setTempEndDate(newEndDate);

        // Only update the actual date when input is complete (on blur)
    };

    const handleEndDateBlur = () => {
        if (tempEndDate !== endDate) {
            const validatedEndDate = validateEndDate(tempStartDate, tempEndDate, interval);
            setEndDate(validatedEndDate);
        }
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
    };

    const handleBrokerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newBrokerId = parseInt(e.target.value);
        setBrokerId(newBrokerId);
    };

    const handleSettingChange = (setting: string, value: string | number) => {
        const updatedSettings = { ...strategy.settings, [setting]: value };
        setStrategy({ ...strategy, settings: updatedSettings });
    };

    return (
        <>
            <div className="option">
                <div className="input-group">
                    <ToolTip
                        text={`Спред: ${brokers.find(b => b.id === brokerId)?.spred || "неизвестно"}, Комиссия: ${brokers.find(b => b.id === brokerId)?.procent_comission || "неизвестно"}%`}/>
                    <label htmlFor="broker">Брокер:</label>
                    <select id="broker" value={brokerId} onChange={handleBrokerChange}>
                        {brokers.map((broker) => (
                            <option key={broker.id} value={broker.id}>
                                {broker.broker_name} ({broker.market_type_name})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="option">
                <div className="input-group">
                    <label htmlFor="symbol">Валютная пара:</label>
                    <select id="symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)}>
                        {availableSymbols.map((sym) => (
                            <option key={sym} value={sym}>{sym}</option>
                        ))}
                    </select>
                </div>

                <div className="input-group">
                    <label htmlFor="strategy">Стратегия:</label>
                    <select id="strategy" value={strategy.id} onChange={handleStrategyChange}>
                        {availableStrategies.map((strategy) => (
                            <option key={strategy.id} value={strategy.id}>
                                {strategy.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="option">
                <div className="input-group">
                    <label htmlFor="interval">Таймфрейм:</label>
                    <select id="interval" value={interval} onChange={handleIntervalChange}>
                        <option value="5">5min</option>
                        <option value="15">15min</option>
                        <option value="60">1h</option>
                        <option value="d">1d</option>
                    </select>
                </div>

                <div className="input-group">
                    <label htmlFor="money">Капитал:</label>
                    <input
                        id="money"
                        type="number"
                        value={money}
                        onChange={(e) => setMoney(Number(e.target.value))}
                    />
                </div>
            </div>

            <div className="option">
                <div className="input-group">
                    <label htmlFor="start-date">Дата начала:</label>
                    <input
                        id="start-date"
                        type="date"
                        value={tempStartDate}
                        onChange={handleStartDateChange}
                        onBlur={handleStartDateBlur}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="end-date">Дата конца:</label>
                    <input
                        id="end-date"
                        type="date"
                        value={tempEndDate}
                        onChange={handleEndDateChange}
                        onBlur={handleEndDateBlur}
                        max={getMaxEndDate(tempStartDate, interval)}
                    />
                </div>
            </div>

            <div className="option">
                <div className="settings-header" onClick={() => setShowSettings(!showSettings)}>
                    <div className="bot-options-more-button" onClick={() => {
                        setShowSettings(!showSettings)
                    }} style={{cursor: "pointer"}}>
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

export default ChartOptions;