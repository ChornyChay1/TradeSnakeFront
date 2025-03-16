import React from "react";
import "../../css/common/common-button.css";

type ButtonProps = {
    text: string;
    onClick?: () => void; // Опциональный onClick
    color?: string; // Пропс для неактивной кнопки
};

const CommonButton: React.FC<ButtonProps> = ({ text, onClick, color="black" }) => {

    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    const buttonClass = 'button-' + color;
    return (
        <button
            className={buttonClass}
            onClick={handleClick}
        >
            {text}
        </button>
    );
};

export default CommonButton;
