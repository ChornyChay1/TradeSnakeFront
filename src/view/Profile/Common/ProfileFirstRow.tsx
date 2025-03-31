import React, { useState, useEffect } from "react";
import ProgressImage from "../ProgressImage";
import CommonButton from "../../Common/CommonButton";
// @ts-ignore
import { FaPlusCircle } from "react-icons/fa";
// @ts-ignore
import rechargeIcon from "../../../img/wallet.png";

interface UserProfileInfoProps {
    userStatistics: {
        id: number;
        username: string;
        money: number;
    };
    percentage: number;
    animateName: boolean;
    animateBalance: boolean;
    handleRecharge: (amount: number) => Promise<void>;
    text: string;
}

const UserProfileInfo: React.FC<UserProfileInfoProps> = ({
                                                             userStatistics,
                                                             percentage,
                                                             animateName,
                                                             animateBalance,
                                                             handleRecharge,
                                                             text
                                                         }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [rechargeAmount, setRechargeAmount] = useState(10);
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 900);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        setPosition({ x: e.clientX + 10, y: e.clientY + 10 });
        setIsVisible(true);
    };

    const handleMouseLeave = () => {
        setIsVisible(false);
    };

    return (
        <div className="profile-info-row-container">
            {userStatistics.id !== 0 ? (
                <>
                    <div className="profile-info-name">
                        <div className="name-and-progress">
                            <p className={`name ${animateName ? 'balance-animation' : ''}`}>
                                {userStatistics.username}
                            </p>
                            <ProgressImage percentage={percentage} />
                        </div>
                        <p className="what"
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            style={{ cursor: "pointer" }}
                        >
                            {isMobile ? " ? " : "Что делать?"}
                        </p>
                        {isVisible && (
                            <div
                                style={{
                                    left: position.x,
                                    top: position.y,
                                }}
                                className="tooltip-profile"
                            >
                                {text}
                            </div>
                        )}
                    </div>
                    <div className="profile-info-balance">
                        <p className={`balance ${animateBalance ? 'balance-animation' : ''}`}>
                            {userStatistics.money.toFixed(2)} USD
                        </p>
                        <div className="recharge-button">
                            <img
                                src={rechargeIcon}
                                alt="Пополнить"
                                onClick={() => setModalOpen(true)}
                                style={{
                                    width: "27px",
                                    height: "27px",
                                    cursor: "pointer"
                                }}
                            />
                        </div>
                    </div>
                    {isModalOpen && (
                        <div className="profile-modal">
                            <div className="profile-modal-overlay" onClick={() => setModalOpen(false)}></div>
                            <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="profile-modal-row">
                                    <h2>Пополнение баланса</h2>
                                    <button onClick={() => setModalOpen(false)} className="profile-exit-modal-button">X</button>
                                </div>
                                <div className="profile-modal-input-group">
                                    <input
                                        type="number"
                                        value={rechargeAmount}
                                        onChange={(e) => setRechargeAmount(Number(e.target.value))}
                                        min="1"
                                    />
                                    <label>USD</label>
                                </div>
                                <CommonButton text="Пополнить" onClick={async () => {
                                    await handleRecharge(rechargeAmount);
                                    setModalOpen(false);
                                }} />
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <p></p>
            )}
        </div>
    );
};

export default UserProfileInfo;