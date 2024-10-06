import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../Styles/Home.css';
import ChartComponent from '../Components/ChartComponent';

const FileDetail = () => {
    const { fileName } = useParams();
    const navigate = useNavigate();

    // Function to handle the download of the CSV file
    const handleDownloadCSV = () => {
        fetch('http://localhost:5000/api/download-csv') // Adjust the URL if needed
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.blob(); // Get the response as a blob
            })
            .then(blob => {
                // Create a link element
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'joined_data.csv'); // Set the download filename
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            })
            .catch(error => {
                console.error('Error downloading the CSV file:', error);
            });
    };

    return (
        <div className="file-detail-container">
            <h2>DETAILS FOR: {fileName}</h2>
            <button onClick={() => navigate('/files')} className="back-button">Back</button>
            <button onClick={handleDownloadCSV} className="download-button">Download CSV</button>
            <ChartComponent />
        </div>
    );
};

export default FileDetail;
