import { StrategyResult } from "../interfaces/chart_interfaces";

export class ChartViewModel {
    private static instance: ChartViewModel;

    private chartData: any[] = [];
    private profitData: StrategyResult = {
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

    private constructor() {
        // Private constructor to prevent direct instantiation
    }

    public static getInstance(): ChartViewModel {
        if (!ChartViewModel.instance) {
            ChartViewModel.instance = new ChartViewModel();
        }
        return ChartViewModel.instance;
    }

    // Общий метод для выполнения запросов
    private async fetchData(url: string): Promise<any> {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Failed to fetch data:", error);
            throw error;
        }
    }

    // Общий метод для форматирования данных
    private formatChartData(data: any[]): any[] {
        return data.map((item) => ({
            time: item.timestamp,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            sell: !!item.sell?.price,
            buy: !!item.buy?.price
        }));
    }

    // Метод для получения результатов тестирования стратегии MA
    public async fetchTestingBotResultWithMA(
        symbol: string,
        startDate: string,
        endDate: string,
        maPeriod: number,
        maQuantity: number
    ): Promise<void> {
        const url = `http://localhost:8000/test_strategy?symbol=${symbol}&start_date=${startDate}&end_date=${endDate}&period=${maPeriod}&quantity=${maQuantity}&strategy_type=moving_average`;
        const result = await this.fetchData(url);
        this.chartData = this.formatChartData(result.data);
        this.profitData = result.statistic[0];
    }

    // Метод для получения результатов тестирования стратегии Double MA
    public async fetchTestingBotResultWithDoubleMA(
        symbol: string,
        startDate: string,
        endDate: string,
        maShortPeriod: number,
        maLongPeriod: number,
        maQuantity: number
    ): Promise<void> {
        const url = `http://localhost:8000/test_strategy?symbol=${symbol}&start_date=${startDate}&end_date=${endDate}&shortPeriod=${maShortPeriod}&longPeriod=${maLongPeriod}&quantity=${maQuantity}&strategy_type=double_moving_average`;
        const result = await this.fetchData(url);
        this.chartData = this.formatChartData(result.data);
        this.profitData = result.statistic[0];
    }

    // Метод для получения результатов тестирования стратегии Triple MA
    public async fetchTestingBotResultWithTripleMA(
        symbol: string,
        startDate: string,
        endDate: string,
        maQuantity: number
    ): Promise<void> {
        const url = `http://localhost:8000/test_strategy?symbol=${symbol}&start_date=${startDate}&end_date=${endDate}&quantity=${maQuantity}&strategy_type=triple_moving_average`;
        const result = await this.fetchData(url);
        this.chartData = this.formatChartData(result.data);
        this.profitData = result.statistic[0];
    }

    // Метод для получения результатов тестирования стратегии Trend
    public async fetchTestingBotResultWithTrand(
        symbol: string,
        startDate: string,
        endDate: string,
        maShortPeriod: number,
        maLongPeriod: number,
        maQuantity: number,
        rsiPeriod: number
    ): Promise<void> {
        const url = `http://localhost:8000/test_strategy?symbol=${symbol}&start_date=${startDate}&end_date=${endDate}&shortPeriod=${maShortPeriod}&longPeriod=${maLongPeriod}&quantity=${maQuantity}&rsi_period=${rsiPeriod}&strategy_type=trand_strategy`;
        const result = await this.fetchData(url);
        this.chartData = this.formatChartData(result.data);
        this.profitData = result.statistic[0];
    }

    // Метод для получения данных графика
    public get data(): any[] {
        return this.chartData;
    }

    // Метод для получения данных о прибыли
    public get profit(): StrategyResult {
        return this.profitData;
    }

    public async fetchStrategyResult(strategyId: number, brokerId: number,interval:string,money:number,symbol:string, strategyParams: Record<string, any>): Promise<void> {
        try {
            const response = await fetch("http://localhost:8000/utils/execute_historical", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    strategy_id: strategyId,
                    broker_id: brokerId,
                    interval: interval,
                    symbol: symbol,
                    money: money,
                    strategy_parameters: strategyParams
                }),
                credentials:"include"
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                throw new Error(errorResponse.detail || `Failed to fetch strategy results (Status: ${response.status})`);
            }

            const result = await response.json();

            if (!Array.isArray(result.results)) {
                throw new Error("Invalid response format: 'results' should be an array.");
            }

            this.chartData = result.results.map((item: any) => ({
                time: Number(item.timestamp)/1000, // Преобразуем в число
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close,
                sell: item.sell && Object.keys(item.sell).length > 0 ? {
                    broker_price: item.sell.broker_price,
                    price: item.sell.price,
                    quantity: item.sell.quantity
                } : null,
                buy: item.buy && Object.keys(item.buy).length > 0 ? {
                    broker_price: item.buy.broker_price,
                    price: item.buy.price,
                    quantity: item.buy.quantity
                } : null
            }));
                this.profitData = result.bot_summary;


        } catch (error) {
            console.error("Failed to fetch strategy results:", error);
        }
    }

    // Метод для получения всех стратегий
    public async fetchAllStrategies(): Promise<any[]> {
        const url = "http://localhost:8000/utils/strategies";
        const result = await this.fetchData(url);
        return result;
    }


}