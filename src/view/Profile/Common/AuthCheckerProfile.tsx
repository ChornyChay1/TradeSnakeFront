import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {server_address} from "../../../config";
const AuthChecker: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch(server_address+"/users/auth", {
                    method: "POST",
                    credentials: "include", // Отправка куков
                });

                if (response.status === 200) {
                    }
                else{
                    navigate("/login");
                }

            } catch (error) {
                console.error("Ошибка при проверке авторизации:", error);
                navigate("/login");
            } finally {
            }
        };

        checkAuth();
    }, [navigate]);


    return null; // Этот компонент сам перенаправляет пользователя, UI не нужен
};

export default AuthChecker;
