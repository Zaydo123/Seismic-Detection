import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy.fft import fft, fftfreq
from scipy.signal import find_peaks

# Define directories and catalog file
cat_directory = '/data/lunar/training/data/'
cat_file = f'{cat_directory}xa.s12.00.mhz.1970-01-19HR00_evid00002.csv'
data_directory = '/data/lunar/training/data/S12_GradeA/'

# Load the catalog file if it exists
try:
    cat = pd.read_csv(cat_file)
    # Select a row to work with (e.g., row 6)
    row = cat.iloc[6]
    arrival_time_rel = row['time_rel(sec)']
    test_filename = row['filename']
    csv_file = f'{data_directory}{test_filename}.csv'
    print(f"Using catalog file: {csv_file}")
except FileNotFoundError:
    print(f"Catalog file '{cat_file}' not found. Processing standalone CSVs in '{data_directory}' instead.")
    csv_file = f'{data_directory}example_file.csv'  # Modify as needed

# Load the event data
data_cat = pd.read_csv(csv_file)

# Extract time and velocity data
csv_times = np.array(data_cat['time_rel(sec)'].tolist())  
csv_data = np.array(data_cat['velocity(m/s)'].tolist())

time = csv_times

# Calculate the derivative
derivative = np.gradient(csv_data)

# Find the earthquake start point based on a threshold in the derivative
threshold = np.mean(derivative) + 2 * np.std(derivative)  # example threshold
earthquake_start_index = np.where(derivative > threshold)[0][0]  # Find the first point exceeding the threshold
earthquake_start_time = time[earthquake_start_index]
print(f"Earthquake starts at time: {earthquake_start_time}")

# FFT and frequency calculations
N = len(time)  
T = time[1] - time[0]
velocity = fft(csv_data)
frequencies = fftfreq(N, T)

# Only keep the positive half of the frequencies
positive_frequencies = frequencies[:N//2]
positive_fft = np.abs(velocity[:N//2])

# Find peaks in the velocity data
peaks, _ = find_peaks(csv_data, height=np.mean(csv_data) + 2 * np.std(csv_data))

# Plotting the results
plt.figure(figsize=(14, 6))

# Plot velocity in the time domain
plt.subplot(1, 2, 1)
plt.plot(time, csv_data, label='Velocity')
plt.plot(time[peaks], csv_data[peaks], "x", label="Spike in Velocity (Earthquake Start)")
plt.xlabel('Time (sec)')
plt.ylabel('Velocity')
plt.title('Velocity Time Series')
plt.legend()

# Plot FFT of velocity in the frequency domain
plt.subplot(1, 2, 2)
plt.plot(positive_frequencies, positive_fft)
plt.xlabel('Frequency (Hz)')
plt.ylabel('Amplitude')
plt.title('FFT of Velocity')

plt.tight_layout()
plt.show()

print(f"Earthquake starts at time: {earthquake_start_time}")
