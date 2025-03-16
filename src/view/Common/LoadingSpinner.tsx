import React from "react";
import "../../css/common/common-app.css"; // Стили для спиннера

const LoadingSpinner: React.FC = () => {
    return (
        <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Загрузка...</p>
        </div>
    );
};

export default LoadingSpinner;