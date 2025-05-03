const startCameraBtn = document.getElementById('startCameraBtn');
const stopCameraBtn = document.getElementById('stopCameraBtn');
const captureBtn = document.getElementById('captureBtn');
const clearImageBtn = document.getElementById('clearImageBtn');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const animetionBtn = document.getElementById('animetionBtn');
const piccasoBtn = document.getElementById('piccasoBtn');
const promptInput = document.getElementById('prompt');
const imageInput = document.getElementById('imageUpload');
const inputPreview = document.getElementById('inputPreview');
const video = document.getElementById('video');
const outputCanvas = document.getElementById('outputCanvas');
const ctx = outputCanvas.getContext('2d');
const statusText = document.getElementById('status');
const spinner = document.getElementById('spinner');

let stream = null;
let inputImageBase64 = null;

document.body.setAttribute('data-theme', 'dark');
themeToggleBtn.textContent = '☀️ 라이트 모드';
let isDarkMode = true;

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    statusText.textContent = "카메라 켜짐.";
  } catch (err) {
    console.error(err);
    alert("카메라를 사용할 수 없습니다.");
  }
}
function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
    stream = null;
    statusText.textContent = "카메라 꺼짐.";
  }
}
function capturePhoto() {
  if (!stream) return alert("먼저 카메라를 켜주세요.");
  const captureCanvas = document.createElement('canvas');
  captureCanvas.width = video.videoWidth;
  captureCanvas.height = video.videoHeight;
  captureCanvas.getContext('2d').drawImage(video, 0, 0);
  inputPreview.src = captureCanvas.toDataURL('image/png');
  inputImageBase64 = inputPreview.src.split(',')[1];
  statusText.textContent = "사진 캡처 완료!";
}
function clearUploadedImage() {
  imageInput.value = "";
  inputPreview.src = "";
  inputImageBase64 = null;
  statusText.textContent = "업로드한 이미지 삭제 완료.";
}
async function generateImage() {
  const prompt = promptInput.value.trim();
  if (!prompt) return alert("프롬프트를 입력해주세요.");
  statusText.textContent = "이미지 생성 중...";
  spinner.style.display = "block";

  try {
    const response = await fetch("/api/generate", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, imageBase64: inputImageBase64 })
    });
    const data = await response.json();
    if (data.imageBase64) {
      const img = new Image();
      img.onload = () => {
        outputCanvas.width = img.width;
        outputCanvas.height = img.height;
        
        ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        
        ctx.drawImage(img, 0, 0);
        statusText.textContent = "이미지 생성 완료!";
      };
      img.src = "data:image/png;base64," + data.imageBase64;
    } else {
      throw new Error("이미지 생성 실패.");
    }
  } catch (error) {
    console.error(error);
    alert("서버 오류: " + error.message);
    statusText.textContent = "오류 발생.";
  } finally {
    spinner.style.display = "none";
  }
}
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      inputPreview.src = reader.result;
      inputImageBase64 = reader.result.split(',')[1];
      resolve(inputImageBase64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}


themeToggleBtn.addEventListener('click', () => {
  isDarkMode = !isDarkMode;
  document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  themeToggleBtn.textContent = isDarkMode ? '☀️ 라이트 모드' : '🌙 다크 모드';
});

startCameraBtn.addEventListener('click', startCamera);
stopCameraBtn.addEventListener('click', stopCamera);
captureBtn.addEventListener('click', capturePhoto);
clearImageBtn.addEventListener('click', clearUploadedImage);
generateBtn.addEventListener('click', generateImage);

downloadBtn.addEventListener('click', () => {
  if (outputCanvas.width === 0 || outputCanvas.height === 0) return alert("저장할 결과 이미지가 없습니다.");
  const link = document.createElement('a');
  link.download = `result-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
  link.href = outputCanvas.toDataURL("image/png");
  link.click();
});

imageInput.addEventListener('change', () => {
  if (imageInput.files.length > 0) toBase64(imageInput.files[0]);
});

animetionBtn.addEventListener('click', () => {
  promptInput.value = "Preserve the input person's identity, including facial features and hairstyle, and only change the clothing to a Maid uniform. Do not alter the face, body, or background.";
  generateImage();
});

piccasoBtn.addEventListener('click', () => {
  promptInput.value = "Preserve the input person's identity, including facial features and hairstyle, and only change the clothing to a Black Suit. Do not alter the face, body, or background.";
  generateImage();
});