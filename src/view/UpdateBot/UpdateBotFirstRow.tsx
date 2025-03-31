import React, { useState } from "react";
//@ts-ignore
import edit_button from "../../img/edit_button.svg";
//@ts-ignore
import power_button from "../../img/power-button.svg";
//@ts-ignore
import ok_button from "../../img/ok_button.svg";
import CommonButton from "../Common/CommonButton";
interface UpdateBotFirstRowProps {
    botName: string;
    botMode: boolean;
    handleSwitchPowerBot: () => Promise<void>;
    handleDeleteBot: () => Promise<void>;
    setBotName: (newName: string) => Promise<void>;
}

const UpdateBotFirstRow: React.FC<UpdateBotFirstRowProps> = ({
                                                                 botName,
                                                                 botMode,
                                                                 handleSwitchPowerBot,
                                                                 handleDeleteBot,
                                                                 setBotName,
                                                             }) => {
    const [isEditing, setIsEditing] = useState(false); // Состояние редактирования имени
    const [newBotName, setNewBotName] = useState(botName); // Новое имя бота
    const [isModalOpen, setModalOpen] = useState(false); // Состояние модального окна

    // Обработчик нажатия на кнопку редактирования
    const handleEditClick = () => {
        setIsEditing(true);
        setNewBotName(botName); // Устанавливаем текущее имя бота в input
    };

    // Обработчик изменения имени в input
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewBotName(e.target.value);
    };

    // Обработчик сохранения нового имени
    const handleSaveName = async () => {
        if (newBotName.trim() !== "") {
            await setBotName(newBotName); // Сохраняем новое имя
            setIsEditing(false); // Выходим из режима редактирования
        }
    };

    // Обработчик отмены редактирования
    const handleCancelEdit = () => {
        setIsEditing(false); // Выходим из режима редактирования
        setNewBotName(botName); // Сбрасываем значение input
    };

    // Обработчик удаления бота с подтверждением
    const handleDeleteClick = () => {
        setModalOpen(true); // Открываем модальное окно
    };

    return (
        <div className="update-bot-first-row">
            <>
                <div className="bot-name-group">
                    {isEditing ? (
                        <>
                            <input
                                className="bot-name-input"
                                type="text"
                                value={newBotName}
                                onChange={handleNameChange}
                                autoFocus
                            />
                            <div className="edit-buttons">
                                <button
                                    className="save-button"
                                    onClick={handleSaveName}
                                    disabled={newBotName.trim() === ""} // Кнопка "Сохранить" неактивна, если поле пустое
                                >
                                    Ок
                                </button>
                                <button className="cancel-button" onClick={handleCancelEdit}>
                                    Отмена
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h1>{botName}</h1>
                            <img
                                src={edit_button}
                                alt="edit_button"
                                className="edit-button"
                                onClick={handleEditClick}
                                style={{ cursor: "pointer" }}
                            />
                        </>
                    )}
                </div>
                <div className="managment-button-group">
                    <div
                        className="switch-button-container"
                        onClick={handleSwitchPowerBot}
                        style={{cursor: "pointer", color: botMode ? "green" : "red"}}
                    >
                        {botMode ? "ON" : "OFF"}
                        <img src={power_button} className="power-button" alt="power-button"/>
                    </div>
                    <p
                        onClick={handleDeleteClick}
                        className="delete-bot-button"
                        style={{cursor: "pointer"}}
                    >
                        Удалить
                    </p>
                </div>
            </>

            {/* Модальное окно для подтверждения удаления */}
            {isModalOpen && (
                <div className="profile-modal">
                    <div className="profile-modal-overlay" onClick={() => setModalOpen(false)}></div>

                    <div className="profile-modal-content">
                        <p>Вы уверены, что хотите удалить бота?</p>
                        <CommonButton onClick={handleDeleteBot} text={"Да"}/>
                        <CommonButton onClick={() => setModalOpen(false)} text={"Отмена"}/>

                    </div>
                </div>
            )}
        </div>
    );
};

export default UpdateBotFirstRow;