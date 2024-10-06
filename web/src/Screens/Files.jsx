import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Styles/Home.css';

const Files = () => {
    const [file, setFile] = useState(null);
    const [recentUploads, setRecentUploads] = useState([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const navigate = useNavigate();

    // Fetch uploaded files from the database when the component mounts
    useEffect(() => {
        const fetchUploadedFiles = async () => {
            try {
                const response = await fetch('http://localhost:5000/files');
                if (response.ok) {
                    const files = await response.json();
                    setRecentUploads(files);
                } else {
                    console.error('Failed to fetch files');
                }
            } catch (error) {
                console.error('Error fetching files:', error);
            }
        };

        fetchUploadedFiles();
    }, []);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

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
                const uploadedFile = await response.json(); // Get file metadata from the response
                alert('File uploaded successfully');

                // Add the new file to the top of the list
                setRecentUploads([uploadedFile, ...recentUploads]);
                setFile(null); // Reset the selected file
                setIsUploadModalOpen(false); // Close the modal
            } else {
                alert('File upload failed');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file');
        }
    };

    const handleDelete = async (index, fileId) => {
        try {
            const response = await fetch(`http://localhost:5000/files/${fileId}`, {
                method: 'DELETE',
            });
    
            if (response.ok) {
                const updatedUploads = recentUploads.filter((_, i) => i !== index);
                setRecentUploads(updatedUploads);
            } else {
                alert('Failed to delete file');
            }
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };
    
    const handleInspect = (fileName) => {
        navigate(`/files/${fileName}`);
    };

    // Helper function to format date to CST
    const formatToCST = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { 
            timeZone: 'America/Chicago', // CST timezone
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: 'numeric', 
            minute: 'numeric', 
            second: 'numeric', 
            hour12: true 
        });
    };

    return (
        <div className="home-container">
            <div className="navbar">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/challenge" className="nav-link">Challenge</Link>
                <Link to="/team" className="nav-link">Team</Link>
            </div>

            <div className="content">
                <div className="centered-content">
                    <h1 className="title">Seismic Activity Browser</h1>
                    <button onClick={() => setIsUploadModalOpen(true)} className="upload-button">Upload</button>
                </div>

                {/* Modal */}
                {isUploadModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Select a File to Upload</h2>
                            <input type="file" accept=".csv" onChange={handleFileChange} />
                            {file && <p>Selected File: {file.name}</p>}
                            <button onClick={handleFileUpload}>Upload</button>
                            <button onClick={() => setIsUploadModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                )}

                {/* Uploaded files */}
                <div className="uploaded-files">
                    {recentUploads.map((upload, index) => (
                        <div key={upload.id} className="file-box">
                            <div className="file-info">
                                <p><strong>File Name:</strong> {upload.name}</p>
                                <p><strong>Upload Time:</strong> {formatToCST(upload.created_at)}</p>
                            </div>
                            <div className="file-box-buttons">
                                <button onClick={() => handleInspect(upload.name)}>Inspect</button>
                                <button onClick={() => handleDelete(index, upload.id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Files;
