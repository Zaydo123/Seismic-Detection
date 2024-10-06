import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/Files.css'; // Import the CSS file
// import ParticlesComponent from '../Components/ParticlesComponent.jsx';

const Files = () => {
    const [file, setFile] = useState(null);
    const [recentUploads, setRecentUploads] = useState([]);
    const [selectedFile, setSelectedFile] = useState('');

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };
// 
    const handleFileUpload = async () => {
        if (!file) {
            alert('Please select a file first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert('File uploaded successfully');
                setRecentUploads([...recentUploads, file.name]);
            } else {
                alert('File upload failed');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file');
        }
    };

    const handleSelectFile = (event) => {
        setSelectedFile(event.target.value);
    };

    return (
        <div className="home-container">
            {/* <ParticlesComponent /> */}
            <div className="navbar">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/challenge" className="nav-link">Challenge</Link>
                <Link to="/team" className="nav-link">Team</Link>
            </div>

            <div className="content">
                <h1 className="title">Files Upload</h1>
                <div className="upload-section">
                    <label htmlFor="file-upload" className="label-file">Choose File</label>
                    <input id="file-upload" type="file" accept=".csv" onChange={handleFileChange} />
                    <button onClick={handleFileUpload}>Upload</button>
                    <select onChange={handleSelectFile}>
                        <option value="">Select a recent upload</option>
                        {recentUploads.map((upload, index) => (
                            <option key={index} value={upload}>{upload}</option>
                        ))}
                    </select>
                    {selectedFile && <p>Selected File: {selectedFile}</p>}
                </div>
            </div>
        </div>
    );
};

export default Files;
