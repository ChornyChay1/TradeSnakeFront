import {
    BotCreateRequest,
    BotProfitResponse,
    BotProfitResponseFull,
    BrokerResponse
} from "../interfaces/bots_interfaces";

export class BotsViewModel {
    private static instance: BotsViewModel;

    private bots_profit_data: BotProfitResponse[]  = []
    private bot_profit_data: BotProfitResponseFull =
{
    bot_id: 0,
    isRunning:false,
    bot_name: "",
    symbol: "",
    money: 0,
    broker_name:  "",
    market_name: "",
    market_type_name: "",
    create_time:"",
    profit: 0,
    buy_count:0,
    sell_count: 0,
    sell_avg: 0,
    buy_avg:0,
    broker_id: 0,
    symbol_count: 0,
    strategy_parameters: {},
    strategy_id:0
};

    private market_analysis_result: any = null; // Хранение результата анализа рынка
    private brokers_data: BrokerResponse[] = []; // Добавляем стейт для хранения данных о брокерах

    private constructor() {
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
    public async deleteBot(bot_id: number): Promise<void> {
        try {
            const url = `http://localhost:8000/users/bots/bot/${bot_id}`;

            const response = await fetch(url, {
                method: "POST",
                credentials: "include", // Для передачи куки (сессии пользователя)
            });

            if (!response.ok) {
                throw new Error(`Failed to delete bot: ${response.statusText}`);
            }

            console.log("Bot deleted successfully");
        } catch (error) {
            console.error("Failed to delete bot", error);
            throw error;
        }
    }
    // Метод для обновления бота
    public async updateBot(
        bot_id: number,
        name: string,
        symbol: string,
        money: number,
        strategy_id: number,
        strategy_parameters: { [key: string]: string },
        broker_id: number
    ): Promise<any> {
        try {
            const url = `http://localhost:8000/users/bots/bot/${bot_id}/update`;

            const requestData: BotCreateRequest = {
                name,
                symbol,
                money,
                broker_id,
                strategy_id,
                strategy_parameters,
            };

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // Для передачи куки (сессии пользователя)
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                throw new Error(`Failed to update bot: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Failed to update bot", error);
            throw error;
        }
    }

    public async fetchBotProfit(bot_id: number): Promise<BotProfitResponseFull> {
        try {
            const url = new URL(`http://localhost:8000/users/bots/bot/profit/${bot_id}`);

            const response = await fetch(url.toString(), {
                method: "GET",
                credentials: "include", // Для передачи куки (сессии пользователя)
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch bot profit: ${response.statusText}`);
            }

            const data = await response.json();

            // Проверяем, что strategy_parameters является объектом
            if (typeof data.bot_profit.strategy_parameters === 'string') {
                data.bot_profit.strategy_parameters = JSON.parse(data.bot_profit.strategy_parameters);
            }
            // Сохраняем данные о прибыли бота
            this.bot_profit_data = {
                ...data.bot_profit,
            };


            return this.bot_profit_data;
        } catch (error) {
            console.error("Failed to fetch bot profit", error);
            throw error;
        }
    }
    // Геттер для получения данных о прибыли конкретного бота
    public getBotProfit(): BotProfitResponseFull | null {
        return this.bot_profit_data;
    }

    // Метод для анализа рынка
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
                start_date: startDateUnix,
                end_date: endDateUnix,
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

    // Метод для создания бота
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

    // Геттер для получения прибыли всех ботов
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
    // Метод для приостановки бота
    public async pauseBot(bot_id: number): Promise<void> {
        try {
            const url = `http://localhost:8000/users/bots/bot/${bot_id}/pause`;

            const response = await fetch(url, {
                method: "POST",
                credentials: "include", // Для передачи куки (сессии пользователя)
            });

            if (!response.ok) {
                throw new Error(`Failed to pause bot: ${response.statusText}`);
            }

            console.log("Bot paused successfully");
        } catch (error) {
            console.error("Failed to pause bot", error);
            throw error;
        }
    }

    // Метод для продолжения работы бота
    public async continueBot(bot_id: number): Promise<void> {
        try {
            const url = `http://localhost:8000/users/bots/bot/${bot_id}/continue`;

            const response = await fetch(url, {
                method: "POST",
                credentials: "include", // Для передачи куки (сессии пользователя)
            });

            if (!response.ok) {
                throw new Error(`Failed to continue bot: ${response.statusText}`);
            }

            console.log("Bot continued successfully");
        } catch (error) {
            console.error("Failed to continue bot", error);
            throw error;
        }
    }

    // Геттер для получения данных о брокерах
    public getBrokers(): BrokerResponse[] {
        return this.brokers_data;
    }
}