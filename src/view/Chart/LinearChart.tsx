import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, LineData } from 'lightweight-charts';
import "../../css/chart/common-chart.css";

interface LineChartProps {
    data: { timestamp: number; money: number }[];
    lines?: { color: string; data: { timestamp: number; value: number }[] }[]; // Вспомогательные линии
    symbolName: string; // Название символа
}

const LineChart: React.FC<LineChartProps> = ({ data, lines = [], symbolName }) => {
    const chartContainerRef = useRef<HTMLDivElement | null>(null);
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

        chart.timeScale().applyOptions({
            borderColor: '#2bea00',
            rightOffset: 10,
            timeVisible: true,
            barSpacing: 10,
            visible: true,
        });

        // Основная линия (зеленая)
        const lineSeries = chart.addLineSeries({
            color: '#008000', // Зеленая линия
            lineWidth: 2,
            crosshairMarkerVisible: true,
        });
        const areaSeries = chart.addAreaSeries( { lineColor: '#00CA73', topColor: '#0b980d', bottomColor: 'rgba(0,225,105,0.28)' });
        // @ts-ignore
        areaSeries.setData(data.map(({ timestamp, money }) => ({ time: timestamp, value: money })));




        const tooltip = tooltipRef.current!;
        tooltip.style.display = 'none'; // Скрыть подсказку по умолчанию

        // Легенда
        const legend = document.createElement('div');
        legend.style.position = 'absolute';
        legend.style.left = '12px';
        legend.style.top = '12px';
        legend.style.zIndex = '1';
        legend.style.fontSize = '14px';
        legend.style.fontFamily = 'sans-serif';
        legend.style.lineHeight = '18px';
        legend.style.fontWeight = '300';
        chartContainerRef.current.appendChild(legend);

        const firstRow = document.createElement('div');
        firstRow.innerHTML = symbolName;
        firstRow.style.color = 'black';
        legend.appendChild(firstRow);

        chart.subscribeCrosshairMove((param) => {
            if (!param.time || !param.point || !chartContainerRef.current) {
                tooltip.style.display = 'none';
                return;
            }

            const dataPoint = param.seriesData.get(lineSeries) as LineData;
            if (!dataPoint) return;

            firstRow.innerHTML = `${symbolName} <strong>${dataPoint.value.toFixed(4)}</strong>`;

            tooltip.style.display = 'block';
            tooltip.style.left = `${param.point.x + 10}px`;
            tooltip.style.top = `${param.point.y + 10}px`;
            tooltip.innerHTML = `
                <div>Время: ${param.time}</div>
                <div>Значение: ${dataPoint.value.toFixed(4)}</div>
            `;
        });
        chart.timeScale().fitContent();



        return () => {
            chart.remove();
        };
    }, [data, lines, symbolName]);

    return (
        <div style={{ position: 'relative' }}>
            <div className="chart-container-light" ref={chartContainerRef} />
            <div
                ref={tooltipRef}
                className="chart-tooltip"
                style={{
                    position: 'absolute',
                    letterSpacing: '0.1em',
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
        </div>
    );
};

export default LineChart;
