import { UserStatisticsResponse, MoneyHistoryEntry, TradeStatisticsEntry, TradeStatisticsResponse } from "../interfaces/user_interfaces";

export class UserViewModel {
    private static instance: UserViewModel;

    private user_statistics_data: UserStatisticsResponse = {
        id: 0,
        username: "",
        email: "",
        start_money: 0,
        money: 0,
        bot_count: 0,
        market_count: 0,
        broker_count: 0,
        buy_count: 0,
        procent:0,
        sell_count: 0,
        trade_count: 0,
        total_profit: 0,
        crypto_profit: 0,
        forex_profit: 0,
        stocks_profit: 0,
    };

    private money_history: MoneyHistoryEntry[] = [];
    private trade_statistics: TradeStatisticsEntry[] = [];

    private constructor() {
        // Private constructor to prevent direct instantiation
    }

    public static getInstance(): UserViewModel {
        if (!UserViewModel.instance) {
            UserViewModel.instance = new UserViewModel();
        }
        return UserViewModel.instance;
    }

    public async downloadMoneyHistoryReport(): Promise<void> {
        try {
            const response = await fetch('http://localhost:8000/users/money_history/export', {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to download money history report');
            }

            // Получаем blob с файлом
            const blob = await response.blob();

            // Создаем ссылку для скачивания
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', 'money_history.xlsx');

            // Добавляем ссылку в DOM и эмулируем клик
            document.body.appendChild(link);
            link.click();

            // Удаляем ссылку после скачивания
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error("Failed to download money history report", error);
            throw error; // Пробрасываем ошибку для обработки в UI
        }
    }
    // Метод для пополнения денег пользователя
    public async addUserMoney(amount: number): Promise<void> {
        try {
            const response = await fetch('http://localhost:8000/users/add_money', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount }), // Отправляем сумму для пополнения
                credentials: 'include', // Сессия пользователя
            });

            if (!response.ok) {
                throw new Error('Failed to add money to user');
            }

            // После успешного пополнения получаем обновленную статистику пользователя
            await this.fetchUserStatistics();
        } catch (error) {
            console.error("Failed to add user money", error);
        }
    }


    // Метод для получения статистики пользователя
    public async fetchUserStatistics(): Promise<void> {
        try {

            const response = await fetch('http://localhost:8000/users/statistics', {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user statistics');
            }

            const data: UserStatisticsResponse = await response.json();
            this.user_statistics_data = data;
        } catch (error) {
            console.error("Failed to fetch user statistics", error);
        }
    }

    // Метод для получения истории денег пользователя
    public async fetchMoneyHistory(): Promise<void> {
        try {
            const response = await fetch('http://localhost:8000/users/money_history', {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch money history');
            }

            const data: MoneyHistoryEntry[] = await response.json();
            this.money_history = data;
        } catch (error) {
            console.error("Failed to fetch money history", error);
        }
    }

    // Метод для получения статистики трейдов пользователя
    public async fetchTradeStatistics(): Promise<void> {
        try {
            const response = await fetch('http://localhost:8000/users/trade_statistics', {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch trade statistics');
            }

            const data: TradeStatisticsResponse = await response.json();
            this.trade_statistics = data.trade_statistics;
        } catch (error) {
            console.error("Failed to fetch trade statistics", error);
        }
    }

    // Метод для форматирования даты в формат dd-mm-yyyy hh:mm
    private formatDate(dateString: string): string {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${day}-${month}-${year} ${hours}:${minutes}`;
    }

    // Геттер для получения данных статистики
    public getUserStatistics(): UserStatisticsResponse {
        return this.user_statistics_data;
    }

    // Геттер для истории денег
    public getMoneyHistory(): MoneyHistoryEntry[] {
        return this.money_history;
    }

    // Геттер для статистики трейдов
    public getTradeStatistics(): TradeStatisticsEntry[] {
        // Для каждого трейда форматируем время
        return this.trade_statistics.map((trade) => ({
            ...trade,
            formattedTime: this.formatDate(trade.time),
        }));
    }
}
