import React, {useEffect, useRef, useState} from 'react';
import {createChart, IChartApi, LineData, Time} from 'lightweight-charts';
import "../../css/chart/common-chart.css";
import { calculateMovingAverageSeriesData } from "../../utils/movingAverage";
import {LineProps} from "../../interfaces/chart_interfaces";
import {LevelData} from "../../utils/SRLevels";
import {BollingerBandPoint} from "../../utils/BollingerBands";

interface CandlestickData {
    time: any;
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
    const adxChartContainerRef = useRef<HTMLDivElement | null>(null);

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

        lines
            .filter(line => line.name === 'SRLevels')
            .forEach(line => {
                const levels = line.data as LevelData[];

                levels.forEach((level) => {
                    const series = chart.addLineSeries({
                        color: level.type === 'support' ? '#0021ff' : '#ea0000',
                        lineWidth: 2,
                        lastValueVisible: false,
                        priceLineVisible: false,
                        crosshairMarkerVisible: false,
                        title: level.type === 'support' ? 'Поддержка' : 'Сопротивление'
                    });

                    const endTime = level.endTime || level.time + 3600;
                    series.setData([
                        { time: level.time, value: level.value },
                        { time: endTime, value: level.value }
                    ]);
                });
            });

        lines
            .filter(line => line.name !== 'RSI' && line.name !== 'Volume'&& line.name !== 'SRLevels' && line.name !== 'ADX')
            .forEach(line => {
                const series = chart.addLineSeries({ color: line.color, lineWidth: 1 });
                series.setData(line.data);
            });

        lines
            .filter(line => line.name === 'BollingerBands')
            .forEach(line => {
                try {
                    const bbData = line.data as BollingerBandPoint[];
                    console.log("bbData", bbData);

                    const middleData = bbData
                        .filter(item => item && typeof item.time !== 'undefined' && typeof item.middle === 'number')
                        .map(item => ({ time: item.time, value: item.middle }));

                    const upperData = bbData
                        .filter(item => item && typeof item.time !== 'undefined' && typeof item.upper === 'number')
                        .map(item => ({ time: item.time, value: item.upper }));

                    const lowerData = bbData
                        .filter(item => item && typeof item.time !== 'undefined' && typeof item.lower === 'number')
                        .map(item => ({ time: item.time, value: item.lower }));

                    if (middleData.length > 0) {
                        const middleSeries = chart.addLineSeries({
                            color: line.color,
                            lineWidth: 2,
                            title: 'Middle Band'
                        });
                        middleSeries.setData(middleData);
                    }

                    if (upperData.length > 0) {
                        const upperSeries = chart.addLineSeries({
                            color: '#FF6D00',
                            lineWidth: 1,
                            lineStyle: 2,
                            title: 'Upper Band'
                        });
                        upperSeries.setData(upperData);
                    }

                    if (lowerData.length > 0) {
                        const lowerSeries = chart.addLineSeries({
                            color: '#FF6D00',
                            lineWidth: 1,
                            lineStyle: 2,
                            title: 'Lower Band'
                        });
                        lowerSeries.setData(lowerData);
                    }

                    if (upperData.length > 0 && middleData.length > 0) {
                        chart.addAreaSeries({
                            topColor: 'rgba(41, 98, 255, 0.2)',
                            bottomColor: 'rgba(41, 98, 255, 0)',
                            lineColor: 'rgba(41, 98, 255, 0)',
                            lineWidth: 1
                        }).setData(upperData);
                    }

                    if (lowerData.length > 0 && middleData.length > 0) {
                        chart.addAreaSeries({
                            topColor: 'rgba(255,255,255,0)',
                            bottomColor: 'rgb(255,255,255)',
                            lineColor: 'rgba(41, 98, 255, 0)',
                            lineWidth: 1
                        }).setData(lowerData);
                    }
                } catch (error) {
                    console.error('Error rendering Bollinger Bands:', error);
                }
            });

        let rsiChart: IChartApi | null = null;
        let adxChart: IChartApi | null = null;

        const volumeLine = lines?.find(line => line?.name === 'Volume');
        if (volumeLine) {
            const volumeSeries = chart.addHistogramSeries({
                priceFormat: {
                    type: 'volume',
                },
                priceScaleId: 'volumeScale'
            });

            chart.priceScale('volumeScale').applyOptions({
                scaleMargins: {
                    top: 0.80,
                    bottom:0
                }
            });

            const volumeData = (volumeLine.data || [])
                .filter((item: { time: undefined; value: undefined; volume: undefined; }) => item && item.time !== undefined && (item.value !== undefined || item.volume !== undefined))
                .map((item: { time: any; value: any; volume: any; color: any; }) => ({
                    time: item.time,
                    value: item.value ?? item.volume,
                    color: item.color || '#26a69a'
                }));

            if (volumeData.length > 0) {
                volumeSeries.setData(volumeData);
            }

            volumeSeries.applyOptions({
                lastValueVisible: false,
                priceLineVisible: false
            });
        }

        // If RSI exists, create separate chart
        if (lines.some((line) => line.name === 'RSI') && rsiChartContainerRef.current) {
            rsiChart = createChart(rsiChartContainerRef.current, {
                width: rsiChartContainerRef.current.clientWidth,
                height: 150,
                layout: { textColor: '#333333', background: { color: 'white' } },
                grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
            });

            const rsiLine = lines.find((line) => line.name === 'RSI');
            if (rsiLine) {
                const rsiSeries = rsiChart.addLineSeries({ color: rsiLine.color, lineWidth: 1 });
                const uniqueRsiData = rsiLine.data.reduce((acc: any[], current: { time: any; }) => {
                    const existing = acc.find(item => item.time === current.time);
                    if (!existing) {
                        acc.push(current);
                    }
                    return acc;
                }, []);

                // 2. Сортировка по времени
                const sortedRsiData = [...uniqueRsiData].sort((a, b) => a.time - b.time);
                rsiSeries.setData(sortedRsiData);
            }

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

            rsiChart.timeScale().subscribeVisibleTimeRangeChange(syncTimeRange);
            chart.timeScale().subscribeVisibleTimeRangeChange(syncTimeRange);
        }

        // If ADX exists, create separate chart
        if (lines.some((line) => line.name === 'ADX') && adxChartContainerRef.current) {
            adxChart = createChart(adxChartContainerRef.current, {
                width: adxChartContainerRef.current.clientWidth,
                height: 150,
                layout: { textColor: '#333333', background: { color: 'white' } },
                grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
            });

            const adxLine = lines.find((line) => line.name === 'ADX');
            if (adxLine) {
                const adxSeries = adxChart.addLineSeries({
                    color: adxLine.color || '#2962FF',
                    lineWidth: 1
                });
                // 1. Удаление дубликатов по времени
                const uniqueAdxData = adxLine.data.reduce((acc: any[], current: { time: any; }) => {
                    const existing = acc.find(item => item.time === current.time);
                    if (!existing) {
                        acc.push(current);
                    }
                    return acc;
                }, []);

                // 2. Сортировка по времени
                const sortedAdxData = [...uniqueAdxData].sort((a, b) => a.time - b.time);
                adxSeries.setData(sortedAdxData);
                // Add reference lines at 20, 25, and 50 levels
                adxChart.addLineSeries({
                    color: 'gray',
                    lineWidth: 1,
                    lineStyle: 2, // Dashed line
                    crosshairMarkerVisible: false
                }).setData([
                    { time: adxLine.data[0].time, value: 20 },
                    { time: adxLine.data[adxLine.data.length - 1].time, value: 20 }
                ]);

                adxChart.addLineSeries({
                    color: 'gray',
                    lineWidth: 1,
                    lineStyle: 2,
                    crosshairMarkerVisible: false
                }).setData([
                    { time: adxLine.data[0].time, value: 25 },
                    { time: adxLine.data[adxLine.data.length - 1].time, value: 25 }
                ]);

                adxChart.addLineSeries({
                    color: 'gray',
                    lineWidth: 1,
                    lineStyle: 2,
                    crosshairMarkerVisible: false
                }).setData([
                    { time: adxLine.data[0].time, value: 50 },
                    { time: adxLine.data[adxLine.data.length - 1].time, value: 50 }
                ]);
            }

            const syncTimeRange = (newRange: any) => {
                // @ts-ignore
                adxChart.timeScale().setVisibleRange(newRange);
            };

            adxChart.timeScale().subscribeVisibleTimeRangeChange(syncTimeRange);
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
        tooltip.style.display = 'none';

        const legend = document.createElement('div');
        // @ts-ignore
        legend.style = `position: absolute; left: 12px; top: 12px; z-index: 1; font-size: 14px; font-family: sans-serif; line-height: 18px; font-weight: 300;`;
        chartContainerRef.current.appendChild(legend);

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
            if (rsiChart) rsiChart.remove();
            if (adxChart) adxChart.remove();
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
            {lines.some((line) => line.name === 'ADX') && (
                <div className="chart-container-light rsi-chart" ref={adxChartContainerRef} />
            )}
        </div>
    );
};

export default CandlestickChart;