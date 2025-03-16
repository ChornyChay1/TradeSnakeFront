import React, { useEffect, useState } from "react";
import "../../css/profile/profile.css";
import { useNavigate } from "react-router-dom";
import { UserViewModel } from "../../viewmodel/userViewModel";

const Logs = () => {
    const navigate = useNavigate();
    const [tradeStatistics, setTradeStatistics] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [animate, setAnimate] = useState(false);

    // Функция загрузки статистики
    const fetchTradeStatistics = async () => {
        try {
            setLoading(true);
            const userViewModel = UserViewModel.getInstance();
            await userViewModel.fetchTradeStatistics();
            setTradeStatistics(userViewModel.getTradeStatistics());
            setError(null);
        } catch (err) {
            setError("Failed to load trade statistics");
            console.error("Error loading trade statistics", err);
        } finally {
            setLoading(false);
        }
    };

    // Первый вызов при монтировании
    useEffect(() => {
        fetchTradeStatistics();


        const interval = setInterval(fetchTradeStatistics, 100000);

        return () => clearInterval(interval); // Очищаем интервал при размонтировании
    }, []);

    // Запуск анимации после загрузки данных
    useEffect(() => {
        if (!loading && tradeStatistics.length > 0) {
            setAnimate(true);
        }
    }, [loading, tradeStatistics]);

    // Функция рендера сообщений
    const renderTradeMessage = (trade: any) => {
        const action = trade.trade_type === "Sell" ? "продал" : "купил";
        return `${trade.formattedTime} - ${trade.bot_name} ${action} ${trade.symbol} в размере ${trade.quantity} за ${trade.price_by_broker}`;
    };

    // Определение цвета для индикатора
    const getActionColor = (tradeType: string): string => {
        return tradeType === "Sell" ? "red" : "green";
    };

    if (loading) {
        return <div></div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="logs">
            <div className={`logs-list ${animate ? "fade-in" : ""}`}>
                {tradeStatistics.length > 0 ? (
                    tradeStatistics.map((trade, index) => (
                        <div key={index} className="log-item">
                            <span
                                className="trade-action-indicator"
                                style={{ backgroundColor: getActionColor(trade.trade_type) }}
                            ></span>
                            {renderTradeMessage(trade)}
                        </div>
                    ))
                ) : (
                    <div>Нет данных о трейдах</div>
                )}
            </div>
        </div>
    );
};

export default Logs;
