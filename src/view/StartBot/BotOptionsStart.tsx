import React, { useEffect, useState } from "react";
import { StrategyOptions } from "../../interfaces/chart_interfaces";
import { ChartViewModel } from "../../viewmodel/chartViewModel";
import { BotsViewModel } from "../../viewmodel/botsViewModel"; // Импортируем BotsViewModel
// @ts-ignore
import arrow_img from "../../img/arrow.svg";
import ToolTip from "../Common/Tooltip"

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
    brokerId: number; // Добавляем brokerId
    setBrokerId: (value: number) => void; // Добавляем setBrokerId
}

const BotOptionsStart: React.FC<ChartOptionsProps> = ({
                                                          interval, setInterval, money, setMoney, symbol, setSymbol,
                                                          startDate, setStartDate, endDate, setEndDate,
                                                          strategy, setStrategy, brokerId, setBrokerId
                                                      }) => {
    const [availableStrategies, setAvailableStrategies] = useState<any[]>([]);
    const [availableSymbols, setAvailableSymbols] = useState<string[]>([]);
    const [showSettings, setShowSettings] = useState(false);
    const [brokers, setBrokers] = useState<any[]>([]); // Состояние для брокеров

    // Устанавливаем startDate и endDate в useEffect
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

            // Загружаем брокеров
            await botsViewModel.fetchBrokers();
            const brokersData = botsViewModel.getBrokers();
            setBrokers(brokersData);
            if (brokersData.length > 0) {
                setBrokerId(brokersData[0].id); // Устанавливаем первого брокера по умолчанию
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

    const handleSettingChange = (setting: string, value: string | number) => {
        const updatedSettings = { ...strategy.settings, [setting]: value };
        setStrategy({ ...strategy, settings: updatedSettings });
    };

    const handleBrokerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newBrokerId = parseInt(e.target.value);
        setBrokerId(newBrokerId); // Обновляем выбранного брокера
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
                    <ToolTip text="Выберите стратегию для торговли"/>
                </div>

                <div className="input-group">
                    <div className="input-group-addon">
                        <label htmlFor="broker">Брокер:</label>
                        <select id="broker" value={brokerId} onChange={handleBrokerChange}>
                            {brokers.map((broker) => (
                                <option key={broker.id} value={broker.id}>
                                {broker.broker_name} ({broker.market_type_name})
                                </option>
                            ))}
                        </select>
                    </div>
                    <ToolTip text={`Выберите брокера для торговли. Текущий брокер имеет параметры:
                     Спред: ${brokers.find(b => b.id === brokerId)?.spred || "неизвестно"}
                    , Комиссия: ${brokers.find(b => b.id === brokerId)?.procent_comission || "неизвестно"}
                     %`}/>
                </div>

                {brokers && (
                    <div className="input-group">
                        <div className="input-group-addon">
                        <label htmlFor="symbol">Валютная пара:</label>
                            <select id="symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)}>
                                {availableSymbols.map((sym) => (
                                    <option key={sym} value={sym}>
                                        {sym}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <ToolTip text="Выберите валютную пару для торговли"/>
                    </div>
                )}

                <div className="input-group">
                    <div className="input-group-addon">
                        <label htmlFor="interval">Таймфрейм:</label>
                        <select id="interval" value={interval} onChange={(e) => setInterval(e.target.value)}>
                            <option value="5">5min</option>
                            <option value="15">15min</option>
                            <option value="60">1h</option>
                            <option value="d">1d</option>
                        </select>
                    </div>
                    <ToolTip text="Выберите таймфрейм(расстояние во времени между свечами) для анализа"/>
                </div>

                <div className="input-group">
                    <div className="input-group-addon">

                        <label htmlFor="money">Капитал:</label>
                        <input id="money" type="number" value={money}
                               onChange={(e) => setMoney(Number(e.target.value))}/>
                    </div>
                    <ToolTip text="Укажите капитал для торговли"/>

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