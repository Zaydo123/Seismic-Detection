import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '../Screens/Home.jsx';
import FilesPage from '../Screens/Files.jsx';
import ChallengePage from '../Screens/AboutChallenge.jsx';
import AboutTeam from '../Screens/AboutTeam.jsx';
import FileDetail from '../Screens/FileDetail.jsx'; // Import the new FileDetail component

const RootStack = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/files" element={<FilesPage />} />
                <Route path="/files/:fileName" element={<FileDetail />} /> {/* Add this line */}
                <Route path="/challenge" element={<ChallengePage />} />
                <Route path="/team" element={<AboutTeam />} />
            </Routes>
        </Router>
    );
};

export default RootStack;
