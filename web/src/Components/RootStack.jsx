import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '../Screens/Home.jsx';
import FilesPage from '../Screens/Files.jsx';
import ChallengePage from '../Screens/AboutChallenge.jsx';
import AboutTeam from '../Screens/AboutTeam.jsx';

const RootStack = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/files" element={<FilesPage />} />
                <Route path="/challenge" element={<ChallengePage />} />
                <Route path="/team" element={<AboutTeam />} />
            </Routes>
        </Router>
    );
};

export default RootStack;
