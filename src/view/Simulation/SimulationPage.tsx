import React, { useEffect, useState } from "react";
import "../../css/main-page/test.css";
import "../../css/botsSettings/bots-settings.css";

import LightWeightChart from "../Chart/LightWeightChart";
import { ChartViewModel } from "../../viewmodel/chartViewModel";
import { LineOptions, LineProps, StrategyOptions, StrategyResult } from "../../interfaces/chart_interfaces";
import Statistics from "./Statistics";
import IndicatorConfig from "./IndicatorConfig";
import IndicatorModal from "./IndicatorModal";
import ChartOptions from "./ChartOptions";
import { calculateMovingAverageSeriesData } from "../../utils/movingAverage";
import { calculateRSISeriesData } from "../../utils/RSI";
import { strategies } from "../../interfaces/strategy_options";
import ProfileHeader from "../Profile/Common/ProfileHeader";
import UserProfileInfo from "../Profile/Common/ProfileFirstRow";
import { BotProfitResponse } from "../../interfaces/bots_interfaces";
import { UserViewModel } from "../../viewmodel/userViewModel";
import { BotsViewModel } from "../../viewmodel/botsViewModel";
import CommonButton from "../Common/CommonButton";
import AuthCheckerProfile from "../Profile/Common/AuthCheckerProfile";
import LoadingSpinner from "../Common/LoadingSpinner";
import CommonFooter from "../Profile/Common/ProfileFooter"; // Импортируем компонент спиннера

const defaultProfit: StrategyResult = {
    sell_sum: 0,
    buy_sum: 0,
    total_profit_without_broker: 0,
    sell_sum_broker: 0,
    buy_sum_broker: 0,
    total_profit: 0,
    total_trade_count: 0,
    sell_trade_count: 0,
    buy_trade_count: 0,
    commission: 0,
    profit_percent: 0
};

const SimulationPage = () => {
    const [chartData, setChartData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [statistic, setStatistic] = useState<StrategyResult>(defaultProfit);
    const [rsiData, setRsiData] = useState<LineProps | null>(null);

    // Стейт для параметров запроса
    const [symbol, setSymbol] = useState<string>("BTCUSD");
    const [startDate, setStartDate] = useState<string>("2023-05-03");
    const [endDate, setEndDate] = useState<string>("2023-05-09");
    const [intervalStrategy, setIntervalStrategy] = useState<string>("60"); // Новый стейт для таймфрейма
    const [money, setMoney] = useState<number>(1000); // Новый стейт для начального капитала

    // Стейт для стратегии
    const [strategy, setStrategy] = useState<StrategyOptions>(strategies["none"]);

    // Стейт для индикаторов
    const [showModal, setShowModal] = useState(false);
    const [showStatistic, setShowStatistic] = useState(false);

    const [lines, setLines] = useState<LineProps[]>([]);
    const [linesOptions, setLinesOptions] = useState<LineOptions[]>([]);

    const indicators = ["MA", "Double MA", "RSI"];

    const chartViewModel = ChartViewModel.getInstance();
    const [rechargeAmount, setRechargeAmount] = useState(10);
    const [animateBalance, setAnimateBalance] = useState(false);
    const [animateName, setAnimateName] = useState(false);

    const [userStatistics, setUserStatistics] = useState({
        id: 0,
        username: "",
        email: "",
        start_money: 0,
        money: 0,
        bot_count: 0,
        market_count: 0,
        broker_count: 0,
        trade_count: 0,
        sell_count: 0,
        buy_count: 0,
        total_profit: 0,
        crypto_profit: 0,
        forex_profit: 0,
        stocks_profit: 0,
    });

    const [percentage, setPercentage] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            const userViewModel = UserViewModel.getInstance();
            await userViewModel.fetchUserStatistics();
            const stats = userViewModel.getUserStatistics();
            setUserStatistics(stats);

            if (stats.start_money !== 0) {
                const percent = ((stats.money - stats.start_money) / stats.start_money) * 100;
                setPercentage(percent);
            } else {
                setPercentage(0);
            }
            setAnimateBalance(true);
        };

        fetchData(); // Initial load
    }, []);

    const handleRecharge = async (amount: number) => {
        const userViewModel = UserViewModel.getInstance();
        try {
            await userViewModel.addUserMoney(amount);
            await userViewModel.fetchUserStatistics();
            const updatedStats = userViewModel.getUserStatistics();
            setUserStatistics(updatedStats);

            await userViewModel.fetchMoneyHistory();
            setAnimateBalance(true);
        } catch (error) {
            console.error("Error updating balance:", error);
        }
    };

    // Функция для очистки старых индикаторов
    const clearIndicators = () => {
        setLines([]);
        setLinesOptions([]);
    };

    const fetchData = async () => {
        setIsLoading(true); // Устанавливаем состояние загрузки
        try {
            clearIndicators();


            // Преобразуем startDate и endDate в Unix-время (секунды)
            const startDateUnix = Math.floor(new Date(startDate).getTime() / 1000);
            const endDateUnix = Math.floor(new Date(endDate).getTime() / 1000);

            // Подготовка параметров стратегии
            let strategyParams = {};

            if (strategy.id === "1") {
                strategyParams = {
                    ma_length: strategy.settings.ma_length.toString(),
                    start_date: startDateUnix.toString(), // Используем Unix-время
                    end_date: endDateUnix.toString(), // Используем Unix-время
                    money: money.toString(), // Используем значение money
                };
                addIndicator("MA", strategy.settings.ma_length, "#ff00e3");
            }


            // Вызов универсального метода
            await chartViewModel.fetchStrategyResult(1, 1, intervalStrategy, money, symbol, strategyParams);

            setChartData(chartViewModel.data);
            setStatistic(chartViewModel.profit);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false); // Сбрасываем состояние загрузки
        }
    };

    useEffect(() => {
        fetchData();
    }, [symbol, startDate, endDate, strategy, intervalStrategy, money]); // Добавляем interval и money в зависимости

    useEffect(() => {
        setLines((prevLines) => {
            return prevLines.map((line) => {
                const lineOption = linesOptions.find(option => option.name === line.name);

                if (lineOption?.maPeriod !== undefined) {
                    return {
                        ...line,
                        data: calculateMovingAverageSeriesData(chartData, lineOption.maPeriod),
                    };
                }
                return line;
            });
        });
    }, [chartData, linesOptions]);

    const addIndicator = (indicator: string, period?: number, color?: string) => {
        setLines((prevLines) => {
            let newLine: LineProps;
            let newLineOptions: LineOptions;

            if (indicator.startsWith("MA")) {
                newLine = {
                    type: "line",
                    color: color || "#0000FF",
                    data: calculateMovingAverageSeriesData(chartData, period || 14),
                    name: "MA",
                };
                newLineOptions = {
                    name: "MA",
                    maPeriod: period || 14,
                    color: color || "#0000FF",
                };
            } else if (indicator.startsWith("RSI")) {
                newLine = {
                    type: "line",
                    color: color || "#FF0000",
                    data: calculateRSISeriesData(chartData, period || 14),
                    name: "RSI",
                };
                newLineOptions = {
                    name: "RSI",
                    rsiPeriod: period || 14,
                };
            } else {
                newLine = {
                    type: "line",
                    color: color || "#0000FF",
                    data: calculateMovingAverageSeriesData(chartData, period || 14),
                    name: indicator,
                };
                newLineOptions = {
                    name: indicator,
                    maPeriod: period || 14,
                    color: color || "#0000FF",
                };
            }

            const newLines = [...prevLines, newLine];

            setLinesOptions((prevOptions) => {
                if (!prevOptions.some(option => option.name === newLineOptions.name)) {
                    return [...prevOptions, newLineOptions];
                }
                return prevOptions;
            });

            return newLines;
        });

        setShowModal(false);
    };

    return (
        <div className="bot-settings">
            <ProfileHeader />
            <AuthCheckerProfile />
            {showModal && (
                <IndicatorModal
                    indicators={indicators}
                    addIndicator={addIndicator}
                    closeModal={() => setShowModal(false)}
                />
            )}
            <div className="bot-settings-container">
                <UserProfileInfo
                    userStatistics={userStatistics}
                    percentage={percentage}
                    animateName={animateName}
                    animateBalance={animateBalance}
                    handleRecharge={handleRecharge}
                    text={"На этой странице происходит симуляция торгов на исторических данных. Вы можете протестировать стратегии не создавая бота"}
                />
                <h2 className="bots-settings-header">Симуляция</h2>
                <div className="bot-settings-container-workarea">
                    <div className="visualisation-container">
                        <div className="visualisation-container-chart">
                            {isLoading ? (
                                <LoadingSpinner /> // Отображаем спиннер, если isLoading = true
                            ) : (
                                <LightWeightChart data={chartData} symbol_name={symbol} lines={lines} />
                            )}
                        </div>
                        <div className="bottom-bar">
                            <div className="button-bottom-bar">
                                <CommonButton text={"Добавить индикатор"} onClick={() => setShowModal(true)} />
                            </div>

                            <IndicatorConfig lineOptions={linesOptions} setLineOptions={setLinesOptions}
                                             setLines={setLines}
                                             lines={lines} />
                        </div>
                    </div>

                    <div className="options-bar">
                        <ChartOptions
                            interval={intervalStrategy}
                            setInterval={setIntervalStrategy}
                            money={money}
                            setMoney={setMoney}
                            symbol={symbol}
                            setSymbol={setSymbol}
                            startDate={startDate}
                            setStartDate={setStartDate}
                            endDate={endDate}
                            setEndDate={setEndDate}
                            strategy={strategy}
                            setStrategy={setStrategy}
                        />

                        <Statistics
                            statistic={statistic}
                            showStatistic={showStatistic}
                            toggleStatistic={() => {
                                setShowStatistic(!showStatistic);
                            }}
                        />
                    </div>
                </div>
            </div>
            <CommonFooter />
        </div>
    );
};

export default SimulationPage;