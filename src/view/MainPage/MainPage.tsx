import React, { useEffect, useState } from "react";
import MainHeader from "./MainHeader";
import "../../css/main-page/main_page.css"
import CommonButton from "../Common/CommonButton";
import {useNavigate} from "react-router-dom";


const MainPage = () => {

const navigate = useNavigate();
    return (
        <div className="main-page">
            <MainHeader />
            <div className="main-page-container">
                <div className="main-page-text-column">
                    <h1>Автоматизируй сделки</h1>
                    <p>Этот сервис создан в рамках дипломной работы студента ДонНТУ для исследования алгоритмического
                        трейдинга. Вам доступен автоматизированный торговый бот, поддерживающий разные системы и валюты,
                        а также инструмент для тестирования стратегий с различными параметрами.</p>
                    <div className="main-page-button-go">
                        <CommonButton text={"Начать работу"} onClick={()=>{navigate("/register");}}/>
                    </div>
                </div>
            </div>
            <div className="main-page-footer">
                <p> Данный сайт разработан в рамках дипломной работы студента Донецкого Национального Технического университета группы КМД-21 </p>
                <p> Ковалёва Артёма</p>
            </div>

        </div>
    );
};

export default MainPage;
