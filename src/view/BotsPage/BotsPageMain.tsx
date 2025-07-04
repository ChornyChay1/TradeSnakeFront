import React, { useEffect, useState } from "react";
import "../../css/bots/bots.css";
import "../../css/profile/profile.css";

import CommonButton from "../Common/CommonButton";
import { useNavigate } from "react-router-dom";
import ProfileHeader from "../Profile/Common/ProfileHeader";
import ProfileFooter from "../Profile/Common/ProfileFooter";
import { UserViewModel } from "../../viewmodel/userViewModel";
import AuthCheckerProfile from "../Profile/Common/AuthCheckerProfile";
import UserProfileInfo from "../Profile/Common/ProfileFirstRow";
import { BotsViewModel } from "../../viewmodel/botsViewModel";
import { BotProfitResponse } from "../../interfaces/bots_interfaces";
import BotProfitTable from "./BotProfitTable";

const BotsPageMain = () => {
    const navigate = useNavigate();
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

    // Состояния для данных по разным рынкам
    const [cryptoBotProfitData, setCryptoBotProfitData] = useState<BotProfitResponse[]>([]);
    const [forexBotProfitData, setForexBotProfitData] = useState<BotProfitResponse[]>([]);
    const [stocksBotProfitData, setStocksBotProfitData] = useState<BotProfitResponse[]>([]);
    useEffect(() => {
        if (userStatistics.money) {
            setAnimateBalance(true);
            const timer = setTimeout(() => setAnimateBalance(false), 500);
            return () => clearTimeout(timer);
        }
    }, [userStatistics.money]);
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

            // Запрос данных о прибыли ботов для разных рынков
            const botsViewModel = BotsViewModel.getInstance();

            await botsViewModel.fetchBotsProfit("Crypto");
            setCryptoBotProfitData(botsViewModel.getBotsProfit());

            await botsViewModel.fetchBotsProfit("Forex");
            setForexBotProfitData(botsViewModel.getBotsProfit());

            await botsViewModel.fetchBotsProfit("Stocks");
            setStocksBotProfitData(botsViewModel.getBotsProfit());
        };

        fetchData(); // Initial load

        const interval = setInterval(fetchData, 100000);
        return () => clearInterval(interval); // Cleanup interval on unmount
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

    return (
        <div className="main-bots">
            <AuthCheckerProfile />
            <ProfileHeader />
            <div className="main-bots-container">
                <UserProfileInfo
                    userStatistics={userStatistics}
                    percentage={userStatistics.procent}
                    animateName={animateName}
                    animateBalance={animateBalance}
                    handleRecharge={handleRecharge}
                    text={"Здесь виден список Ваших ботов и достижения их отдельно. Если списка ботов нет - создайте бота"}

                />
                <div className="bot-create-button">
                    <CommonButton text={"Создать бота"} onClick={()=>{navigate("/create-bot")}}/>
                </div>

                {/* Таблицы для разных типов рынков, рендерятся только при наличии данных */}
                {cryptoBotProfitData.length === 0 &&
                    forexBotProfitData.length === 0 &&
                    stocksBotProfitData.length === 0 && (
                        <div className="bots-placeholder">
                            <p>Здесь появится список ваших ботов после создания</p>
                        </div>
                    )}
                {cryptoBotProfitData.length > 0 && (
                    <BotProfitTable title={"Криптовалютные боты"} bots={cryptoBotProfitData} is_open={true} />
                )}
                {forexBotProfitData.length > 0 && <BotProfitTable title={"Боты Forex"} bots={forexBotProfitData} />}
                {stocksBotProfitData.length > 0 && <BotProfitTable title={"Боты Stocks"} bots={stocksBotProfitData} />}


            </div>
            <ProfileFooter />
        </div>
    );
};

export default BotsPageMain;
