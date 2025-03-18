import React, { useEffect, useState } from "react";
import "../../css/main-page/test.css";
import "../../css/start_bot/start_bot.css";
import LightWeightChart from "../Chart/LightWeightChart";
import { ChartViewModel } from "../../viewmodel/chartViewModel";
import { LineOptions, LineProps, StrategyOptions, StrategyResult } from "../../interfaces/chart_interfaces";
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
import BotOptionsStart from "./BotOptionsStart";
import CommonFooter from "../Profile/Common/ProfileFooter";
import Statistics from "../Simulation/Statistics";
import AnalyzeMarket from "./AnalyzeMarket";
import { useNavigate } from "react-router-dom";

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
    profit_percent: 0,
};

const StartBotPage = () => {
    const [chartData, setChartData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [statistic, setStatistic] = useState<StrategyResult>(defaultProfit);
    const [rsiData, setRsiData] = useState<LineProps | null>(null);

    // Стейт для параметров запроса
    const [symbol, setSymbol] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("2025-03-15");
    const [endDate, setEndDate] = useState<string>("2025-03-16");
    const [intervalStrategy, setIntervalStrategy] = useState<string>("60");
    const [money, setMoney] = useState<number>(1000);
    const [isModalOpen, setModalOpen] = useState(false);
    const [botResult, setBotResult] = useState<boolean | string>(false); // Изменён тип на boolean | string
    const [brokerId, setBrokerId] = useState<number>(0);
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
    const navigate = useNavigate();

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

        fetchData();
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

    const clearIndicators = () => {
        setLines([]);
        setLinesOptions([]);
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            clearIndicators();

            if (brokerId == 0) {
                return;
            }
            const startDateUnix = Math.floor(new Date(startDate).getTime() / 1000);
            const endDateUnix = Math.floor(new Date(endDate).getTime() / 1000);

            let strategyParams = {};

            if (strategy.id === "1") {
                strategyParams = {
                    ma_length: strategy.settings.ma_length.toString(),
                    start_date: startDateUnix.toString(),
                    end_date: endDateUnix.toString(),
                    money: money.toString(),
                };
            }

            await chartViewModel.fetchStrategyResult(Number(strategy.id), brokerId, intervalStrategy, money, symbol, strategyParams);

            setChartData(chartViewModel.data);
            setStatistic(chartViewModel.profit);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [symbol, startDate, endDate, strategy, brokerId, intervalStrategy, money]);

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


            // Проверяем, является ыли ошибка ошибкой 400 (недостаточно средств)
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
    useEffect(() => {
        if (userStatistics.money) {
            setAnimateBalance(true);
            const timer = setTimeout(() => setAnimateBalance(false), 500);
            return () => clearTimeout(timer);
        }
    }, [userStatistics.money]);
    return (
        <div className="start-bot">
            <ProfileHeader />
            <AuthCheckerProfile />
            <div className="start-bot-container">
                <UserProfileInfo
                    userStatistics={userStatistics}
                    percentage={percentage}
                    animateName={animateName}
                    animateBalance={animateBalance}
                    handleRecharge={handleRecharge}
                    text={"На этой странице Вы можете создать бота, предварительно его протестировав."}
                />
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
                <div className="start-bot-content-container">
                    <div className="start-bot-settings-container">
                        <div className="header-start-bot-row">
                            <h2>Создание бота</h2>
                        </div>
                        <div className="bot-option-start-container">
                            <BotOptionsStart
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
                                brokerId={brokerId} // Передаём brokerId
                                setBrokerId={setBrokerId} // Передаём setBrokerId
                            />
                            <div className="bot-option-end-bot-row">
                                <Statistics
                                    statistic={statistic}
                                    showStatistic={showStatistic}
                                    toggleStatistic={() => setShowStatistic(!showStatistic)}
                                />
                            </div>
                            <CommonButton text={"Создать бота"} onClick={handleCreateBot} />
                        </div>
                    </div>
                    <div className="start-bot-chart-container">
                        <AnalyzeMarket endDate={endDate} marketType={"Crypto"} startDate={startDate} symbol={symbol} />
                        <div className="visualisation-container-chart-start">
                            {isLoading ? (
                                <LoadingSpinner />
                            ) : (
                                <LightWeightChart data={chartData} symbol_name={symbol} lines={lines} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <CommonFooter />
        </div>
    );
};

export default StartBotPage;