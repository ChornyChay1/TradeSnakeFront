export interface ZoomLevel {
    xMin: Date ;
    xMax: Date;
    yMin: number;
    yMax: number;
}

export interface SeriesOptions {
    type?: "line" | "area" | "bars" | "candlesticks" | "scatter";
    color?: string;
    lineWidth?: number;
    pointSize?: number;
    visibleInLegend?: boolean;
    pointShape?:string; // Новое свойство
    lineDashStyle?:any;
    curveType?:string;
    label?:string;
}

export interface ChartProps {
    zoomLevel: ZoomLevel;
    showLine: boolean;
    showScatter: boolean;
    data: any[];
    series: Record<number, SeriesOptions>;
}
// Интерфейс для данных, передаваемых в Chart
export interface ChartData {
    date: Date;
    open: number;
    close: number;
    low: number;
    high: number;

}
// Определяем интерфейс для каждой стратегии
export interface StrategyOptions {
    name: string;
    id: string;
    settings: Record<string, any>; // Дополнительные настройки для стратегии
}

// Пример интерфейсов для разных стратегий
export interface MovingAverageStrategy extends StrategyOptions {
    maPeriod: number;
    maQuantity: number;
}

export interface DoubleMovingAverageStrategy extends StrategyOptions {
    maShortPeriod: number;
    maLongPeriod: number;
    maQuantity: number;
}

export interface LineProps {
    type: 'line' | 'area'; // Тип линии
    color: string;        // Цвет линии
    data: any[];     // Данные для линии
    name: string;         // Имя линии
}
export interface LineOptions {
    name:string;
    maPeriod?:number;
    rsiPeriod?: number;
    color?: string;        // Цвет линии

}

export interface StrategyResult {
    sell_sum: number;
    buy_sum: number;
    total_profit_without_broker: number;
    sell_sum_broker: number;
    buy_sum_broker: number;
    total_profit: number;
    total_trade_count: number;
    buy_trade_count: number;
    sell_trade_count:number;
    commission:number;
    profit_percent:number;
}
