import numpy as np
import pandas as pd
import logging
from typing import List
from obspy import Trace
from obspy.signal.trigger import classic_sta_lta, trigger_onset
from matplotlib import pyplot as plt

logging.getLogger().setLevel(logging.INFO)

def detect_earthquakes(dataframe : pd.DataFrame) -> List[float]:
    earthquake_start_times = []  # Output
    logging.info(f"Processing new job with {len(dataframe)} entries")
    csv_times = np.array(dataframe['time_rel(sec)'].tolist())  
    csv_data = np.array(dataframe['velocity(m/s)'].tolist())

    time = csv_times

    # Compute sampling frequency
    delta_t = np.diff(time)
    if np.any(delta_t == 0):
        logging.warning(f"Zero interval found in time data for file. Stopping job.")
        return []

    fs = 1 / delta_t.mean()  # Sampling frequency in Hz
    logging.info(f"Sampling frequency (fs): {fs} Hz")

    # Create an Obspy Trace object
    trace = Trace()
    trace.data = csv_data
    trace.stats.sampling_rate = fs

    # Apply bandpass filter using Obspy
    minfreq = 0.01  # Minimum frequency in Hz
    maxfreq = 0.5   # Maximum frequency in Hz
    trace_filtered = trace.copy()
    trace_filtered.filter('bandpass', freqmin=minfreq, freqmax=maxfreq, corners=4, zerophase=True)

    # Apply STA/LTA algorithm
    sta_length = 75  # Short-term window length in seconds
    lta_length = 10000  # Long-term window length in seconds
    sta_samples = int(sta_length * fs)
    lta_samples = int(lta_length * fs)

    # Ensure STA and LTA lengths are appropriate
    if sta_samples <= 0 or lta_samples <= 0 or sta_samples >= lta_samples:
        logging.warning(f"Invalid STA/LTA lengths for file. Stopping job.")
        return []

    cft = classic_sta_lta(trace_filtered.data, sta_samples, lta_samples)

    # Define trigger thresholds
    thr_on = 20  # Trigger on threshold
    thr_off = 5  # Trigger off threshold
    on_off = trigger_onset(cft, thr_on, thr_off)

    # Check if any triggers were found
    if len(on_off) == 0:
        logging.info(f"No triggers found in file.")
        return []

    # Debug print to check triggers
    logging.info(f"Triggers found: {on_off}")

    # Store the start times of detected events
    for start, end in on_off:
        earthquake_start_times.append(time[start])
    
    # # Visualize the results - Uncomment to enable

    # plt.figure(figsize=(14, 8))

    # # Plot filtered data with triggers
    # plt.subplot(2, 1, 1)
    # plt.plot(time, trace_filtered.data, label='Filtered Data')
    # for idx, (start, end) in enumerate(on_off):
    #     plt.axvspan(time[start], time[end], color='red', alpha=0.3, label='Detected Event' if idx == 0 else "")
    # plt.xlabel('Time (s)')
    # plt.ylabel('Amplitude')
    # plt.title(f'Filtered Data with Detected Events')
    # plt.legend()

    # # Plot STA/LTA characteristic function
    # plt.subplot(2, 1, 2)
    # plt.plot(time[:len(cft)], cft, label='STA/LTA Characteristic Function')
    # plt.axhline(y=thr_on, color='green', linestyle='--', label='Trigger On Threshold')
    # plt.axhline(y=thr_off, color='red', linestyle='--', label='Trigger Off Threshold')
    # plt.xlabel('Time (s)')
    # plt.ylabel('STA/LTA Ratio')
    # plt.title('STA/LTA Characteristic Function')
    # plt.legend()

    # plt.tight_layout()
    # plt.show()
    # print("\n")

    return earthquake_start_times


if __name__ == "__main__":
    detect_earthquakes(pd.read_csv("../data/lunar/training/data/S12_GradeA/xa.s12.00.mhz.1970-03-25HR00_evid00003.csv"))