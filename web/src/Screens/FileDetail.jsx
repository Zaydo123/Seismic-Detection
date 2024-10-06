import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../Styles/Home.css';

const FileDetail = () => {
    const { fileName } = useParams();
    const navigate = useNavigate();

    return (
        <div className="file-detail-container">
            <h1>Details for: {fileName}</h1>
            <button onClick={() => navigate('/files')} className="back-button">Back</button>
        </div>
    );
};

export default FileDetail;
