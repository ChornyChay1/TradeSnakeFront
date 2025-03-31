import React, { useState } from "react";

interface TooltipProps {
    text: string; // Текст подсказки
}

const Tooltip: React.FC<TooltipProps> = ({ text }) => {
    const [isVisible, setIsVisible] = useState(false); // Состояние видимости подсказки
    const [position, setPosition] = useState({ x: 0, y: 0 }); // Позиция подсказки

    // Обработчик наведения
    const handleMouseMove = (e: React.MouseEvent) => {
        setPosition({ x: e.clientX + 10, y: e.clientY + 10 }); // Позиция рядом с курсором
        setIsVisible(true);
    };

    // Обработчик ухода курсора
    const handleMouseLeave = () => {
        setIsVisible(false);
    };

    return (
        <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ display: "inline-block", marginLeft: "8px", cursor: "pointer" }}
        >
            {/* Иконка знака вопроса */}
            <span style={{
                display: "inline-block",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor: "#252525",
                textAlign: "center",
                lineHeight: "20px",
                fontSize: "14px",
                color: "#fff",
            }}>
                ?
            </span>

            {/* Подсказка */}
            {isVisible && (
                <div
                    style={{
                        position: "fixed",
                        left: position.x,
                        top: position.y,
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        color: "#fff",
                        padding: "5px",
                        borderRadius: "4px",
                        fontSize: "14px",
                        maxWidth:"300px",
                        zIndex: 1000,
                        pointerEvents: "none", // Чтобы подсказка не мешала взаимодействию
                    }}
                >
                    {text}
                </div>
            )}
        </div>
    );
};

export default Tooltip;