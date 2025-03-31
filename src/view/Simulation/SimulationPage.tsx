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
import CommonFooter from "../Profile/Common/ProfileFooter";
import {calculateEMASeriesData} from "../../utils/EMA";
import {calculateSRLevels} from "../../utils/SRLevels";
import {calculateBollingerBandsSeriesData} from "../../utils/BollingerBands";
import {calculateADXSeriesData} from "../../utils/ADX"; // Импортируем компонент спиннера
import {indicators} from "../../utils/indicatorsDesc";
import {useNavigate} from "react-router-dom";
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
    const navigate = useNavigate();
    // Стейт для параметров запроса
    const [symbol, setSymbol] = useState<string>("BTCUSD");
    const [startDate, setStartDate] = useState<string>("2023-05-03");
    const [endDate, setEndDate] = useState<string>("2023-05-09");
    const [intervalStrategy, setIntervalStrategy] = useState<string>("60"); // Новый стейт для таймфрейма
    const [money, setMoney] = useState<number>(1000); // Новый стейт для начального капитала
    const [brokerId, setBorkerId] = useState<number>(1); // Новый стейт для начального капитала

    // Стейт для стратегии
    const [strategy, setStrategy] = useState<StrategyOptions>(strategies["none"]);

    // Стейт для индикаторов
    const [showModal, setShowModal] = useState(false);
    const [showStatistic, setShowStatistic] = useState(false);

    const [lines, setLines] = useState<LineProps[]>([]);
    const [linesOptions, setLinesOptions] = useState<LineOptions[]>([]);

    const [isModalOpen, setModalOpen] = useState(false);
    const [botResult, setBotResult] = useState<boolean | string>(false); // Изменён тип на boolean | string


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
        procent:0,

        forex_profit: 0,
        stocks_profit: 0,
    });


    useEffect(() => {
        const fetchData = async () => {
            const userViewModel = UserViewModel.getInstance();
            await userViewModel.fetchUserStatistics();
            const stats = userViewModel.getUserStatistics();
            setUserStatistics(stats);

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
    const handleCreateBot = async () => {
        const botsViewModel = BotsViewModel.getInstance();
        try {
            const botName = `Bot_${symbol}_${new Date().toLocaleString()}`; // Генерация имени бота

            // Подготовка параметров стратегии (все значения — строки)
            const strategyParameters: { [key: string]: string } = {
                interval: intervalStrategy, // Добавляем интервал
            };

            // Добавляем все параметры из strategy.settings
            for (const [key, value] of Object.entries(strategy.settings)) {
                strategyParameters[key] = value.toString(); // Преобразуем все значения в строки
            }

            const response = await botsViewModel.createBot(
                botName,
                symbol,
                money,
                parseInt(strategy.id), // Преобразуем id стратегии в число
                strategyParameters,
                brokerId // Передаём brokerId
            );

            setBotResult(true); // Успешное создание бота
            setModalOpen(true); // Открываем модальное окно
        } catch (error) {
            console.error("Failed to create bot:", error);


            // @ts-ignore
            if (error.response && error.response.status === 400) {
                setBotResult("insufficient_funds"); // Устанавливаем специальное значение для ошибки 400
            } else { // @ts-ignore
                if (error.detail === "Insufficient funds") {
                    setBotResult("insufficient_funds"); // Устанавливаем специальное значение для ошибки 400
                } else {
                    setBotResult(false); // Ошибка при создании бота
                }
            }
            setModalOpen(true); // Открываем модальное окно
        }
    };
    const fetchData = async () => {
        setIsLoading(true); // Устанавливаем состояние загрузки
        try {
            clearIndicators();

            // Преобразуем startDate и endDate в Unix-время (секунды)
            const startDateUnix = Math.floor(new Date(startDate).getTime() / 1000);
            const endDateUnix = Math.floor(new Date(endDate).getTime() / 1000);

            // Создаем базовые параметры
            const stringSettings = {};
            for (const [key, value] of Object.entries(strategy.settings)) {
                // @ts-ignore
                stringSettings[key] = value.toString();
            }

            // Создаем параметры стратегии
            let strategyParams = {
                ...stringSettings, // Используем преобразованные в строки настройки
                start_date: startDateUnix.toString(),
                end_date: endDateUnix.toString(),
                money: money ? money.toString() : "0"
            };

            // Добавляем индикаторы для конкретных стратегий
            if (strategy.id === "1") {
                addIndicator("MA", strategy.settings.ma_length, "#ff00e3");
            }
            console.log(strategy.settings)
            if (strategy.id === "2") {
                addIndicator("RSI", strategy.settings.rsi_period, "#ff00e3");
            }
            if (strategy.id === "3") {
                addIndicator("MA", strategy.settings.ma_length, "#0048ff");
                addIndicator("RSI", strategy.settings.rsi_period, "#ff00e3");
            }
            // Вызов универсального метода
            await chartViewModel.fetchStrategyResult(
                Number(strategy.id),
                brokerId,
                intervalStrategy,
                money,
                symbol,
                strategyParams
            );

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
                if (lineOption?.emaPeriod !== undefined) {
                    return {
                        ...line,
                        data: calculateEMASeriesData(chartData, lineOption.emaPeriod),
                    };
                }
                if (lineOption?.adxPeriod !== undefined) {
                    return {
                        ...line,
                        data: calculateADXSeriesData(chartData, lineOption.adxPeriod),
                    };
                }
                if (lineOption?.rsiPeriod !== undefined) {
                    return {
                        ...line,
                        data: calculateRSISeriesData(chartData, lineOption.rsiPeriod),
                    };
                }
                if (lineOption?.bollngerPeriod !== undefined && lineOption.bollngerDeviation !== undefined) {
                    return {
                        ...line,
                        data: calculateBollingerBandsSeriesData(chartData,lineOption.bollngerPeriod, lineOption.bollngerDeviation),
                    };
                }
                return line;
            });
        });
    }, [chartData, linesOptions]);

    const addIndicator = (
        indicator: string, period?: number, color?: string,

    ) => {
        setLines((prevLines) => {
            let newLine: LineProps;
            let newLineOptions: LineOptions;

            if (indicator.startsWith("MA")) {
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
                console.log(newLine)
            } else if (indicator.startsWith("RSI")) {
                newLine = {
                    type: "line",
                    color: color || "#FF0000",
                    data: calculateRSISeriesData(chartData, period || 14),
                    name: "RSI",
                };
                newLineOptions = {
                    name: "RSI",
                    color: color || "#FF0000",
                    rsiPeriod: period || 14,
                };
            }
            else if (indicator.startsWith("ADX")) {
                newLine = {
                    type: "line",
                    color: color || "#ff6200",
                    data: calculateADXSeriesData(chartData, period || 14),
                    name: "ADX",
                };
                newLineOptions = {
                    name: "ADX",
                    color: color || "#ff6200",
                    adxPeriod: period || 14,

                };
            }
            else if (indicator.startsWith("BollingerBands")) {
                newLine = {
                    type: "line",
                    color: color || "#ee00ff",
                    data: calculateBollingerBandsSeriesData(chartData, period || 14),
                    name: "BollingerBands",
                };
                newLineOptions = {
                    name: "BollingerBands",
                    color: color || "#ee00ff",

                    bollngerPeriod: period || 14,
                    bollngerDeviation: 2,

                };
            }
            else if (indicator.startsWith("SRLevels")) {
                newLine = {
                    type: "line",
                    color: color || "rgba(255,255,255,0)",
                    data: calculateSRLevels(chartData),
                    name: "SRLevels",
                };
                newLineOptions = {
                    name: "SRLevels"
                };
            }

            else if (indicator.startsWith("Volume")) {
                newLine = {
                    name: "Volume",
                    type: "line", // Изменено на histogram для столбчатого отображения
                    data: chartData.map(item => {
                        // Определяем цвет на основе направления свечи
                        const barColor = item.close > item.open
                            ? '#26a69a'  // Зеленый для бычьих свечей
                            : '#ef5350'; // Красный для медвежьих

                        return {
                            time: item.time,
                            value: item.volume,
                            color: barColor  // Динамический цвет
                        };
                    }),
                    color: color || "#FF0000",
                };
                newLineOptions = {
                    name: "Volume",

                };
            }

            else if (indicator.startsWith("EMA")) {
                newLine = {
                    type: "line",
                    color: color || "#00ffda",
                    data: calculateEMASeriesData(chartData, period || 14),
                    name: indicator,
                };
                newLineOptions = {
                    name: indicator,
                    emaPeriod: period || 14,
                    color: color || "#00ffda",

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
    useEffect(() => {
        if (userStatistics.money) {
            setAnimateBalance(true);
            const timer = setTimeout(() => setAnimateBalance(false), 500);
            return () => clearTimeout(timer);
        }
    }, [userStatistics.money]);
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
            {isModalOpen && (
                <div className="profile-modal">
                    <div className="profile-modal-overlay" onClick={() => setModalOpen(false)}></div>
                    <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="profile-modal-row">
                            <h2>Результат</h2>
                            <button onClick={() => setModalOpen(false)} className="profile-exit-modal-button">X</button>
                        </div>
                        <div className="profile-modal-input-group">
                            <p>
                                {botResult === true
                                    ? "Бот успешно создан!"
                                    : botResult === "insufficient_funds"
                                        ? "У вас недостаточно денег для создания бота."
                                        : "Ошибка при создании бота.Пожалуйста, проверьте, хватает ли Вам денег"
                                }
                            </p>
                        </div>
                        <CommonButton
                            text="Ок"
                            onClick={() => {
                                setModalOpen(false); // Закрываем модальное окно
                                if (botResult === true) {
                                    navigate("/bots"); // Переход на страницу /bots только при успешном создании бота
                                }
                            }}
                        />
                    </div>
                </div>
            )}
            <div className="bot-settings-container">
                <UserProfileInfo
                    userStatistics={userStatistics}
                    percentage={userStatistics.procent}
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
                            brokerId={brokerId}
                            setBrokerId={setBorkerId}
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
                        <CommonButton text={"Создать бота с этими параметрами"} onClick={handleCreateBot} color={"white"} />

                    </div>
                </div>
            </div>
            <CommonFooter />
        </div>
    );
};

export default SimulationPage;