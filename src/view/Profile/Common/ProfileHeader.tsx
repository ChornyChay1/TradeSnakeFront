import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "../../../css/profile/profile.css";
// @ts-ignore
import logo_img from "../../../img/profile-logo.svg";
import site_url from "../../../utils/const";
import Cookies from "js-cookie";

function CommonHeader() {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear both tokens from cookies
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");

        // Optionally: Redirect to home page after logout
        navigate("/");
    };

    return (
        <div className="profile-header">
            <div className="profile-header-row">
                <a href={site_url}>
                    <img className="profile-logo-img" src={logo_img} alt="logo" draggable={false} />
                </a>
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
                <a className="exit-button" onClick={handleLogout}>
                    выйти
                </a>
            </div>
            <div className="grey-row"></div>
        </div>
    );
}

export default CommonHeader;