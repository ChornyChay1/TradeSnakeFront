import React from "react";
import "../../css/common/common-button.css";
// @ts-ignore
import logo_img from "../../img/snake-logo.png";



function CommonHeader( ) {

    return (
        <div className="common-header">
            <div className="common-header-row">
                <div className="left-side-header">
                    <img className="logo-img" src={logo_img} alt="logo"  />
                    <div className="logo-text-col">
                        <h1>SNAKE-TRADE</h1>
                        <h2>Тестирование трейд-бота</h2>
                    </div>
                </div>

            </div>
            <div className="grey-row">

            </div>
        </div>
    );
}

export default CommonHeader;
