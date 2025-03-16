import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '../css/common/common-app.css';
import MainPage from "./MainPage/MainPage";
import Login from "./Autorization/Login";
import Register from "./Autorization/Rigister";
import Activate from "./Autorization/Activate";
import ResetPassword from "./Autorization/ResetPassword";
import ChangePassword from "./Autorization/ChangePassword";
import MainProfile from "./Profile/MainProfile";
import BotsPageMain from "./BotsPage/BotsPageMain";
import SimulationPage from "./Simulation/SimulationPage";
import StartBotPage from "./StartBot/StartBotPage";

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>


                    <Route path="/" element={<MainPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/activate/:token" element={<Activate />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/change-password/:token" element={<ChangePassword />} />

                    <Route path="/profile" element={<MainProfile />} />
                    <Route path="/bots" element={<BotsPageMain />} />
                    <Route path="/bots" element={<BotsPageMain />} />
                    <Route path="/simulation" element={<SimulationPage />} />
                    <Route path="/create-bot" element={<StartBotPage />} />



                </Routes>
            </div>
        </Router>
    );
}



export default App;
