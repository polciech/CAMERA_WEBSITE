from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import base64
import os
from datetime import date
import json 
import cv2
from PIL import Image, ImageDraw, ImageFont
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Directory to save the images
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/upload', methods=['POST'])
def upload_image():
    try:
        # Get the image data from the request
        data = request.json
        image_data_with_header = data['image']

        # Strip off the data URL header
        header, image_data = image_data_with_header.split(',', 1)
        image_data = base64.b64decode(image_data)

        # Generate a unique filename with extension based on image data
        filename, extension = generate_unique_filename_jpg(image_data)
        # finalname = filename = secure_filename(filename + extension)
        filepath = os.path.join(UPLOAD_FOLDER, filename+extension)

        # Save the image locally
        with open(filepath, 'wb') as f:
            f.write(image_data)

        write_to_json(filename, extension)

        return jsonify({'message': 'Image uploaded successfully', 'filename': filename + extension}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/upload_video', methods=['POST'])
def upload_video():
    try:
        # Get the video data from the request
        data = request.json
        video_data_decoded = data['video']

        video_data = base64.b64decode(video_data_decoded)

        # Generate a unique filename with extension based on video data
        filename, extension = generate_unique_filename_webm(video_data)
        # finalname = filename = secure_filename(filename + extension)
        filepath = os.path.join(UPLOAD_FOLDER, filename+extension)

        # Save the video locally
        with open(filepath, 'wb') as f:
            f.write(video_data)

        cap = cv2.VideoCapture(filepath)

        # Check if the video file is opened successfully
        if not cap.isOpened():
            print("Error: Couldn't open the video file")
            return

        # Read the first frame
        ret, frame = cap.read()

        # Check if the frame is read successfully
        if not ret:
            print("Error: Couldn't read the frame")
            return

        frame_with_play_icon = add_play_icon(frame)

        # Save the first frame as a JPG image
        cv2.imwrite(UPLOAD_FOLDER+'/'+filename+'.jpg', frame_with_play_icon)

        # Release the video capture object
        cap.release()

        write_to_json(filename, '.jpg')

        # You can optionally write video metadata to a JSON file here (similar to write_to_json)

        return jsonify({'message': 'Video uploaded successfully', 'filename': filename + extension}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def generate_unique_filename_webm(video_data):
    # Use a hash function for uniqueness (e.g., md5)
    import hashlib
    unique_hash = hashlib.md5(video_data).hexdigest()[:10]  # Get first 10 chars for shorter name
    extension = '.webm'  # Assuming WebM format, adjust based on data type
    return unique_hash, extension

# Function to generate unique filename
def generate_unique_filename_jpg(image_data):
    # Use a hash function for uniqueness (e.g., md5)
    import hashlib
    unique_hash = hashlib.md5(image_data).hexdigest()[:10]  # Get first 10 chars for shorter name
    extension = '.jpg'  # Assuming JPEG format, adjust based on data type
    return unique_hash, extension

def write_to_json(filename, extension):
    with open('uploads/images.json', 'r+') as file:
        file_data = json.load(file)
        today = date.today()
        date_string = today.strftime("%Y-%m-%d")
        full_name = filename+extension
        new_data = {"name": full_name, "date": date_string}
        file_data.append(new_data)
        file.seek(0)
        json.dump(file_data, file, indent = 4)

def add_play_icon(image):
    # Convert image to PIL format
    pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))

    # Load play icon
    play_icon = Image.open("play.png")  # Assuming play_icon.png is available in the current directory

    # Resize play icon to fit the image
    play_icon = play_icon.resize((100, 100))

    # Calculate position to place the play icon at the center
    width, height = pil_image.size
    x = (width - play_icon.width) // 2
    y = (height - play_icon.height) // 2

    # Paste play icon onto the image
    pil_image.paste(play_icon, (x, y), play_icon)

    # Convert back to OpenCV format
    return cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)

@app.route('/image/<filename>')
def send_photo(filename):
    try:
        return send_from_directory(UPLOAD_FOLDER, filename)
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404

@app.route('/image_data')
def send_image_data():
    try:
        return send_from_directory(UPLOAD_FOLDER,'images.json')
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404
    
@app.route('/check', methods=['POST'])
def check():
    try:
        # Get the image data from the request
        data = request.json
        fileName = data['fileName']
        if check_for_webm_version(fileName):
            print("webm")
            return jsonify({'message': 'webm'}), 200
        else:
            print("jpg")
            return jsonify({'message': 'jpg'}), 200        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def check_for_webm_version(filename):

    # Get the base filename without extension
    base, ext = os.path.splitext(filename)

    # Construct the potential '.webm' filename
    webm_filename = f"{base}.webm"
    # Check if the '.webm' file exists in the same directory
    return os.path.exists(UPLOAD_FOLDER+'/'+webm_filename)

if __name__ == '__main__':
    # write_to_json("JD", '.jpg')
    app.run(debug=True)
