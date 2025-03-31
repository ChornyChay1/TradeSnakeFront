import React, { useState } from "react";
import { LineOptions, LineProps } from "../../interfaces/chart_interfaces";
// @ts-ignore
import delete_button from "../../img/delete_img.svg";
// @ts-ignore
import settings_button from "../../img/settings.svg";

interface IndicatorConfigProps {
    lineOptions: LineOptions[];
    setLineOptions: (lines: LineOptions[]) => void;
    lines: LineProps[];
    setLines: (lines: LineProps[]) => void;
}

const IndicatorConfig: React.FC<IndicatorConfigProps> = ({
                                                             lineOptions,
                                                             setLineOptions,
                                                             lines,
                                                             setLines
                                                         }) => {
    const [openSettings, setOpenSettings] = useState<{ [key: string]: boolean }>({});

    const removeIndicator = (lineName: string) => {
        setLineOptions(lineOptions.filter((line) => line.name !== lineName));
        setLines(lines.filter((line) => line.name !== lineName));
    };

    const setLineColor = (lineName: string, color: string) => {
        setLineOptions(
            lineOptions.map((line) => (line.name === lineName ? { ...line, color } : line))
        );
        setLines(
            lines.map((line) => (line.name === lineName ? { ...line, color } : line))
        );
    };

    const setMaPeriod = (lineName: string, period: number) => {
        setLineOptions(
            lineOptions.map((line) => (line.name === lineName ? { ...line, maPeriod: period } : line))
        );
    };
    const setEMAPeriod = (lineName: string, period: number) => {
        setLineOptions(
            lineOptions.map((line) => (line.name === lineName ? { ...line, emaPeriod: period } : line))
        );
    };
    const setBollingerPeriod = (lineName: string, period: number) => {
        setLineOptions(
            lineOptions.map((line) => (line.name === lineName ? { ...line, bollngerPeriod: period } : line))
        );
    };
    const setBollingerDeviation = (lineName: string, deviation: number) => {
        setLineOptions(
            lineOptions.map((line) => (line.name === lineName ? { ...line, bollngerDeviation: deviation } : line))
        );
    };
    const setRsiPeriod = (lineName: string, period: number) => {
        setLineOptions(
            lineOptions.map((line) => (line.name === lineName ? { ...line, rsiPeriod: period } : line))
        );
    };
    const setAdxPeriod = (lineName: string, period: number) => {
        setLineOptions(
            lineOptions.map((line) => (line.name === lineName ? { ...line, adxPeriod: period } : line))
        );
    };

    const toggleSettings = (lineName: string) => {
        setOpenSettings((prev) => ({
            ...prev,
            [lineName]: !prev[lineName],
        }));
    };

    return (
        <div className="indicator-config">
            <h2>Индикаторы</h2>
            {lineOptions.map((line) => (
                <div className="option-config" key={line.name}>
                    <div className="indicator-item">
                        <span>{line.name}</span>
                        <div className="indicator-buttons">
                            <img
                                className={`settings-button ${openSettings[line.name] ? "rotated" : ""}`}
                                src={settings_button}
                                onClick={() => toggleSettings(line.name)}
                                alt="settings img"
                            />
                            <img
                                className="delete-button"
                                src={delete_button}
                                onClick={() => removeIndicator(line.name)}
                                alt="delete img"
                            />
                        </div>
                    </div>

                    {/* Блок с настройками */}
                    <div className={`settings-content ${openSettings[line.name] ? "open" : ""}`}>
                        {line.name.startsWith("MA") && (
                            <div className="settings-row">
                                <label>Период MA:</label>
                                <input
                                    type="number"
                                    value={line.maPeriod}
                                    onChange={(e) => setMaPeriod(line.name, Math.max(Number(e.target.value), 1))}
                                />
                            </div>
                        )}
                        {line.name.startsWith("EMA") && (
                            <div className="settings-row">
                                <label>Период EMA:</label>
                                <input
                                    type="number"
                                    value={line.emaPeriod}
                                    onChange={(e) => setEMAPeriod(line.name, Math.max(Number(e.target.value), 1))}
                                />
                            </div>
                        )}
                        {line.name.startsWith("BollingerBands") && (
                            <>

                            <div className="settings-row">
                                <label>Период Боллинджера:</label>
                                <input
                                    type="number"
                                    value={line.bollngerPeriod}
                                    onChange={(e) => setBollingerPeriod(line.name, Math.max(Number(e.target.value), 1))}
                                />
                            </div>
                            <div className="settings-row">
                            <label>Стандартное Отклонение:</label>
                            <input
                            type="number"
                            value={line.bollngerDeviation}
                         onChange={(e) => setBollingerDeviation(line.name, Math.max(Number(e.target.value), 1))}
                    />
                </div>
                            </>
            )}
            {line.name.startsWith("RSI") && (
                <div className="settings-row">
                    <label>Период RSI:</label>
                    <input
                        type="number"
                        value={line.rsiPeriod || 14}
                        onChange={(e) => setRsiPeriod(line.name, Math.max(Number(e.target.value), 1))}
                                />
                            </div>
                        )}
                        {line.name.startsWith("ADX") && (
                            <div className="settings-row">
                                <label>Период ADX:</label>
                                <input
                                    type="number"
                                    value={line.adxPeriod || 14}
                                    onChange={(e) => setAdxPeriod(line.name, Math.max(Number(e.target.value), 1))}
                                />
                            </div>
                        )}
                        {!line.name.startsWith("Volume")&&!line.name.startsWith("SRLevels") && (
                        <div className="settings-row">
                            <label>Цвет линии:</label>
                            <input
                                type="color"
                                value={line.color}
                                onChange={(e) => setLineColor(line.name, e.target.value)}
                            />
                        </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default IndicatorConfig;
