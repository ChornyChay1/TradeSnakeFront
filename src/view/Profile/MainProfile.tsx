import React, { useEffect, useState } from "react";
import "../../css/profile/profile.css";
import CommonButton from "../Common/CommonButton";
import { useNavigate } from "react-router-dom";
import ProfileHeader from "./Common/ProfileHeader";
import ProgressImage from "./ProgressImage";
import ProfileFooter from "./Common/ProfileFooter";
import { UserViewModel } from "../../viewmodel/userViewModel";
import LineChart from "../Chart/LinearChart";
import Logs from "./Logs";
import StatisticBlock from "./StatisticBlock";
import AuthCheckerProfile from "./Common/AuthCheckerProfile";
import UserProfileInfo from "./Common/ProfileFirstRow";

interface LineChartProps {
    data: { timestamp: number; money: number }[];
    lines?: { color: string; data: { timestamp: number; value: number }[] }[];
    symbolName: string;
}

const MainProfile = () => {
    const navigate = useNavigate();
    const [rechargeAmount, setRechargeAmount] = useState(10);
    const [animateBalance, setAnimateBalance] = useState(false);
    const [animateName, setAnimateName] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

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
        procent: 0,
        total_profit: 0,
        crypto_profit: 0,
        forex_profit: 0,
        stocks_profit: 0,
    });

    const [percentage, setPercentage] = useState(0);
    const [moneyHistory, setMoneyHistory] = useState<LineChartProps["data"]>([]);

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

            await userViewModel.fetchMoneyHistory();
            const moneyHistoryData = userViewModel.getMoneyHistory();
            const chartData = moneyHistoryData.map(entry => ({
                timestamp: Date.parse(entry.timestamp),
                money: entry.money,
            }));

            setMoneyHistory(chartData);
        };

        fetchData();
        const interval = setInterval(fetchData, 100000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (userStatistics.money) {
            setAnimateBalance(true);
            const timer = setTimeout(() => setAnimateBalance(false), 500);
            return () => clearTimeout(timer);
        }
    }, [userStatistics.money]);

    useEffect(() => {
        if (userStatistics.username) {
            setAnimateName(true);
            const timer = setTimeout(() => setAnimateName(false), 500);
            return () => clearTimeout(timer);
        }
    }, [userStatistics.username]);

    const handleRecharge = async (amount: number) => {
        const userViewModel = UserViewModel.getInstance();
        try {
            await userViewModel.addUserMoney(amount);
            await userViewModel.fetchUserStatistics();
            const updatedStats = userViewModel.getUserStatistics();
            setUserStatistics(updatedStats);

            await userViewModel.fetchMoneyHistory().then(() => {
                const moneyHistoryData = userViewModel.getMoneyHistory();
                const chartData = moneyHistoryData.map(entry => ({
                    timestamp: Date.parse(entry.timestamp),
                    money: entry.money,
                }));
                setMoneyHistory(chartData);
            });

            setAnimateBalance(true);
        } catch (error) {
            console.error("Error updating balance:", error);
        }
    };

    const handleDownloadReport = async () => {
        const userViewModel = UserViewModel.getInstance();
        setIsDownloading(true);
        try {
            await userViewModel.downloadMoneyHistoryReport();
        } catch (error) {
            console.error("Failed to download report:", error);
            // Можно добавить уведомление об ошибке
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="main-profile">
            <AuthCheckerProfile/>
            <ProfileHeader />
            <div className="main-profile-container">
                <UserProfileInfo
                    userStatistics={userStatistics}
                    percentage={userStatistics.procent}
                    animateName={animateName}
                    animateBalance={animateBalance}
                    handleRecharge={handleRecharge}
                    text={"Здесь показываются основные ваши достижения а также логи работы Ваших ботов. Данные обновляются в реальном времени"}
                />

                <div className="main-profile-container-content">
                    <div className="main-profile-content-statistic-col">
                        <div className="chart-profit-container">
                            <h2>График доходности</h2>
                            {
                                moneyHistory.length > 0 ? (
                                    <LineChart
                                        data={moneyHistory}
                                        symbolName="Баланс USD"
                                    />
                                ) : (
                                    <div className="chart-placeholder">
                                        <p>График появится после первых операций</p>

                                    </div>
                                )
                            }
                        </div>
                        <div className="statistic-container-profile">
                            <StatisticBlock statistics={userStatistics}/>
                        </div>
                    </div>
                    <div>

                    </div>
                    <div className="main-profile-content-log">
                        <div className="main-profile-content-log-col">
                            <h2>Активность ботов</h2>
                            <Logs/>
                        </div>

                        {!isDownloading ? (

                            <CommonButton
                            text={ "Скачать выгрузку операций"}
                            onClick={handleDownloadReport}
                            color={"green"}
                        />
                        ) : (
                            <CommonButton text="Скачивание ..." color={"white"}/>
                        )}

                    </div>
                </div>
            </div>
            <ProfileFooter/>
        </div>
    );
};

export default MainProfile;