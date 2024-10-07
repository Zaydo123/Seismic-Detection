import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy.fft import fft, fftfreq
from obspy import Trace, Stream
from obspy.signal.trigger import classic_sta_lta, trigger_onset

# Define directories
cat_directory = '../data/lunar/training/catalogs/'
cat_file = cat_directory + 'apollo12_catalog_GradeA_final.csv'
cat = pd.read_csv(cat_file)
data_directory = '../data/lunar/training/data/S12_GradeA/'
earthquake_start_times = []

## this is just what csv we start from
start_index = 0
for index, row in cat.iloc[start_index:].iterrows():

    # Extract relative time and filename
    arrival_time_rel = row['time_rel(sec)']
    test_filename = row['filename']
    
    # Construct the file path
    csv_file = f'{data_directory}{test_filename}.csv'
    
    # Load the data from the CSV file
    try:
        data_cat = pd.read_csv(csv_file)
    except FileNotFoundError:
        print(f"File not found: {csv_file}. Skipping this entry.")
        continue

    csv_times = np.array(data_cat['time_rel(sec)'].tolist())  
    csv_data = np.array(data_cat['velocity(m/s)'].tolist())

    time = csv_times

    # Compute sampling frequency
    delta_t = np.diff(time)
    if np.any(delta_t == 0):
        print(f"Zero interval found in time data for file {test_filename}. Skipping this entry.")
        continue

    fs = 1 / delta_t.mean()  # Sampling frequency in Hz
    print(f"Processing file: {test_filename}")
    # print(f"Sampling frequency (fs): {fs} Hz")

    # Create an Obspy Trace object
    trace = Trace()
    trace.data = csv_data
    trace.stats.sampling_rate = fs

    # Apply bandpass filter using Obspy
    minfreq = 0.01  # Minimum frequency in Hz
    maxfreq = 0.5   # Maximum frequency in Hz
    trace_filtered = trace.copy()
    trace_filtered.filter('bandpass', freqmin=minfreq, freqmax=maxfreq, corners=4, zerophase=True)




    #big change
    # Apply STA/LTA algorithm
    sta_length = 75  # Short-term window length in seconds
    lta_length = 10000  # Long-term window length in seconds
    sta_samples = int(sta_length * fs)
    lta_samples = int(lta_length * fs)

    # Ensure STA and LTA lengths are appropriate
    if sta_samples <= 0 or lta_samples <= 0 or sta_samples >= lta_samples:
        print(f"Invalid STA/LTA lengths for file {test_filename}. Skipping this entry.")
        continue

    cft = classic_sta_lta(trace_filtered.data, sta_samples, lta_samples)

    # Define trigger thresholds
    thr_on = 20  # Trigger on threshold
    thr_off = 5  # Trigger off threshold
    on_off = trigger_onset(cft, thr_on, thr_off)

    # Check if any triggers were found
    if len(on_off) == 0:
        print(f"No triggers found in file {test_filename}.")
        continue

    # Plotting the results
    plt.figure(figsize=(14, 8))

    # Plot filtered data with triggers
    plt.subplot(2, 1, 1)
    plt.plot(time, trace_filtered.data, label='Filtered Data')
    for idx, (start, end) in enumerate(on_off):
        plt.axvspan(time[start], time[end], color='red', alpha=0.3, label='Detected Event' if idx == 0 else "")
    plt.xlabel('Time (s)')
    plt.ylabel('Amplitude')
    plt.title(f'Filtered Data with Detected Events - {test_filename}')
    plt.legend()

    # Plot STA/LTA characteristic function
    plt.subplot(2, 1, 2)
    plt.plot(time[:len(cft)], cft, label='STA/LTA Characteristic Function')
    plt.axhline(y=thr_on, color='green', linestyle='--', label='Trigger On Threshold')
    plt.axhline(y=thr_off, color='red', linestyle='--', label='Trigger Off Threshold')
    plt.xlabel('Time (s)')
    plt.ylabel('STA/LTA Ratio')
    plt.title('STA/LTA Characteristic Function')
    plt.legend()

    plt.tight_layout()
    plt.show()
    print("\n")
