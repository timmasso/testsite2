const video = document.getElementById('videoElement');
const indicator = document.getElementById('indicator');
let notificationSent = false;

async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        await video.play();
        return video;
    } catch (error) {
        console.error('Error accessing the camera:', error);
    }
}

async function detectPerson() {
    try {
        const model = await cocoSsd.load();
        console.log('Model loaded successfully');

        function detect() {
            model.detect(video).then(predictions => {
                console.log('Predictions:', predictions);
                
                let personDetected = false;

                predictions.forEach(prediction => {
                    if (prediction.class === 'person' && prediction.score > 0.3) {
                        personDetected = true;
                    }
                });

                if (personDetected) {
                    indicator.classList.add('person-detected');
                    if (!notificationSent) {
                        sendNotification();
                        notificationSent = true;
                    }
                } else {
                    indicator.classList.remove('person-detected');
                    notificationSent = false;
                }

                requestAnimationFrame(detect);
            }).catch(error => {
                console.error('Error during detection:', error);
            });
        }

        detect();
    } catch (error) {
        console.error('Error loading model:', error);
    }
}

function sendNotification() {
    if (Notification.permission === "granted") {
        new Notification("Person Detected", {
            body: "A person has been detected in the camera feed.",
            icon: "https://cdn.pixabay.com/photo/2017/08/30/08/32/notification-2692326_960_720.png"
        }).onclick = () => {
            console.log('Notification clicked');
        };
    } else if (Notification.permission === "denied") {
        console.log('Notification permission denied');
    } else {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification("Person Detected", {
                    body: "A person has been detected in the camera feed.",
                    icon: "https://cdn.pixabay.com/photo/2017/08/30/08/32/notification-2692326_960_720.png"
                }).onclick = () => {
                    console.log('Notification clicked');
                };
            } else {
                console.log('Notification permission not granted');
            }
        }).catch(error => {
            console.error('Notification permission request failed:', error);
        });
    }
}

function sendTestNotification() {
    sendNotification();
}

async function init() {
    await setupCamera();
    detectPerson();
}

init();
