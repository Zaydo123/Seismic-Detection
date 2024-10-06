import React from 'react';
import { Link } from 'react-router-dom';
import '../Styles/Home.css'; // Import the CSS file

const Home = () => {
    return (
        <div className="home-container">

            <div className="navbar">
                <Link to="/files" className="nav-link">Files</Link>
                <Link to="/challenge" className="nav-link">Challenge</Link>
                <Link to="/team" className="nav-link">Team</Link>
                <Link to ="/plot" className='nav-link'>Plot</Link>
            </div>

            <div className="content">
                <h1 className="title">Welcome to</h1>
                <h1 className="title">UIC's Greatest</h1>
            </div>
        </div>
    );
};

export default Home;
