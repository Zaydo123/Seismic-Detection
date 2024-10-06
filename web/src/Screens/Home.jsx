import React from 'react';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber'; // Import Canvas
import { OrbitControls, Box } from '@react-three/drei'; // Import helper components for 3D model
import '../Styles/Home.css'; // Import the CSS file

const Home = () => {
    return (
        <div className="home-container">
            <div className="navbar">
                <Link to="/files" className="nav-link">Files</Link>
                <Link to="/challenge" className="nav-link">Challenge</Link>
                <Link to="/team" className="nav-link">Team</Link>
            </div>

            <div className="content">
                <h1 className="title">Welcome to</h1>
                <h1 className="title">UIC's Greatest</h1>
            </div>

            {/* 3D Model Section */}
            <div className="three-d-container">
                <Canvas>
                    {/* Add basic lighting */}
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[5, 5, 5]} />
                    
                    {/* Create a rotating box */}
                    <Box args={[2, 2, 2]} rotation={[0.4, 0.4, 0.4]}>
                        <meshStandardMaterial attach="material" color="orange" />
                    </Box>

                    {/* Add orbit controls for interactivity */}
                    <OrbitControls />

                    <Model />
                </Canvas>
            </div>
        </div>
    );
};

export default Home;
