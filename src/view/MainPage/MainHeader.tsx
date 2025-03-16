import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../css/main-page/main_page.css"


import site_url from "../../utils/const";
// @ts-ignore
import logo_main from "../../img/logo-main.svg"
import CommonButton from "../Common/CommonButton";
const MainHeader = () => {

    const navigate = useNavigate();

    return (
        <div className="main-header">
            <a href={site_url}><img className="main-logo" src={logo_main} alt={"logo"} draggable={false}/></a>
            <div className="enter-button">
                <CommonButton text={"Войти"} onClick={()=>{navigate("/login");}}></CommonButton>
            </div>
        </div>
    );
};

export default MainHeader;
