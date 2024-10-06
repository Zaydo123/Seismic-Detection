import numpy as np
import pandas as pd
from obspy import Trace
from datetime import datetime
import matplotlib.pyplot as plt
import ruptures as rpt


# def sta_lta(data, nsta, nlta):
#     sta = np.convolve(np.abs(data), np.ones(nsta) / nsta, mode='same')
#     lta = np.convolve(np.abs(data), np.ones(nlta) / nlta, mode='same')
#     lta[lta == 0] = 1e-10  # Avoid division by zero
#     return sta / lta

# Load catalog
cat_directory = '../data/lunar/training/catalogs/'
cat_file = cat_directory + 'apollo12_catalog_GradeA_final.csv'
cat = pd.read_csv(cat_file)

# Extract row information
row = cat.iloc[6]
arrival_time_rel = row['time_rel(sec)']
test_filename = row.filename

# Load event data
data_directory = '../data/lunar/training/data/S12_GradeA/'
csv_file = f'{data_directory}{test_filename}.csv'
data_cat = pd.read_csv(csv_file)

# Extract amplitude (velocity) and time
csv_times = np.array(data_cat['time_rel(sec)'].tolist())
csv_data = np.array(data_cat['velocity(m/s)'].tolist())

# Use a smaller subset of data for testing (optional)
csv_data = csv_data[:1100]  # Adjust the number to a manageable size for testing
csv_times = csv_times[:1100]

# Apply ruptures change point detection with a simpler algorithm (e.g., Pelt)
algo = rpt.Pelt(model="rbf").fit(csv_data)
penalty = 25
change_points = algo.predict(pen=penalty)

# Original plot
fig, ax = plt.subplots(1, 1, figsize=(10, 3))
plot_indices = np.linspace(0, len(csv_times) - 1, 1000, dtype=int)  # Downsample for plotting
ax.plot(csv_times[plot_indices], csv_data[plot_indices])

ax.set_xlim([min(csv_times), max(csv_times)])
ax.set_ylabel('Velocity (m/s)')
ax.set_xlabel('Time (s)')
ax.set_title(f'{test_filename}', fontweight='bold')

# Plot relative arrival time
arrival_line = ax.axvline(x=arrival_time_rel, c='red', label='Rel. Arrival')

# Add detected change points to the original plot
for cp in change_points:
    ax.axvline(x=csv_times[cp - 1], color='green', linestyle='--', label='Detected Change Point')

# Ensure labels are unique in the legend
handles, labels = ax.get_legend_handles_labels()
unique_labels = dict(zip(labels, handles))
ax.legend(unique_labels.values(), unique_labels.keys())

plt.show()

# Print detected change points
print(f"Detected change points at: {csv_times[change_points[:-1]]} seconds")