import React, { useState } from "react";
import { BotProfitResponseFull } from "../../interfaces/bots_interfaces";
// @ts-ignore
import arrow_img from "../../img/arrow.svg";

interface StatisticsFullBotProps {
    botData: BotProfitResponseFull; // Данные о боте, переданные из пропсов
}

const translateMarketType = (type: string): string => {
    switch (type) {
        case "Crypto":
            return "Криптовалюты";
        case "Forex":
            return "Валютные пары";
        case "Stocks":
            return "Акции";
        default:
            return type;
    }
};

const StatisticsFullBot: React.FC<StatisticsFullBotProps> = ({ botData }) => {
    const [showSettings, setShowSettings] = useState(false);

    const translatedMarketType = translateMarketType(botData.market_type_name);

    return (
        <div className="start-bot-analyze-container">
            <div>
                <div className="settings-header" onClick={() => setShowSettings(!showSettings)}>
                    <div className="bot-options-more-button" style={{ cursor: "pointer" }}>
                        <h2>Статистика бота {botData.bot_name}</h2>
                        <img
                            src={arrow_img}
                            width={20}
                            alt="Toggle Statistics"
                            className={`arrow-icon ${showSettings ? "rotated" : ""}`}
                        />
                    </div>
                </div>

                <div className={`custom-settings ${showSettings ? "visible" : "hidden"}`}>
                    <div className="bot-option-container">
                        <div>
                            <h2>Основная информация</h2>
                            <p>Имя бота: {botData.bot_name}</p>
                            <p>Символ: {botData.symbol}</p>
                            <p>Капитал: {botData.money}</p>
                            <p>Валюты сейчас: {botData.symbol_count.toFixed(4)}</p>
                            <p>Тип рынка: {translatedMarketType}</p>
                            <p>Брокер: {botData.broker_name}</p>
                            <p>Дата создания: {botData.create_time}</p>
                        </div>

                        <div>
                        <h2>Статистика торгов</h2>
                            <p>Прибыль: {botData.profit}</p>
                            <p>Количество покупок: {botData.buy_count}</p>
                            <p>Количество продаж: {botData.sell_count}</p>
                            <p>Средняя цена покупки: {botData.buy_avg.toFixed(2)}</p>
                            <p>Средняя цена продажи: {botData.sell_avg.toFixed(2)}</p>
                        </div>
                        <div>
                            <h2>Параметры стратегии</h2>
                            {Object.entries(botData.strategy_parameters).map(([key, value]) => (
                                <p key={key}>{key}: {value}</p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatisticsFullBot;