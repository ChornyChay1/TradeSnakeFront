import React from "react";
import { StrategyResult } from "../../interfaces/chart_interfaces";
// @ts-ignore
import arrow_img from "../../img/arrow.svg";

interface StatisticsProps {
    statistic: StrategyResult;
    showStatistic: boolean;
    toggleStatistic: () => void;
}

const Statistics: React.FC<StatisticsProps> = ({ statistic, showStatistic, toggleStatistic }) => {
    // Определяем, пригодна ли стратегия к рыночным условиям
    const isStrategySuitable = statistic.total_profit >= 0;

    return (
        <div className="option">
            <div className="profit-bar">
                <p>Прибыль: {statistic.profit_percent.toFixed(2)}%</p>
                <div className="bot-statistics-more-button" onClick={toggleStatistic} style={{ cursor: "pointer" }}>
                    <img
                        src={arrow_img}
                        alt="Toggle Statistics"
                        className={`arrow-icon ${showStatistic ? "rotated" : ""}`}
                    />
                </div>
            </div>
            <div className={`statistic-container ${showStatistic ? "visible" : ""}`}>
                <div className="statistic-block">
                    <p>Количество покупок: {statistic.buy_trade_count}</p>
                    <p>Количество продаж: {statistic.sell_trade_count}</p>
                    <p>Сумма покупки: {statistic.buy_sum_broker.toFixed(2)}</p>
                    <p>Сумма продажи: {statistic.sell_sum_broker.toFixed(2)}</p>
                    <p>Комиссия: {statistic.commission.toFixed(2)}</p>
                    <p>Сумма покупки без комиссии: {statistic.buy_sum.toFixed(2)}</p>
                    <p>Сумма продажи без комиссии: {statistic.sell_sum.toFixed(2)}</p>
                    <p>Прибыль без комиссии: {statistic.total_profit_without_broker.toFixed(2)}</p>
                    <p>Чистая прибыль: {statistic.total_profit.toFixed(2)}</p>

                    {/* Блок с сообщением о пригодности стратегии */}
                    <div className={`strategy-message ${isStrategySuitable ? "positive" : "negative"}`}>
                        {isStrategySuitable
                            ? "Данная стратегия пригодна к рыночным условиям"
                            : "Данная стратегия не пригодна к рыночным условиям"}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Statistics;