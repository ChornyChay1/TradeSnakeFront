import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../../../css/profile/profile.css";
// @ts-ignore
function CommonFooter() {
    const location = useLocation(); // Получаем текущий URL

    return (
        <div className="profile-footer">
            <div className="footer-row">

                    <p>© 2025 Ковалёв Артём Алексеевич</p>
                    <p>Все права защищены.</p>


                    <p>Контакт: <a href="mailto:edcroo10@gmail.com">edcroo10@gmail.com</a></p>

            </div>
        </div>
    );
}

export default CommonFooter;
