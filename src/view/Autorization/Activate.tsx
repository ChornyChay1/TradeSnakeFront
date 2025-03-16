import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../css/authorization/authorization.css";
import AuthChecker from "./AuthChecker";

const Activate: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [message, setMessage] = useState("Проверка активации...");
    const [success, setSuccess] = useState<boolean | null>(null);
    const requested = useRef(false); // Используем useRef вместо useState

    useEffect(() => {
        const activateAccount = async () => {
            try {
                const response = await fetch(`http://localhost:8000/users/activate/${token}`, {
                    credentials: "include",
                    method: "GET",
                });

                if (response.status === 200) {
                    setMessage("Ваш аккаунт успешно активирован!");
                    setSuccess(true);
                } else {
                    setMessage("Извините, токен не верный.");
                    setSuccess(false);
                }
            } catch (error) {
                console.error("Ошибка активации:", error);
                setMessage("Произошла ошибка. Попробуйте снова позже.");
                setSuccess(false);
            }
        };

        if (token && !requested.current) {
            requested.current = true; // Устанавливаем флаг, чтобы избежать повторных запросов
            activateAccount();
        }
    }, [token]); // Убрали `requested` из зависимостей, он не вызывает ререндер

    return (
        <div className="authorization">
            <AuthChecker/>
            <div className="form-container">
                <p>{message}</p>
                {success !== null && (
                    <button className="button-black" onClick={() => navigate(success ? "/profile" : "/login")}>
                        {success ? "Перейти в профиль" : "Войти"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Activate;
