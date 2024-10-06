import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import axios from 'axios';

const ChartComponent = () => {
  const [chartData, setChartData] = useState(null);
  const [seismicEvents, setSeismicEvents] = useState([]);

  useEffect(() => {
    // Fetch data from the API endpoint
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/graph-data');
        const graphData = response.data;

        // Assuming we want to plot data from the first file in the response
        if (graphData.length > 0) {
          const { data, start_time, name, created_at } = graphData[0]; // Adjust if needed for specific file or iteration

          // Extract relative time and velocity for the chart
          const timeLabels = data.map(item => item.time_rel);
          const velocities = data.map(item => item.velocity);

          // Find the index of the start time in the relative time array
          const startTimeIndex = timeLabels.indexOf(parseFloat(start_time)); // Assuming `start_time` is in seconds

          // Set the chart data
          setChartData({
            labels: timeLabels,
            datasets: [
              {
                label: `Velocity vs Relative Time (${name})`,
                data: velocities,
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
                tension: 0.4, // Smoothen the line
                pointBackgroundColor: (context) => {
                  // Highlight the start time point with a red color
                  const index = context.dataIndex;
                  return index === startTimeIndex ? 'red' : 'rgba(75,192,192,1)';
                },
                pointRadius: (context) => {
                  // Make the start time point larger
                  const index = context.dataIndex;
                  return index === startTimeIndex ? 12 : 3; // Larger point for start time
                },
              },
            ],
          });

          // Set seismic events data for the table
          setSeismicEvents(graphData);
        }
      } catch (error) {
        console.error('Error fetching graph data:', error);
      }
    };

    fetchData();
  }, []);

  if (!chartData) return <div>Loading...</div>;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      {/* Chart Section */}
      <div style={{ flex: 2, marginRight: '20px' }}>
        <Line
          data={chartData}
          options={{
            responsive: true,
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Relative Time (s)',
                  font: { size: 16 },
                },
              },
              y: {
                title: {
                  display: true,
                  text: 'Velocity (m/s)',
                  font: { size: 16 },
                },
              },
            },
          }}
        />
      </div>

      {/* Table Section */}
      <div style={{ flex: 1 }}>
        <h3>Seismic Events</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '18px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '12px', borderRadius: '5px' }}>Name</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', borderRadius: '5px' }}>Created At</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', borderRadius: '5px' }}>Start Time</th>
            </tr>
          </thead>
          <tbody>
            {seismicEvents.map((event, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ddd', padding: '12px', borderRadius: '5px' }}>{event.name}</td>
                <td style={{ border: '1px solid #ddd', padding: '12px', borderRadius: '5px' }}>{new Date(event.created_at).toLocaleString()}</td>
                <td style={{ border: '1px solid #ddd', padding: '12px', borderRadius: '5px' }}>{event.start_time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChartComponent;
