import {BotCreateRequest, BotProfitResponse, BrokerResponse} from "../interfaces/bots_interfaces";

export class BotsViewModel {
    private static instance: BotsViewModel;

    private bots_profit_data: BotProfitResponse[] = [];
    private market_analysis_result: any = null; // Хранение результата анализа рынка
    private brokers_data: BrokerResponse[] = []; // Добавляем стейт для хранения данных о брокерах

    private constructor() {
        // Приватный конструктор для предотвращения прямой инстанциации
    }

    public static getInstance(): BotsViewModel {
        if (!BotsViewModel.instance) {
            BotsViewModel.instance = new BotsViewModel();
        }
        return BotsViewModel.instance;
    }

    // Метод для получения прибыли ботов
    public async fetchBotsProfit(market_type?: string): Promise<void> {
        try {
            const url = new URL("http://localhost:8000/users/bots/bot/profit");

            // Если market_type передан, добавляем его в параметры запроса
            if (market_type) {
                url.searchParams.append("market_type", market_type);
            }

            const response = await fetch(url.toString(), {
                method: "GET",
                credentials: "include", // Сессия пользователя
            });

            if (!response.ok) {
                throw new Error("Failed to fetch bots profit");
            }

            const data = await response.json();

            // Форматируем start_time в каждом объекте
            this.bots_profit_data = data.bots_profit.map((bot: BotProfitResponse) => ({
                ...bot,
                create_time: this.formatDate(bot.create_time),
            }));
        } catch (error) {
            console.error("Failed to fetch bots profit", error);
        }
    }
    public async analyzeMarket(
        start_date: string,
        end_date: string,
        market_type_name: string,
        symbol: string
    ): Promise<any> {
        const startDateUnix = Math.floor(new Date(start_date).getTime() / 1000).toString();
        const endDateUnix = Math.floor(new Date(end_date).getTime() / 1000).toString();

        try {
            const url = "http://localhost:8000/utils/analyze";

            const requestData = {
                start_date : startDateUnix,
                end_date : endDateUnix,
                market_type_name,
                symbol,
            };

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                throw new Error(`Market analysis failed with status: ${response.status}`);
            }

            this.market_analysis_result = await response.json();
            return this.market_analysis_result;
        } catch (error) {
            console.error("Failed to analyze market", error);
            throw error;
        }
    }
    public async createBot(
        name: string,
        symbol: string,
        money: number,
        strategy_id: number,
        strategy_parameters: { [key: string]: string },
        broker_id: number // Добавляем broker_id
    ): Promise<any> {
        try {
            const url = "http://localhost:8000/users/bots/bot";

            const requestData: BotCreateRequest = {
                name,
                symbol,
                money,
                broker_id, // Передаём broker_id
                strategy_id,
                strategy_parameters,
            };

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                throw new Error(`Failed to create bot: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Failed to create bot", error);
            throw error;
        }
    }


    // Метод для форматирования даты в dd-mm-yyyy HH:MM:SS
    private formatDate(timestamp: string): string {
        const date = new Date(timestamp);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Месяцы начинаются с 0
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        return `${day}-${month}-${year} ${hours}:${minutes}`;
    }

    // Геттер для получения прибыли ботов
    public getBotsProfit(): BotProfitResponse[] {
        return this.bots_profit_data;
    }
    // Метод для получения данных о брокерах
    public async fetchBrokers(): Promise<void> {
        try {
            const url = "http://localhost:8000/utils/brokers"; // Эндпоинт для получения брокеров

            const response = await fetch(url, {
                method: "GET",
                credentials: "include", // Для передачи куки
            });

            if (!response.ok) {
                throw new Error("Failed to fetch brokers");
            }

            const data = await response.json();
            console.log(data);

            // @ts-ignore
            this.brokers_data = data.map((broker: BrokerResponse) => ({
                ...broker,
                symbols: JSON.parse(broker.symbols), // Преобразуем строку в массив
            }));
        } catch (error) {
            console.error("Failed to fetch brokers", error);
            throw error;
        }
    }

    // Геттер для получения данных о брокерах
    public getBrokers(): BrokerResponse[] {
        return this.brokers_data;
    }
}