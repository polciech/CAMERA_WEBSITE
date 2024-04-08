

let recordingTimeMS = 5000;


const videoPreview = document.getElementById("videoPreview");
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const downloadLink = document.getElementById("downloadLink");
const photoButton = document.getElementById("photoButton");
const canvas = document.getElementById("canvas");
const uploadButton = document.getElementById("uploadButton");


let mediaRecorder;
let recordedChunks = [];
let app = document.querySelector('#app');


startButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
photoButton.addEventListener("click", startPreview);


async function startPreview() {
  let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  videoPreview.srcObject = stream

  videoPreview.style.width = '100%';
  videoPreview.style.height = '100%';
  videoPreview.style.objectFit = 'cover';

  document.getElementById("photoButton").removeEventListener("click", startPreview);
  document.getElementById("photoButton").addEventListener("click", takePhoto);
}

function takePhoto() {
  canvas.getContext('2d').drawImage(videoPreview, 0, 0, canvas.width, canvas.height);
  let image_data_url = canvas.toDataURL('image/jpeg');

  sendPhoto(image_data_url);
  console.log(image_data_url);
}


function sendPhoto(photoData) {
  console.log(photoData);
        fetch('http://127.0.0.1:5000/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: photoData })
        })
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Failed to send photo to the server');
            }
            return response.json();
        })
        .then(function (data) {
            console.log('Photo sent successfully:', data);
            // You can handle the response from the server here
        })
        .catch(function (error) {
            console.error('Error sending photo to the server:', error);
        });
    }


async function saveImage(imageUrl) {
  try {
    const response = await fetch('https://c4fc5b1d-f0f3-4bd9-8e89-fe57ade2234a-00-37k8x5uzebrih.riker.replit.dev/', {
      method: 'POST',
      body: JSON.stringify({ image: imageUrl }),
      headers: {
        'Content-Type': 'application/json'
        // Add any necessary authentication headers here
      }
    });

    if (response.ok) {
      console.log('Image saved successfully');
      displayImage(imageUrl);
    } else {
      console.error('Failed to save image');
    }
  } catch (error) {
    console.error('Error saving image:', error);
  }
}

// function displayImage(imageUrl) {
//   const gallery = document.getElementById('gallery');
//   const img = document.createElement('img');
//   img.src = imageUrl;
//   gallery.appendChild(img);
// }
// function saveImage(dataURL, filename) {
//   fetch('save_image.php', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ image: dataURL, filename: filename }),
//   })
//     .then(response => response.json())
//     .then(data => console.log('Image saved:', data))
//     .then(error => console.error('Error saving image:', error))
// }

// function selectAspectRatio(aspectRatio) {
//   document.getElementById('dropdownMenuButton').innerText = aspectRatio;
// }

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoPreview.srcObject = stream;

    videoPreview.style.width = '100%';
    videoPreview.style.height = '100%';
    videoPreview.style.objectFit = 'cover';

    mediaRecorder = new MediaRecorder(stream);
    recordedChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const videoBlob = new Blob(recordedChunks, { type: "video/webm" });
      recordedChunks = [];

      // Convert video blob to base64 for JSON inclusion
      const videoReader = new FileReader();
      videoReader.readAsDataURL(videoBlob);

      videoReader.onloadend = async () => {
        const videoBase64 = videoReader.result.split(',')[1]; // Extract base64 data

        const videoData = {
          video: videoBase64, // Include converted video data
          // Add other relevant video metadata if needed
          // ...
        };

        const jsonData = JSON.stringify(videoData);

        // Send the JSON data to the server using Fetch API
        try {
          const response = await fetch('http://127.0.0.1:5000/upload_video', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: jsonData
          });

          const responseText = await response.text();
          console.log('Server response:', responseText);

          // Handle successful response (e.g., display success message)

        } catch (error) {
          console.error('Error sending video to server:', error);

          // Handle error sending video (e.g., display error message)
        } finally {
          // Clean up after recording:
          URL.revokeObjectURL(videoPreview.src);
          videoPreview.srcObject = null;
          stream.getTracks().forEach(track => track.stop());
          mediaRecorder = null;

          downloadLink.style.display = "none"; // Hide download link (optional)
          startButton.disabled = false;
          stopButton.disabled = true;
        }
      };
    };

    mediaRecorder.start();
    startButton.disabled = true;
    stopButton.disabled = false;
  } catch (error) {
    console.error("Error starting recording:", error);
  }
}


function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    startButton.disabled = false;
    stopButton.disabled = true;
  }
}



