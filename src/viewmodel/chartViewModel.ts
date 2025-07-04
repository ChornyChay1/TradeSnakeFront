import { StrategyResult } from "../interfaces/chart_interfaces";
import {server_address} from "../config";

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
            const response = await fetch(server_address+ "/utils/execute_historical", {
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
                volume:item.volume,
                turnover:item.turnover,

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

    public async fetchBotHistory(botId: number): Promise<void> {
        try {
            const response = await fetch( server_address + `/utils/get_combined_data?bot_id=${botId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include"
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
                volume:item.volume,
                turnover:item.turnover,
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
        const url = server_address + "/utils/strategies";
        const result = await this.fetchData(url);
        return result;
    }


}