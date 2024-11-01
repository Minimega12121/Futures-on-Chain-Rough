import yfinance as yf
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from sklearn.model_selection import train_test_split

# Download historical OHLCV data
def get_ohlcv_data(ticker="AAPL", period="1y", interval="1d"):
    data = yf.download(ticker, period=period, interval=interval)
    ohlcv_data = data[['Open', 'High', 'Low', 'Close', 'Volume']].values
    return ohlcv_data

# Prepare data in sequences of 5 OHLCV entries
def prepare_sequences(data, sequence_length=5):
    sequences = []
    labels = []
    for i in range(len(data) - sequence_length - 1):
        sequence = data[i:i+sequence_length]
        next_close = data[i + sequence_length][3]  # Close price for the label
        current_close = data[i + sequence_length - 1][3]
        label = 1 if next_close > current_close else 0  # 1 = Buy, 0 = Sell
        sequences.append(sequence)
        labels.append(label)
    return np.array(sequences), np.array(labels)

# Get and prepare data
ohlcv_data = get_ohlcv_data("AAPL")
sequences, labels = prepare_sequences(ohlcv_data)
print("Data shape:", sequences.shape, labels.shape)


# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(sequences, labels, test_size=0.2, random_state=42)

# Define LSTM model
sequence_length, num_features = X_train.shape[1], X_train.shape[2]
model = Sequential([
    LSTM(64, input_shape=(sequence_length, num_features), activation='relu'),
    Dense(32, activation='relu'),
    Dense(1, activation='sigmoid')  # Output a probability for buy/sell
])
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Train the model
history = model.fit(X_train, y_train, epochs=10, batch_size=16, validation_data=(X_test, y_test))

# Evaluate the model
loss, accuracy = model.evaluate(X_test, y_test)
print("Model accuracy:", accuracy)

# Convert to TensorFlow Lite model with adjusted settings
converter = tf.lite.TFLiteConverter.from_keras_model(model)
# Enable support for TFLite's built-in operations and select TensorFlow operations
converter.target_spec.supported_ops = [
    tf.lite.OpsSet.TFLITE_BUILTINS,
    tf.lite.OpsSet.SELECT_TF_OPS
]
# Disable lowering tensor list ops, which are incompatible with TFLite
converter._experimental_lower_tensor_list_ops = False
# Enable experimental resource variable support
converter.experimental_enable_resource_variables = True

# Perform the conversion
try:
    tflite_model = converter.convert()
    # Save the TensorFlow Lite model
    with open("./model.tflite", "wb") as f:
        f.write(tflite_model)
    print("Model saved as model.tflite")
except tf.errors.ConverterError as e:
    print("Conversion failed:", e)