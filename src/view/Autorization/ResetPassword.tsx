import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/authorization/authorization.css";
// @ts-ignore
import back_arrow from "../../img/back-arrow.png";
import CommonButton from "../Common/CommonButton";
import AuthChecker from "./AuthChecker";
import {server_address} from "../../config";
const Register: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<{ email: string;}>({
        email: ""
    });
    const [isSuccess,setIsSuccess] = useState<boolean>(false)
    const [error,setError] = useState<string|null>(null)


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await fetch(server_address+"/users/change_password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: formData.email,
                })
            });
            if (response.status === 302) {
                setIsSuccess(true);
                setError(null)
            }
            else{
                if(response.status === 400) {
                    setError("Пользователь с этой почтой не зарегистрирован в системе")
                }
                else{
                    setError("Проблема с сервисом, попробуйте ещё раз")
                }
            }

        } catch (error) {
            setError("Проблема с сервисом, попробуйте ещё раз")
        }
    };

    return (
        <div className="authorization">
            <AuthChecker/>
            <div className="form-container">
                {!isSuccess && (
                <div className="back-container-authorization" onClick={() => navigate(-1)}>
                    <img className="back-arrow" src={back_arrow} alt="Назад"/>
                    <p>Назад</p>
                </div>
                    )}
                <h2>Смена пароля</h2>
                {!isSuccess && (

                <form className="form" onSubmit={handleSubmit}>
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
                    <button className="button-black" type="submit">Отправить письмо</button>
                    {error != null && (
                        <p className="error">{error}</p>
                    )}
                </form>
                    )}
                {isSuccess && (
                    <>
                        <p>Письмо успешно отправлено <br/>
                            Проверьте почту!
                        </p>
                        <CommonButton text="На главную" onClick={()=>{navigate("/");}}/>
                    </>

                )}


            </div>
        </div>
    );
};

export default Register;
