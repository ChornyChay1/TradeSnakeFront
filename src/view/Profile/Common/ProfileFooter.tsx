import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../../../css/profile/profile.css";
// @ts-ignore
function CommonFooter() {
    const location = useLocation(); // Получаем текущий URL

    return (
        <div className="profile-footer">
            <div className="footer-row">
                <p>ДонНТУ 2025</p>
                <p>Ковалёв Артём Алексеевич</p>
                <p>КМД-21</p>
            </div>
        </div>
    );
}

export default CommonFooter;
