import React, { useEffect, useRef } from "react";
import { createChart, IChartApi, LineData } from "lightweight-charts";
import {MoneyHistoryEntry} from "../../interfaces/user_interfaces";


type LineChartProps = {
    data: MoneyHistoryEntry[];
};

const ProgressChart: React.FC<LineChartProps> = ({ data }) => {
    const chartContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart: IChartApi = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 300,
            layout: {
                textColor: "#333",
                background: { color: "#fff" },
            },
            grid: {
                vertLines: { color: "#eee" },
                horzLines: { color: "#eee" },
            },
        });

        chart.timeScale().applyOptions({ timeVisible: true, borderColor: "#aaa" });

        const lineSeries = chart.addLineSeries({ color: "#007bff", lineWidth: 2 });
        lineSeries.setData(
            data.map((item) => ({ time: item.timestamp as any, value: item.money }))
        );

        return () => chart.remove();
    }, [data]);

    return <div ref={chartContainerRef} style={{ width: "100%", height: "300px" }} />;
};

export default ProgressChart;
