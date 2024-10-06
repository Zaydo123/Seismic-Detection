// Plot.jsx
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';

const Plot = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Fetch data from the server
    fetch('/api/data')
      .then(response => response.json())
      .then(data => {
        // Assuming `data` is an array of objects with `velocity`, `rel_time`, and `abs_time`
        if (data.length > 0) {
          // Extract the first entry's content to plot the waveform (adjust as needed)
          const graphData = data[0].data;

          // Get values for the graph
          const relTimes = graphData.map(item => item.time_rel);
          const velocities = graphData.map(item => item.velocity);

          // Find the index of the `abs_time` to mark it on the graph (assuming it occurs once)
          const absTimeIndex = graphData.findIndex(item => item.time_abs);

          setChartData({
            labels: relTimes, // X-axis: relative times
            datasets: [
              {
                label: 'Velocity',
                data: velocities, // Y-axis: velocities
                fill: false,
                borderColor: 'blue',
                tension: 0.1, // Smooth lines
                pointBackgroundColor: relTimes.map((_, index) =>
                  index === absTimeIndex ? 'red' : 'blue'
                ), // Red dot for abs_time
                pointRadius: relTimes.map((_, index) =>
                  index === absTimeIndex ? 5 : 2
                ), // Larger dot for abs_time
              },
            ],
          });
        }
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div>
      {chartData ? (
        <Line
          data={chartData}
          options={{
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Relative Time (sec)',
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
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default Plot;
