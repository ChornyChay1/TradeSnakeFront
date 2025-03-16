import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../../../css/profile/profile.css";
// @ts-ignore
import logo_img from "../../../img/profile-logo.svg";
import site_url from "../../../utils/const";
function CommonHeader() {
    const location = useLocation(); // Получаем текущий URL

    return (
        <div className="profile-header">
            <div className="profile-header-row">
                <a href={site_url}><img className="profile-logo-img" src={logo_img} alt="logo" draggable={false} /> </a>
                <nav className="navigation-row">
                    <NavLink to="/profile" className={location.pathname === "/profile" ? "active-link" : ""}>
                        профиль
                    </NavLink>
                    <NavLink to="/bots" className={location.pathname === "/bots" ? "active-link" : ""}>
                        мои боты
                    </NavLink>
                    <NavLink to="/simulation" className={location.pathname === "/simulation" ? "active-link" : ""}>
                        симуляция
                    </NavLink>
                </nav>
                <a className="exit-button" href="/">выйти</a>
            </div>
            <div className="grey-row"></div>
        </div>
    );
}

export default CommonHeader;
