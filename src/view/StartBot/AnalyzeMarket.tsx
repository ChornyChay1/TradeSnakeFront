import React, { useState, useEffect } from "react";
import { BotsViewModel } from "../../viewmodel/botsViewModel";
// @ts-ignore
import arrow_img from "../../img/arrow.svg";

interface MarketAnalysisProps {
    startDate: string;
    endDate: string;
    marketType: string;
    symbol: string;
}

interface MarketAnalysisResult {
    max_price: number;
    min_price: number;
    trend: string;
    volatility_persent: number;
    volatility: number;
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

const translateTrend = (trend: string): string => {
    switch (trend) {
        case "Flat":
            return "Рынок в боковике. Не рекомендуются трендовые стратегии";
        case "Up":
            return "Наблюдается тренд. Цена растёт";
        case "Down":
            return "Наблюдается тренд. Цена падает";
        default:
            return trend;
    }
};

const MarketAnalysis: React.FC<MarketAnalysisProps> = ({ startDate, endDate, marketType, symbol }) => {
    const [analysis, setAnalysis] = useState<MarketAnalysisResult | null>(null);
    const [translatedMarketType, setTranslatedMarketType] = useState<string>(translateMarketType(marketType));
    const [error, setError] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const viewModel = BotsViewModel.getInstance();
                const result = await viewModel.analyzeMarket(startDate, endDate, marketType, symbol);

                // Переводим тренд на русский язык
                result.trend = translateTrend(result.trend);

                // Обновляем данные
                setAnalysis(result);
                setTranslatedMarketType(translateMarketType(marketType)); // Обновляем название рынка
            } catch (err) {
                setError("Ошибка при загрузке анализа рынка.");
            }
        };

        fetchAnalysis();
    }, [startDate, endDate, marketType, symbol]);

    if (error) {
        return <p style={{ color: "red" }}>{error}</p>;
    }

    if (!analysis) {
        return <p>Загрузка данных...</p>;
    }

    return (
        <div className="start-bot-analyze-container">
            <div>
                <div className="settings-header" onClick={() => setShowSettings(!showSettings)}>
                    <div className="bot-options-more-button" style={{ cursor: "pointer" }}>
                        <h2>Анализ {symbol} на период с {startDate} по {endDate}</h2>
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
                            <p>Макс. цена: {analysis.max_price}</p>
                            <p>Мин. цена: {analysis.min_price}</p>
                        </div>
                        <div>
                            <p>Состояние: {analysis.trend}</p>
                            <p>Волатильность: {analysis.volatility_persent.toFixed(2)}%
                                ({analysis.volatility.toFixed(2)})</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketAnalysis;