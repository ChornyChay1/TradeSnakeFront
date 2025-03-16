import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/authorization/authorization.css";
// @ts-ignore
import back_arrow from "../../img/back-arrow.png";
import AuthChecker from "./AuthChecker";
import {wait} from "@testing-library/user-event/dist/utils";

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<{ name: string; email: string; password: string; passwordCheck: string }>({
        name: "",
        email: "",
        password: "",
        passwordCheck: ""
    });
    const [error,setError] = useState<string|null>(null)
    const [info,setInfo] = useState<string|null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (formData.password !== formData.passwordCheck) {
            setError("Пароли не совпадают")
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/users/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            });

            if (!response.ok) {
                throw new Error(`Ошибка: ${response.statusText}`);
            }

            const result = await response.json();
            console.log("Успешная регистрация:", result);
            setInfo("Успешно");
            setError(null)
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            setError("Ошибка регистрации. Попробуйте снова.");
        }
    };

    return (
        <div className="authorization">
            <AuthChecker/>
            <div className="form-container">
                <div className="back-container-authorization" onClick={() => navigate(-1)}>
                    <img className="back-arrow" src={back_arrow} alt="Назад"/>
                    <p>Назад</p>
                </div>
                <h2>Регистрация</h2>
                <form className="form" onSubmit={handleSubmit}>
                    <div className="input-container">
                        <label>Введите логин</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Имя"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-container">
                        <label>Введите email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
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
                    <div className="input-container">
                        <label>Повторите пароль</label>
                        <input
                            type="password"
                            name="passwordCheck"
                            placeholder="Пароль"
                            value={formData.passwordCheck}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button className="button-black" type="submit">Зарегистрироваться</button>
                    {error != null && (
                        <p className="error">{error}</p>
                    )}
                    {info != null && (
                        <p className="info">{info}</p>
                    )}
                </form>
                <div className="help-col">
                    <a href="/login">У меня уже есть аккаунт</a>
                </div>
            </div>
        </div>
    );
};

export default Register;
