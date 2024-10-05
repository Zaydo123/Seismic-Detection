import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
                <Link to="/files" style={{ margin: '0 10px' }}>Files</Link>
                <Link to="/challenge" style={{ margin: '0 10px' }}>Challenge</Link>
                <Link to="/team" style={{ margin: '0 10px' }}>Team</Link>
            </div>
            <h1>Welcome to the Home Page</h1>
            <p>This is the home page content.</p>
        </div>
    );
};

export default Home;