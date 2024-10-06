import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import glob
import os
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from imblearn.over_sampling import RandomOverSampler
import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
from torch.utils.data import DataLoader, TensorDataset

# Set random seed for reproducibility
np.random.seed(42)
torch.manual_seed(42)

# Parameters for windowing
window_size = 1000  # Number of samples per window (adjust as needed)
stride = 500        # Overlapping window steps (adjust as needed)

# Directories for data and catalogs

cat_directory = '../data/lunar/test/trainings/catalogs/'
cat_file = '../data/lunar/test/trainings/catalogs/apollo12_catalog_GradeA_final.csv'
data_directory = '../Seismic-Detection/data/lunar/test/data/S12_GradeB'


# Verify directory existence
if not os.path.exists(cat_directory):
    raise FileNotFoundError(f"Catalog directory does not exist: {cat_directory}")

# Load all catalog files
catalog_files = glob.glob(os.path.join(cat_directory, '*.csv'))

# Check if catalog files are found
if not catalog_files:
    raise FileNotFoundError(f"No catalog files found in {cat_directory}")

print(f"Found {len(catalog_files)} catalog files.")

catalogs = []
for f in catalog_files:
    print(f"Processing file: {f}")
    if os.path.getsize(f) > 0:
        try:
            df = pd.read_csv(f)
            if not df.empty:
                catalogs.append(df)
                print(f"  Loaded {len(df)} rows from {f}")
            else:
                print(f"  Warning: File {f} is empty after reading.")
        except Exception as e:
            print(f"  Error reading {f}: {str(e)}")
    else:
        print(f"  Skipping empty file: {f}")

# Verify if any catalogs were read
if not catalogs: 
    raise ValueError("No valid catalog files were read. Check that the catalog files are not empty and contain valid CSV data.")
# Concatenate all catalogs
try:
    cat = pd.concat(catalogs, ignore_index=True)
    print(f"Successfully concatenated {len(catalogs)} catalogs.")
except ValueError as e:
    raise ValueError(f"Error concatenating catalogs: {str(e)}. Check that all loaded dataframes have the same columns.")

# Verify catalog structure
print(f"Loaded {len(cat)} total catalog entries")
print(f"Catalog columns: {cat.columns.tolist()}")
print(f"Sample catalog entry:\n{cat.head()}")

# Initialize lists for data and labels
X = []
y = []

# Loop over each event in the catalog
for index, row in cat.iterrows():
    arrival_time_rel = row['time_rel(sec)']
    test_filename = row['filename']

    # Load the corresponding seismic data file
    csv_file = os.path.join(data_directory, f'{test_filename}.csv')
    
    if not os.path.exists(csv_file):
        print(f"Seismic data file not found: {csv_file}")
        continue

    data_cat = pd.read_csv(csv_file)

    # Extract times and data
    csv_times = data_cat['time_rel(sec)'].values
    csv_data = data_cat['velocity(m/s)'].values

    # Standardize the data
    mean = np.mean(csv_data)
    std_dev = np.std(csv_data)
    csv_data_standardized = (csv_data - mean) / std_dev

    # Segment the data into windows
    num_samples = len(csv_data_standardized)
    for i in range(0, num_samples - window_size, stride):
        window_data = csv_data_standardized[i:i + window_size]
        window_time = csv_times[i:i + window_size]

        # Check if the arrival time falls within the window
        if (arrival_time_rel >= window_time[0]) and (arrival_time_rel <= window_time[-1]):
            label = 1  # Quake
        else:
            label = 0  # Noise

        X.append(window_data)
        y.append(label)

# Ensure data has been collected
if len(X) == 0 or len(y) == 0:
    raise ValueError("No valid data windows collected. Check the catalog and data file paths.")

# Convert lists to numpy arrays
X = np.array(X)
y = np.array(y)

print(f"Total samples before balancing: {len(y)}")
print(f"Number of quake samples: {np.sum(y == 1)}")
print(f"Number of noise samples: {np.sum(y == 0)}")

# Reshape X for oversampling
nsamples, nx = X.shape
X_reshaped = X.reshape((nsamples, nx))

# Balance the dataset using RandomOverSampler
ros = RandomOverSampler(random_state=42)
X_resampled, y_resampled = ros.fit_resample(X_reshaped, y)

# Reshape X back to original shape
X_resampled = X_resampled.reshape((X_resampled.shape[0], window_size, 1))

print(f"Total samples after balancing: {len(y_resampled)}")
print(f"Number of quake samples: {np.sum(y_resampled == 1)}")
print(f"Number of noise samples: {np.sum(y_resampled == 0)}")

# Split the data into training and testing datasets
X_train, X_test, y_train, y_test = train_test_split(
    X_resampled, y_resampled, test_size=0.2, random_state=42)

# Convert data to torch tensors
X_train_tensor = torch.tensor(X_train, dtype=torch.float32)
y_train_tensor = torch.tensor(y_train, dtype=torch.float32)
X_test_tensor = torch.tensor(X_test, dtype=torch.float32)
y_test_tensor = torch.tensor(y_test, dtype=torch.float32)

# Create DataLoader for batching
batch_size = 32
train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
test_dataset = TensorDataset(X_test_tensor, y_test_tensor)

train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)

print(f"Training batches: {len(train_loader)}, Testing batches: {len(test_loader)}")

# Define the improved CNN model
class SeismicCNN(nn.Module):
    def __init__(self):
        super(SeismicCNN, self).__init__()
        self.conv1 = nn.Conv1d(1, 16, kernel_size=21, padding=10)
        self.conv2 = nn.Conv1d(16, 32, kernel_size=15, padding=7)
        self.conv3 = nn.Conv1d(32, 64, kernel_size=11, padding=5)
        self.pool = nn.MaxPool1d(2)
        self.dropout = nn.Dropout(0.2)
        self.flatten = nn.Flatten()
        self.fc1 = nn.Linear(64 * (window_size // 8), 64)
        self.fc2 = nn.Linear(64, 1)
        
    def forward(self, x):
        x = x.permute(0, 2, 1)  # Rearrange input for Conv1D [batch_size, channels, seq_length]
        x = F.relu(self.conv1(x))
        x = self.pool(x)
        x = self.dropout(x)
        x = F.relu(self.conv2(x))
        x = self.pool(x)
        x = self.dropout(x)
        x = F.relu(self.conv3(x))
        x = self.pool(x)
        x = self.dropout(x)
        x = self.flatten(x)
        x = F.relu(self.fc1(x))
        x = torch.sigmoid(self.fc2(x))
        return x
    

# Instantiate model, define loss and optimizer
model = SeismicCNN()
criterion = nn.BCELoss()  # Binary Cross-Entropy for binary classification
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Training the model with early stopping
epochs = 20
best_loss = np.inf
patience = 3
trigger_times = 0

print("Starting training...")
for epoch in range(epochs):
    model.train()
    running_loss = 0.0
    for X_batch, y_batch in train_loader:
        y_batch = y_batch.view(-1, 1)  # Reshape labels for binary classification
        
        # Forward pass
        outputs = model(X_batch)
        loss = criterion(outputs, y_batch)
        
        # Backward and optimize
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item()
    
    avg_train_loss = running_loss / len(train_loader)
    print(f'Epoch [{epoch+1}/{epochs}], Loss: {avg_train_loss:.4f}')
    
    # Early stopping
    if avg_train_loss < best_loss:
        best_loss = avg_train_loss
        trigger_times = 0
        # Save the best model
        torch.save(model.state_dict(), 'best_model.pth')
    else:
        trigger_times += 1
        if trigger_times >= patience:
            print('Early stopping!')
            break

# Load the best model
model.load_state_dict(torch.load('best_model.pth'))

# Evaluate model
print("Starting evaluation...")
model.eval()
y_true = []
y_pred = []

with torch.no_grad():
    for X_batch, y_batch in test_loader:
        y_batch = y_batch.view(-1, 1)
        outputs = model(X_batch)
        predicted = (outputs >= 0.5).float()
        y_true.extend(y_batch.numpy())
        y_pred.extend(predicted.numpy())

# Classification report
print("Classification Report:")
print(classification_report(y_true, y_pred, target_names=['Noise', 'Quake']))

# Confusion matrix
cm = confusion_matrix(y_true, y_pred)
print("Confusion Matrix:")
print(cm)

# Plot confusion matrix
import seaborn as sns

plt.figure(figsize=(6,4))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Noise', 'Quake'], yticklabels=['Noise', 'Quake'])
plt.xlabel('Predicted')
plt.ylabel('True')
plt.title('Confusion Matrix')
plt.show()
