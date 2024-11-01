# save as `predict_signal.py`
import json
import sys
import numpy as np
import tensorflow as tf

# Load TFLite model and allocate tensors.
import tensorflow as tf

try:
    interpreter = tf.lite.Interpreter(model_path="./model.tflite")
    interpreter.allocate_tensors()
except ValueError as e:
    print(f"Error loading model: {e}")
    exit(1)

# Function to preprocess data, run inference, and output signal
def predict_signal(ohlcv_data):
    # Process OHLCV data into the expected input format for the model
    ohlcv_data = np.array(ohlcv_data, dtype=np.float32).reshape(1, 5, 5)  # 1 batch, 5 sequences, 5 features

    # Set the input tensor
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    interpreter.set_tensor(input_details[0]['index'], ohlcv_data)
    interpreter.invoke()

    # Get the prediction from the output tensor
    output_data = interpreter.get_tensor(output_details[0]['index'])[0][0]
    signal = "Buy" if output_data > 0.5 else "Sell"

    # Write the signal to JSON file
    with open("signal_output.json", "w") as json_file:
        json.dump({"signal": signal}, json_file)

# Get OHLCV data from command line arguments
if __name__ == "__main__":
    # Example: Pass data in as command-line arguments
    # Expecting 25 floats (5 entries * 5 features)
    ohlcv_data = [float(x) for x in sys.argv[1:26]]
    predict_signal(ohlcv_data)
