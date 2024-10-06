import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../Styles/Home.css';
import { Chart } from 'chart.js';
import { useEffect } from 'react';
import ChartComponent from '../Components/ChartComponent';

const FileDetail = () => {
    const { fileName } = useParams();
    const navigate = useNavigate();

    return (
        <div className="file-detail-container">
            <h2>DETAILS FOR: {fileName}</h2>
            <button onClick={() => navigate('/files')} className="back-button">Back</button>
            <ChartComponent />
        </div>
        
    );
};

export default FileDetail;
