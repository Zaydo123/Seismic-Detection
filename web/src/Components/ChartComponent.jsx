import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import Papa from 'papaparse';

const ChartComponent = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Load and parse the full CSV data
    fetch('../../dummy_data/1.csv')
      .then(response => response.text())
      .then(data => {
        const parsedData = Papa.parse(data, { header: true }).data;

        // Sample every 10th row for plotting
        const sampledData = parsedData.filter((_, index) => index % 10 === 0);

        const timeLabels = sampledData.map(row => row['time_rel(sec)']);
        const velocities = sampledData.map(row => parseFloat(row['velocity(m/s)']));

        setChartData({
          labels: timeLabels,
          datasets: [
            {
              label: 'Velocity',
              data: velocities,
              fill: false,
              borderColor: 'rgba(75,192,192,1)',
              tension: 0.1,
            },
          ],
        });
      });
  }, []);

  if (!chartData) return <div>Loading...</div>;

  return (
    <div style={{ width: '80vw', height: '60vh', margin: '0 auto' }}>
      <Line
        data={chartData}
        options={{
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Time (s)',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Velocity (m/s)',
              },
            },
          },
        }}
      />
    </div>
  );
};

export default ChartComponent;
