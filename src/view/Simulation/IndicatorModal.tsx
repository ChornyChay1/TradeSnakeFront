import React from "react";
import CommonButton from "../Common/CommonButton";

interface IndicatorModalProps {
    indicators: string[]; // Массив индикаторов
    addIndicator: (indicator: string) => void; // Функция для добавления индикатора
    closeModal: () => void; // Функция для закрытия модала
}

const IndicatorModal: React.FC<IndicatorModalProps> = ({ indicators, addIndicator, closeModal }) => {
    const generateUniqueNumber = () => {
        const timestamp = Date.now(); // Текущее время в миллисекундах
        const primeNumber = 10000019; // Простое число для хеширования
        return timestamp % primeNumber; // Оставшийся остаток от деления
    };

    return (
        <div className="modal" onClick={closeModal}>
            <div className="overlay"></div> {/* Оверлей для фона */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Выберите индикатор</h2>
                <button onClick={closeModal} className="profile-exit-modal-button">X</button>

                <div className="indicators">
                    {indicators.map((indicator) => (
                        <CommonButton
                            key={indicator}
                            color="white"
                            onClick={() => addIndicator(indicator + "#" + generateUniqueNumber().toString())}
                            text={indicator}
                        />
                    ))}
                </div>

                <div className="close-button-modal">
                    <CommonButton onClick={closeModal} text="Закрыть"/>
                </div>
            </div>
        </div>
    );
};

export default IndicatorModal;
