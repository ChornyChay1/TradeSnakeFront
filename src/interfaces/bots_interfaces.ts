export interface BotProfitResponse {
        bot_id: number;
        bot_name: string;
        symbol: string;
        broker_name: string;
        market_name: string;
        market_type_name: string;
        create_time: string;
        profit: number;
}
export interface BotCreateRequest {
        name: string;
        symbol: string;
        money: number;
        broker_id: number;
        strategy_id: number; // strategy_id остаётся числом
        strategy_parameters: {
                [key: string]: string; // Все значения в strategy_parameters — строки
        };
}
export interface BrokerResponse {
        id: number;
        broker_name: string;
        market_name: string;
        market_type_name: string;
        spred: number;
        procent_comission: number;
        fox_comission: number;
        symbols:string
}