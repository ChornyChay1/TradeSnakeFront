import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/authorization/authorization.css";
// @ts-ignore
import back_arrow from "../../img/back-arrow.png";
import CommonButton from "../Common/CommonButton";
import AuthChecker from "./AuthChecker";
import {server_address} from "../../config";
const Login: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<{ login: string; password: string }>({
        login: "",
        password: ""
    });
    const [message, setMessage] = useState<string|null>(null);
    const [error, setError] = useState<string|null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch(server_address+"/users/login", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            if (response.status === 200) {
                setMessage("Успешно")
                setError(null)
                navigate("/profile"); // Перенаправление на профиль
            } else if (response.status === 302) {
                setMessage("Для завершения регистрации мы отправили Вам письмо. Проверьте почту ")
                setError(null)
            }
            else if (response.status === 400) {
                setError("Неверное имя пользователя или пароль")
            }
            else {
                setError("Проблемы с сервером. Попробуйте ещё раз")
            }
        } catch (error) {
            setError("Проблемы с сервером. Попробуйте ещё раз")
        }
    };

    return (
        <div className="authorization">
            <AuthChecker/>
            <div className="form-container">
            {message == null &&(
                <>
                    <div className="back-container-authorization" onClick={() => navigate(-1)}>
                        <img className="back-arrow" src={back_arrow} alt="Назад"/>
                        <p>Назад</p>
                    </div>
                </>
            )}

                <h2>Вход</h2>
                {message == null && (
                    <form className="form" onSubmit={handleSubmit}>
                        <div className="input-container">
                        <label>Введите логин или email</label>
                        <input
                            type="text"
                            name="login"
                            placeholder="Email"
                            value={formData.login}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-container">
                        <label>Введите пароль</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Пароль"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button className="button-black" type="submit">Войти</button>
                        {error != null && (
                            <p className="error">{error}</p>
                        )}

                        </form>
                        )}
                {message != null && (
                    <>
                        <p>{message}</p>
                        <CommonButton text="На главную" onClick={()=>{navigate("/");}}/>
                    </>

                )}

                {message == null &&(
                    <div className="help-col">
                        <a href="/register">У меня нет аккаунта</a>
                        <a href="/reset-password">Я забыл пароль</a>
                    </div>
                )}


            </div>
        </div>
    );
};

export default Login;
