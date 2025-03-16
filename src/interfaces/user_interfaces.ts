export interface UserStatisticsResponse {
    id: number;
    username: string;
    email: string;
    start_money: number;
    money: number;
    bot_count: number;
    market_count: number;
    broker_count: number;
    trade_count: number;
    buy_count: number;
    sell_count: number;
    total_profit: number;
    crypto_profit: number;
    forex_profit: number;
    stocks_profit: number;
}
export interface MoneyHistoryEntry {
    timestamp: string;
    money: number;
}
export interface TradeStatisticsEntry {
    bot_name: string;
    symbol: string;
    trade_type: string;
    price_by_broker: number;
    time: string;
    quantity: number;
}

export interface TradeStatisticsResponse {
    trade_statistics: TradeStatisticsEntry[];
}
