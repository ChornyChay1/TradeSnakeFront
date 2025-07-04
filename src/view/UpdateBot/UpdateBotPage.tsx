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
import { BotProfitResponse, BotProfitResponseFull } from "../../interfaces/bots_interfaces";
import { UserViewModel } from "../../viewmodel/userViewModel";
import { BotsViewModel } from "../../viewmodel/botsViewModel";
import CommonButton from "../Common/CommonButton";
import AuthCheckerProfile from "../Profile/Common/AuthCheckerProfile";
import LoadingSpinner from "../Common/LoadingSpinner";
import BotOptionsUpdate from "./BotOptionsUpdate";
import CommonFooter from "../Profile/Common/ProfileFooter";
import Statistics from "../Simulation/Statistics";
import AnalyzeMarket from "../StartBot/AnalyzeMarket";
import { useNavigate, useParams } from "react-router-dom";
import StatisticsFullBot from "./StatisticsFullBot";
import UpdateBotFirstRow from "./UpdateBotFirstRow";
import ToolTip from "../../view/Common/Tooltip"
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

const UpdateBotPage = () => {
    const [chartData, setChartData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [statistic, setStatistic] = useState<StrategyResult>(defaultProfit);
    const [rsiData, setRsiData] = useState<LineProps | null>(null);
    const [isBotDataLoaded, setIsBotDataLoaded] = useState<boolean>(false);
    const [isBrokerDataLoaded, setIsBrokerDataLoaded] = useState<boolean>(false);
    const [isSimulation, setIsSimulation] = useState<boolean>(false);

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
    const {bot_id} = useParams<{ bot_id: string }>();
    // Стейт для индикаторов
    const [showModal, setShowModal] = useState(false);
    const [showStatistic, setShowStatistic] = useState(false);

    const [lines, setLines] = useState<LineProps[]>([]);
    const [linesOptions, setLinesOptions] = useState<LineOptions[]>([]);
    const [fullBotData, setFullBotData] = useState<BotProfitResponseFull>({
        bot_id: 0,
        bot_name: "",
        symbol: "",
        money: 0,
        isRunning: false,
        broker_name: "",
        market_name: "",
        market_type_name: "",
        create_time: "",
        profit: 0,
        buy_count: 0,
        sell_count: 0,
        sell_avg: 0,
        buy_avg: 0,
        broker_id: 0,
        symbol_count: 0,
        strategy_parameters: {},
        strategy_id: 0,
    });

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
        procent:0,
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
    const fetchDataSimulation = async () => {
        setIsLoading(true);
        try {
            const startDateUnix = Math.floor(new Date(startDate).getTime() / 1000);
            const endDateUnix = Math.floor(new Date(endDate).getTime() / 1000);


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

            await chartViewModel.fetchStrategyResult(Number(strategy.id), brokerId, intervalStrategy, money, symbol, strategyParams);
            setChartData(chartViewModel.data);
            setStatistic(chartViewModel.profit);
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        }
    };

    useEffect(() => {
        console.log("мы тут дата не загрузилась")

        if (isBotDataLoaded && isBrokerDataLoaded) {
            console.log("мы тут дата загрузилась")
            setIsSimulation(true);
            fetchDataSimulation()
        }
    }, [symbol,fullBotData.bot_name, money, strategy, brokerId, intervalStrategy, startDate, endDate]);

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


            // Всегда загружаем историю сделок
            await chartViewModel.fetchBotHistory(parseInt(bot_id!));
            setChartData(chartViewModel.data);
            setStatistic(chartViewModel.profit);

            if (!bot_id) return;

            const botsViewModel = BotsViewModel.getInstance();
            try {
                const botData = await botsViewModel.fetchBotProfit(parseInt(bot_id));
                setFullBotData(botData);
                setSymbol(botData.symbol);
                setMoney(botData.money);
                setBrokerId(botData.broker_id);

                const strategyParameters = typeof botData.strategy_parameters === 'string'
                    ? JSON.parse(botData.strategy_parameters)
                    : botData.strategy_parameters;
                setStrategy({
                    id: botData.strategy_id.toString(),
                    name: "strategy",
                    settings: Object.keys(botData.strategy_parameters)
                        .filter(key => key !== 'interval')  // Исключаем interval
                        .reduce((acc, key) => {
                            acc[key] = botData.strategy_parameters[key];
                            return acc;
                        }, {} as Record<string, any>),
                });
                setIntervalStrategy(strategyParameters.interval || "60");
                setIsLoading(false);
                setIsBotDataLoaded(true)
                const strategyId = Object.keys(strategies).find(
                    (key) => strategies[key].id === botData.strategy_id.toString()
                );
                if (strategyId) {
                    setStrategy(strategies[strategyId]);

                }

            } catch (error) {
                console.error("Failed to fetch bot data:", error);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        }
    };

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        if (bot_id) {
            fetchData();

        }
    }, [bot_id]);

    // Обработчик для отката симуляции
    const handleRevertSimulation = () => {
        fetchData();
        setIsSimulation(false);

    };

    const handleUpdateBot = async () => {
        const botsViewModel = BotsViewModel.getInstance();
        try {
            const strategyParameters: { [key: string]: string } = {
                interval: intervalStrategy,
            };

            for (const [key, value] of Object.entries(strategy.settings)) {
                strategyParameters[key] = value.toString();
            }
            await botsViewModel.updateBot(
                parseInt(bot_id!),
                fullBotData.bot_name,
                symbol,
                money,
                parseInt(strategy.id),
                strategyParameters,
                brokerId
            );

            setBotResult(true);
            setModalOpen(true);
        } catch (error) {
            console.error("Failed to update bot:", error);
            setBotResult(false);
            setModalOpen(true);
        }
    };


    const handleDeleteBot = async () => {
        const botsViewModel = BotsViewModel.getInstance();
        try {
            await botsViewModel.deleteBot(parseInt(bot_id!));
            navigate("/bots");
        } catch (error) {
            console.error("Failed to delete bot:", error);
        }
    };

    const setBotName = async (newName: string) => {
        const botsViewModel = BotsViewModel.getInstance();
        try {
            setFullBotData((prevData) => ({...prevData, bot_name: newName}));
        } catch (error) {
            console.error("Failed to update bot name:", error);
        }
    };

    const handleSwitchMode = async () => {
        const botsViewModel = BotsViewModel.getInstance();
        try {
            const botData = await botsViewModel.fetchBotProfit(parseInt(bot_id!));
            const isRunning = botData.isRunning;

            if (isRunning) {
                await botsViewModel.pauseBot(parseInt(bot_id!));
            } else {
                await botsViewModel.continueBot(parseInt(bot_id!));
            }

            const updatedBotData = await botsViewModel.fetchBotProfit(parseInt(bot_id!));
            setFullBotData(updatedBotData);
        } catch (error) {
            console.error("Failed to switch bot mode:", error);
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
            <ProfileHeader/>
            <AuthCheckerProfile/>
            <div className="start-bot-container">
                <UserProfileInfo
                    userStatistics={userStatistics}
                    percentage={userStatistics.procent}
                    animateName={animateName}
                    animateBalance={animateBalance}
                    handleRecharge={handleRecharge}
                    text={"Эта страница предназначена для обновления существующего бота. Выбирайте новые параметры и не забудьте нажать кнопку 'Обновить'"}
                />
                <UpdateBotFirstRow
                    botName={fullBotData.bot_name}
                    botMode={fullBotData.isRunning}
                    handleSwitchPowerBot={handleSwitchMode}
                    handleDeleteBot={handleDeleteBot}
                    setBotName={setBotName}
                />
                {isModalOpen && (
                    <div className="profile-modal">
                        <div className="profile-modal-overlay" onClick={() => setModalOpen(false)}></div>
                        <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="profile-modal-row">
                                <h2>Результат</h2>
                                <button onClick={() => setModalOpen(false)} className="profile-exit-modal-button">X
                                </button>
                            </div>
                            <div className="profile-modal-input-group">
                                <p>
                                    {botResult === true
                                        ? "Бот успешно обновлен!"
                                        : "Ошибка при обновлении бота."
                                    }
                                </p>
                            </div>
                            <CommonButton
                                text="Ок"
                                onClick={() => {
                                    setModalOpen(false);
                                    if (botResult === true) {
                                        navigate("/bots");
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}
                <div className="start-bot-content-container">
                    <div className="start-bot-settings-container">
                        <div className="header-start-bot-row">
                            <h2>Настройки бота</h2>
                        </div>
                        <div className="bot-option-start-container">
                            <BotOptionsUpdate
                                interval={intervalStrategy}
                                setBrokerDataLoaded={setIsBrokerDataLoaded}
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
                                brokerId={brokerId}
                                setBrokerId={setBrokerId}
                                isBrokerDataLoaded={isBrokerDataLoaded}
                            />
                            <div className="bot-option-end-bot-row">
                                <Statistics
                                    statistic={statistic}
                                    showStatistic={showStatistic}
                                    toggleStatistic={() => setShowStatistic(!showStatistic)}
                                />
                            </div>
                            <CommonButton text={"Обновить бота"} onClick={handleUpdateBot}/>
                        </div>
                    </div>
                    <div className="start-bot-chart-container">
                        <div className="visualisation-container-chart-start">
                            {isLoading ? (
                                <LoadingSpinner/>
                            ) : isSimulation ? (
                                <>
                                    <h2>
                                        Симуляция{" "}
                                        <ToolTip
                                            text={"Кликните на кнопку 'Сбросить симуляцию' чтобы откатить все изменения или обновите бота по этим параметрам."}/>
                                    </h2>
                                    <LightWeightChart data={chartData} symbol_name={symbol} lines={lines}/>
                                </>
                            ) : (
                                <>
                                    <h2>История сделок</h2>
                                    <LightWeightChart data={chartData} symbol_name={symbol} lines={lines}/>
                                </>
                            )}
                        </div>
                        <div className="chart-buttons">
                            {isSimulation && (
                                <CommonButton
                                    text="Откатить симуляцию"
                                    onClick={handleRevertSimulation}
                                />
                            )}
                        </div>
                        <StatisticsFullBot botData={fullBotData}/>
                        <AnalyzeMarket endDate={endDate} marketType={"Crypto"} startDate={startDate} symbol={symbol}/>
                    </div>
                </div>
            </div>
            <CommonFooter/>
        </div>
    );
};

export default UpdateBotPage;