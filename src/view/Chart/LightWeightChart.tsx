import React, {useEffect, useRef, useState} from 'react';
import {createChart, IChartApi, LineData, Time} from 'lightweight-charts';
import "../../css/chart/common-chart.css";
import { calculateMovingAverageSeriesData } from "../../utils/movingAverage";
import {LineProps} from "../../interfaces/chart_interfaces";
interface CandlestickData {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    sell: boolean;
    buy: boolean;
}

interface CandlestickChartProps {
    data: CandlestickData[];
    symbol_name: string;
    lines?: any[];
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data,symbol_name, lines = []   }) => {
    const chartContainerRef = useRef<HTMLDivElement | null>(null);
    const rsiChartContainerRef = useRef<HTMLDivElement | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart: IChartApi = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            layout: {
                textColor: '#333333',
                background: { color: 'white' },
            },
            grid: {
                vertLines: { color: '#eee' },
                horzLines: { color: '#eee' },
            },
        });
        chart.timeScale().applyOptions(
            {
                borderColor: '#2bea00',
                rightOffset:10,
                timeVisible:true
            }
        )
        // Добавляем линии на основной график
        lines
            .filter((line) => line.name !== 'RSI')
            .forEach((line) => {
                const series = chart.addLineSeries({ color: line.color, lineWidth: 1 });
                series.setData(line.data);
            });
        let rsiChart: IChartApi | null = null;

        // Если есть RSI, создаем отдельный чарт
        if (lines.some((line) => line.name === 'RSI') && rsiChartContainerRef.current  ) {
            rsiChart = createChart(rsiChartContainerRef.current, {
                width: rsiChartContainerRef.current.clientWidth,
                height: 150, // Высота графика RSI
                layout: { textColor: '#333333', background: { color: 'white' } },
                grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
            });

            // Добавляем RSI линию на отдельный график
            const rsiLine = lines.find((line) => line.name === 'RSI');
            if (rsiLine) {
                const rsiSeries = rsiChart.addLineSeries({ color: rsiLine.color, lineWidth: 1 });
                rsiSeries.setData(rsiLine.data);
            }
            // Добавляем зоны между 30 и 70


            // Добавляем горизонтальные линии для значений 30 и 70
            rsiChart.addLineSeries({
                color: 'blue',
                lineWidth: 1,
                crosshairMarkerVisible: false
            }).setData([
                { time: rsiLine.data[0].time, value: 30 },
                { time: rsiLine.data[rsiLine.data.length - 1].time, value: 30 }
            ]);

            rsiChart.addLineSeries({
                color: 'blue',
                lineWidth: 1,
                crosshairMarkerVisible: false
            }).setData([
                { time: rsiLine.data[0].time, value: 70 },
                { time: rsiLine.data[rsiLine.data.length - 1].time, value: 70 }
            ]);
            const syncTimeRange = (newRange: any) => {
                // @ts-ignore
                rsiChart.timeScale().setVisibleRange(newRange);
            };

            // Подписка на изменение видимого диапазона времени
            rsiChart.timeScale().subscribeVisibleTimeRangeChange(syncTimeRange);
            chart.timeScale().subscribeVisibleTimeRangeChange(syncTimeRange);
        }


        const transformedData = data
            .map((item) => ({
                time: item.time,
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close,
                sell: item.sell,
                buy: item.buy,
                color: item.open > item.close ? 'red' : "green",
                wickColor: item.open > item.close ? 'red' : "green",
            }));


        const markers: any = transformedData
            .filter(item => item.buy || item.sell)
            .map(item => ({
                time:  item.time,
                position: item.buy ?  'belowBar' : "aboveBar" ,
                color: item.buy ? '#e91e63' : '#00e11f',
                shape: item.buy ? 'arrowDown' : 'arrowUp',
                text: ``,
            }));

        const candlestickSeries = chart.addCandlestickSeries();
        candlestickSeries.setData(transformedData as unknown as LineData[]);
        candlestickSeries.setMarkers(markers);

        const tooltip = tooltipRef.current!;
        tooltip.style.display = 'none';  // Скрыть подсказку по умолчанию

        // Создание элемента легенды
        const legend = document.createElement('div');
        // @ts-ignore
        legend.style = `position: absolute; left: 12px; top: 12px; z-index: 1; font-size: 14px; font-family: sans-serif; line-height: 18px; font-weight: 300;`;
        chartContainerRef.current.appendChild(legend);

        // Название символа
        const symbolName = symbol_name;
        const firstRow = document.createElement('div');
        firstRow.innerHTML = symbolName;
        firstRow.style.color = 'black';
        legend.appendChild(firstRow);

        const findMarkerByTime = (time: any) => {
            return markers.find((marker: { time: number; }) => JSON.stringify(marker.time) === JSON.stringify(time));
        };

        chart.subscribeCrosshairMove((param) => {

            let priceFormatted = '';
            if (param.time) {
                const data = param.seriesData.get(candlestickSeries);
                // @ts-ignore
                const price = data.close !== undefined ? data.close : 0;
                const marker = findMarkerByTime(param.time);

                priceFormatted = price.toFixed(4);

                // Проверка на наличие маркера перед его использованием
                firstRow.innerHTML = `${symbolName} <strong>${priceFormatted}</strong>`;

                if (marker) {
                    firstRow.innerHTML += ` 
            ${
                        marker.shape === 'arrowUp'
                            ? `<strong>Точка продажи</strong>`
                            : marker.shape === 'arrowDown'
                                ? `<strong>Точка покупки</strong>`
                                : ''
                    }
        `;
                }
            }
            if (
                !param.point ||
                !param.time ||
                param.point.x < 0 ||
                param.point.x > chartContainerRef.current!.clientWidth ||
                param.point.y < 0 ||
                param.point.y > chartContainerRef.current!.clientHeight
            ) {
                tooltip.style.display = 'none';
                return;
            }

            const seriesData = param.seriesData.get(candlestickSeries);
            if (!seriesData) return;
            // @ts-ignore
            const price = 'close' in seriesData ? seriesData.close : 0;
            const marker = findMarkerByTime(param.time);

            if (marker) {
                tooltip.style.display = 'flex';
                tooltip.style.flexDirection = "column";
                tooltip.style.gap = "10px";
                tooltip.style.left = `${param.point.x + 0}px`;
                tooltip.style.top = `${param.point.y + 0}px`;

                tooltip.innerHTML = `
                    ${
                    marker.shape === 'arrowUp'
                        ? `<div>Точка продажи</div>
                               <div>Цена: ${price}</div>`
                        : marker.shape === 'arrowDown'
                            ? `<div>Точка покупки</div>
                                   <div>Цена: ${price}</div>`
                            : ''
                }
                `;
            } else {
                tooltip.style.display = 'none';
            }
        });

        return () => {
            chart.remove();
            if (rsiChart){
                rsiChart.remove();
            }
        };
    }, [data,lines]);

    return (
        <div>
            <div className="chart-container-light" ref={chartContainerRef} />
            <div
                ref={tooltipRef}
                className="chart-tooltip"
                style={{
                    position: 'absolute',
                    letterSpacing: "0.1em",
                    padding: '8px',
                    backgroundColor: 'white',
                    border: '1px solid rgba(38, 166, 154, 1)',
                    borderRadius: '4px',
                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
                    fontSize: '12px',
                    pointerEvents: 'none',
                    zIndex: 1000,
                }}
            />
            {lines.some((line) => line.name === 'RSI') && (
                <div className="chart-container-light rsi-chart" ref={rsiChartContainerRef} />
            )}
        </div>
    );
};

export default CandlestickChart;
