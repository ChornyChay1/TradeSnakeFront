import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import "../../css/authorization/authorization.css";
// @ts-ignore
import back_arrow from "../../img/back-arrow.png";
import CommonButton from "../Common/CommonButton";
import AuthChecker from "./AuthChecker";

const ChangePassword: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<{ password: string; confirm_password:string}>({
        password: "",
        confirm_password:""
    });
    const { token } = useParams<{ token: string }>();

    const [isSuccess,setIsSuccess] = useState<boolean>(false)
    const [error,setError] = useState<string|null>(null)


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formData.password!=formData.confirm_password){
            setError("Пароли не совпадают")
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/users/change_password/"+token, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    password: formData.password,
                })
            });
            if (response.status === 200) {
                setIsSuccess(true);
                setError(null)
            }
            else{
                if(response.status === 400 || response.status === 403) {
                    setError("Ошибка. Вышлите письмо ещё раз")
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
                <h2>Смена пароля</h2>
                {!isSuccess && (

                <form className="form" onSubmit={handleSubmit}>
                    <div className="input-container">
                        <label>Введите новый пароль</label>
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
                        <label>Подтвердите новый пароль</label>
                        <input
                            type="password"
                            name="confirm_password"
                            placeholder="Подтвердите пароль"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button className="button-black" type="submit">Сменить пароль</button>
                {error != null && (
                    <p className="error">{error}</p>
            )}
        </form>
)}
{
    isSuccess && (
        <>
                    <p>Пароль успешно обновлен
                        </p>
                        <CommonButton text="Войти" onClick={()=>{navigate("/login");}}/>
                    </>

                )}


            </div>
        </div>
    );
};

export default ChangePassword;
