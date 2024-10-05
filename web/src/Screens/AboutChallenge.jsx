import React from 'react';
import { Line } from '../Components/Line.js';

const AboutChallenge = () => {
    return (
        <div>
            <h1>About the Challenge</h1>
            <p>
                The goal of this challenge is to write a computer program that can analyze real seismic data 
                from the Apollo missions and the Mars InSight Lander to find seismic events. We've provided 
                a data packet containing seismic records from these missions, divided into training and testing subsets.
            </p>
            <p>
                The training data includes a catalog of known seismic events that you can use to identify patterns. 
                Your task is to analyze the provided data and find all the seismic events in the test dataset. You might even find events that haven't been cataloged yet!
            </p>
            <p>
                Here are some ways to approach this challenge:
            </p>
            <ul>
                <li>
                    <strong>Algorithm Building</strong>: Create an algorithm based on the known data in the catalog and apply it to the uncatalogued test data.
                </li>
                <li>
                    <strong>STA/LTA Algorithms</strong>: Use Short-Term Average to Long-Term Average ratio (STA/LTA) algorithms to compare energy differences in short and long data segments to spot seismic events.
                </li>
                <li>
                    <strong>Machine Learning</strong>: Recently, machine learning techniques have been successful in identifying seismic signals. We provide a Python Jupyter Notebook to help you get started with downloading additional Earth seismic data for training.
                </li>
            </ul>
            <p>
                Watch out for missing data and glitches, as these are common in planetary data. Make sure to use open-source code for your project so others can learn from your approach!
            </p>
            
            <Line />

            <h1>How are we Approaching</h1>
        </div>
    );
};

export default AboutChallenge;
