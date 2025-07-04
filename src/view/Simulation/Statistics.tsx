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
    const getStrategyStatus = () => {
        if (statistic.buy_trade_count === 0 || statistic.sell_trade_count === 0) {
            return {
                className: "neutral",
                message: "Недостаточно данных для оценки стратегии"
            };
        }

        if (statistic.buy_trade_count === statistic.sell_trade_count) {
            return statistic.buy_sum_broker > statistic.sell_sum_broker
                ? {
                    className: "negative",
                    message: "Стратегия не пригодна к рыночным условиям"
                }
                : {
                    className: "positive",
                    message: "Стратегия пригодна к рыночным условиям"
                };
        } else {
            return (statistic.buy_sum_broker / statistic.buy_trade_count) >
            (statistic.sell_sum_broker / statistic.sell_trade_count)
                ? {
                    className: "negative",
                    message: "Стратегия не пригодна к рыночным условиям (неравное количество сделок)"
                }
                : {
                    className: "positive",
                    message: "Стратегия пригодна к рыночным условиям (неравное количество сделок)"
                };
        }
    };

    const strategyStatus = getStrategyStatus();

    return (
        <div className="option">
            <div className="profit-bar">
                <p>Чистая прибыль: {statistic.total_profit.toFixed(2)}</p>
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

                    <p>Средняя сумма покупки: {(statistic.buy_sum_broker / statistic.buy_trade_count).toFixed(2)}</p>
                    <p>Средняя сумма продажи: {(statistic.sell_sum_broker / statistic.sell_trade_count).toFixed(2)}</p>

                    <p>Комиссия: {statistic.commission.toFixed(2)}</p>
                    <p>Сумма покупки без комиссии: {statistic.buy_sum.toFixed(2)}</p>
                    <p>Сумма продажи без комиссии: {statistic.sell_sum.toFixed(2)}</p>
                    <p>Прибыль без комиссии: {statistic.total_profit_without_broker.toFixed(2)}</p>

                    {/* Блок с сообщением о пригодности стратегии */}
                    <div className={`strategy-message ${strategyStatus.className}`}>
                        {strategyStatus.message}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Statistics;