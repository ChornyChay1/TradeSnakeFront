import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "../../css/profile/profile.css";
import {UserStatisticsResponse} from "../../interfaces/user_interfaces";

interface StatisticBlockProps {
    statistics: UserStatisticsResponse;
}

const GREEN = "#28a745";
const RED = "#dc3545";  // Для отрицательных прибылей
const GREY = "#c5c5c5";

const StatisticBlock: React.FC<StatisticBlockProps> = ({ statistics }) => {
    const [selected, setSelected] = useState<string | null>(null);
    const [animateStats, setAnimateStats] = useState(false);

    const { total_profit, crypto_profit, forex_profit, stocks_profit } = statistics;

    // Данные для диаграммы (значения берём по модулю)
    const data = [
        { name: "Прибыль crypto", value: Math.abs(crypto_profit), originalValue: crypto_profit },
        { name: "Прибыль forex", value: Math.abs(forex_profit), originalValue: forex_profit },
        { name: "Прибыль акций", value: Math.abs(stocks_profit), originalValue: stocks_profit },
    ];

    const selectedData = data.find((d) => d.name === selected);
    const selectedPercent =
        selectedData && total_profit !== 0
            ? ((selectedData.value / total_profit) * 100).toFixed(2)
            : "0";

    // Функция для определения цвета (красный для отрицательных, зеленый для положительных)
    const getColor = (value: number) => (value < 0 ? RED : GREEN);

    // Формируем строку из ключевых значений статистики
    const statsString = `${statistics.start_money}-${statistics.money}-${statistics.bot_count}-${statistics.broker_count}-${statistics.market_count}-${statistics.total_profit}-${statistics.crypto_profit}-${statistics.forex_profit}-${statistics.stocks_profit}`;

    // При изменении этой строки (то есть изменении значений) запускаем анимацию
    useEffect(() => {
        setAnimateStats(true);
        const timer = setTimeout(() => setAnimateStats(false), 500);
        return () => clearTimeout(timer);
    }, [statsString]);

    return (
        <div className="statistic-container-profile">
            <div className="diagramma-column">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart width={600} height={300}>
                        <Pie
                            key={selected}
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="40%"
                            innerRadius={75}
                            outerRadius={115}
                            animationDuration={500}
                            animationBegin={0}
                            animationEasing="ease-out"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={selected === entry.name ? getColor(entry.originalValue) : GREY}
                                    onClick={() => setSelected(entry.name)}
                                    style={{ cursor: "pointer" }}
                                />
                            ))}
                        </Pie>
                     </PieChart>
                </ResponsiveContainer>

                {selected && (
                    <div className="diagramma-center-text">
                        <p>{selectedPercent}%</p>
                    </div>
                )}

                <div className="buttons">
                    {data.map((entry) => (
                        <button
                            key={entry.name}
                            className={selected === entry.name ? "selected" : ""}
                            onClick={() => setSelected(entry.name)}
                        >
                            {entry.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className={`text-statistic-column ${animateStats ? 'balance-animation' : ''}`}>
                <h2>Общая статистика</h2>
                <div className="statistics-grid">
                    <div className="statistic-labels">
                        <p>Изначальный баланс:</p>
                        <p>Конечный баланс:</p>
                        <p>Количество cделок:
                        </p>

                        <p>Количество ботов:</p>
                        <p>Задействовано брокеров:</p>
                        <p>Задействовано рынков:</p>
                        <p>Общая прибыль:</p>
                        <p>Общий процент прибыли:</p>
                    </div>
                    <div className="statistic-values">
                        <p>{statistics.start_money.toFixed(2)} USD</p>
                        <p>{statistics.money.toFixed(2)} USD</p>
                        <p>
                            <span style={{color: "green"}}>{statistics.buy_count}</span>/
                            <span style={{color: "red"}}>{statistics.sell_count}</span> </p>
                        <p>{statistics.bot_count}</p>
                        <p>{statistics.broker_count}</p>
                        <p>{statistics.market_count}</p>
                        <p style={{color: getColor(statistics.total_profit)}}>
                            {statistics.total_profit.toFixed(2)} USD
                        </p>
                        <p style={{color: getColor(statistics.total_profit)}}>
                            {statistics.start_money !== 0
                                ? ((statistics.total_profit / statistics.start_money) * 100).toFixed(2)
                                : "0"} %
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatisticBlock;
