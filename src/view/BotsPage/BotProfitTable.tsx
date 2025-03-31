import { useState } from "react";
import { BotProfitResponse } from "../../interfaces/bots_interfaces";
// @ts-ignore
import arrow from "../../img/arrow.svg";
import { useNavigate } from "react-router-dom";
// @ts-ignore
import settings_image from "../../img/settings.svg";

interface Props {
    title: string;
    is_open?: boolean;
    bots: BotProfitResponse[];
}

export default function BotProfitTable({ title, bots, is_open = false }: Props) {
    const [isOpen, setIsOpen] = useState(is_open);
    const totalProfit = bots.reduce((sum, bot) => sum + bot.profit, 0);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

    // Добавляем обработчик изменения размера экрана
    window.addEventListener('resize', () => {
        setIsMobile(window.innerWidth < 900);
    });

    const maxProfit = bots.length > 0 ? Math.max(...bots.map((bot) => bot.profit)) : 1;
    const minProfit = bots.length > 0 ? Math.min(...bots.map((bot) => bot.profit)) : -1;
    const navigate = useNavigate();

    const calculateColor = (profit: number) => {
        let color;
        let alpha;

        if (profit > 0) {
            color = 'green';
            alpha = (profit / maxProfit) / 2;
        } else if (profit < 0) {
            color = 'red';
            alpha = (Math.abs(profit) / Math.abs(minProfit)) / 2;
        } else {
            color = 'white';
            alpha = 1;
        }

        return `rgba(${color === 'green' ? '1, 108, 62' : color === 'red' ? '189, 1, 3' : '255, 255, 255'}, ${alpha})`;
    };

    return (
        <div className="bot-profit-table">
            <div className="header" onClick={() => setIsOpen(!isOpen)}>
                <span>{title}</span>
                <img src={arrow} alt="arrow" className={`arrow ${isOpen ? "rotate" : ""}`} />
            </div>

            <div className={`content ${isOpen ? "open" : "closed"}`}>
                {bots.length === 0 ? (
                    <div className="empty-message">Тут пока ничего нет. Создайте бота!</div>
                ) : (
                    <>
                        <table>
                            <thead>
                            <tr>
                                <th>Название</th>
                                {!isMobile && <th>Пара</th>}
                                <th>Брокер</th>
                                {!isMobile && <th>Дата создания</th>}
                                <th>Прибыль</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {bots.map((bot, index) => (
                                <tr
                                    className="profit-col-tr"
                                    key={index}
                                    style={{ backgroundColor: calculateColor(bot.profit) }}
                                >
                                    <td>{bot.bot_name}</td>
                                    {!isMobile && <td>{bot.symbol}</td>}
                                    <td>{isMobile ? bot.broker_name.substring(0, 3) : bot.broker_name}</td>
                                    {!isMobile && <td>{bot.create_time}</td>}
                                    <td className="font-bold">{bot.profit.toFixed(2)}$</td>
                                    <td>
                                        <img
                                            className="cursor-pointer"
                                            src={settings_image}
                                            alt="settings-button"
                                            onClick={() => navigate(`/bot-settings/${bot.bot_id}`)}
                                        />
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <div className="footer">Всего: {totalProfit.toFixed(2)}$</div>
                    </>
                )}
            </div>
        </div>
    );
}