import { getCurrentPosition, parseCoordinates } from './geolocation.js';
import { renderTimeline, posts } from './timeline.js';

// Состояние приложения
const mediaState = {
  recorder: null,
  chunks: [],
  stream: null,
  currentMediaType: null
};

// DOM элементы
const elements = {
  startAudio: document.getElementById('start-audio'),
  stopAudio: document.getElementById('stop-audio'),
  startVideo: document.getElementById('start-video'),
  stopVideo: document.getElementById('stop-video'),
  videoPreview: document.getElementById('video-preview'),
  audioPreview: document.getElementById('audio-preview')
};

/**
 * Инициализирует медиа-контролы
 */
export function initMediaControls() {
  setupEventListeners();
  toggleButtons(false);
}

/**
 * Настраивает обработчики событий
 */
function setupEventListeners() {
  elements.startAudio.addEventListener('click', startAudioRecording);
  elements.stopAudio.addEventListener('click', stopRecording);
  elements.startVideo.addEventListener('click', startVideoRecording);
  elements.stopVideo.addEventListener('click', stopRecording);
}

/**
 * Начинает запись аудио
 */
async function startAudioRecording() {
  await startRecording({ audio: true }, 'audio');
  elements.audioPreview.srcObject = mediaState.stream;
}

/**
 * Начинает запись видео
 */
async function startVideoRecording() {
  await startRecording({ audio: true, video: true }, 'video');
  elements.videoPreview.srcObject = mediaState.stream;
  elements.videoPreview.style.display = 'block';
}

/**
 * Общая функция начала записи
 */
async function startRecording(constraints, mediaType) {
  try {
    mediaState.stream = await navigator.mediaDevices.getUserMedia(constraints);
    mediaState.recorder = new MediaRecorder(mediaState.stream);
    mediaState.chunks = [];
    mediaState.currentMediaType = mediaType;

    mediaState.recorder.ondataavailable = handleDataAvailable;
    mediaState.recorder.onstop = handleRecordingStop;
    mediaState.recorder.start();

    toggleButtons(true, mediaType);
  } catch (error) {
    console.error(`Ошибка доступа к ${mediaType === 'audio' ? 'микрофону' : 'камере'}:`, error);
    showErrorModal(`Не удалось получить доступ к ${mediaType === 'audio' ? 'микрофону' : 'камере'}`);
  }
}

/**
 * Останавливает запись
 */
function stopRecording() {
  if (mediaState.recorder && mediaState.recorder.state !== 'inactive') {
    mediaState.recorder.stop();
    cleanupMedia();
    toggleButtons(false);
  }
}

/**
 * Обрабатывает доступные данные записи
 */
function handleDataAvailable(event) {
  if (event.data.size > 0) {
    mediaState.chunks.push(event.data);
  }
}

/**
 * Обрабатывает завершение записи
 */
async function handleRecordingStop() {
  const mimeType = mediaState.currentMediaType === 'audio' ? 'audio/wav' : 'video/mp4';
  const blob = new Blob(mediaState.chunks, { type: mimeType });
  const mediaUrl = URL.createObjectURL(blob);

  try {
    const position = await getCurrentPosition();
    addMediaPost(mediaUrl, position, mediaState.currentMediaType);
  } catch (error) {
    showCoordinatesModal(mediaUrl, mediaState.currentMediaType);
  }
}

/**
 * Добавляет медиа-пост в ленту
 */
function addMediaPost(mediaUrl, coords, mediaType) {
  const post = {
    type: mediaType,
    id: Date.now(),
    [`${mediaType}Url`]: mediaUrl,
    coords,
    date: new Date()
  };

  posts.unshift(post);
  renderTimeline();
}

/**
 * Показывает модальное окно для ввода координат
 */
function showCoordinatesModal(mediaUrl, mediaType) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <p>Не удалось определить местоположение</p>
      <p>Пожалуйста, введите координаты вручную:</p>
      <input type="text" id="coordinates-input" placeholder="51.50851, -0.12572">
      <div class="modal-actions">
        <button id="cancel-btn">Отмена</button>
        <button id="confirm-btn">OK</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const handleConfirm = () => {
    try {
      const input = modal.querySelector('#coordinates-input');
      const coords = parseCoordinates(input.value);
      addMediaPost(mediaUrl, coords, mediaType);
      closeModal(modal);
    } catch (error) {
      alert(error.message);
    }
  };

  modal.querySelector('#confirm-btn').addEventListener('click', handleConfirm);
  modal.querySelector('#cancel-btn').addEventListener('click', () => closeModal(modal));
  modal.querySelector('#coordinates-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleConfirm();
  });
}

/**
 * Закрывает модальное окно
 */
function closeModal(modal) {
  document.body.removeChild(modal);
}

/**
 * Очищает медиа-ресурсы
 */
function cleanupMedia() {
  if (mediaState.stream) {
    mediaState.stream.getTracks().forEach(track => track.stop());
  }
  
  if (mediaState.currentMediaType === 'audio') {
    elements.audioPreview.srcObject = null;
  } else {
    elements.videoPreview.srcObject = null;
    elements.videoPreview.style.display = 'none';
  }

  mediaState.stream = null;
  mediaState.recorder = null;
  mediaState.currentMediaType = null;
}

/**
 * Переключает состояние кнопок
 */
function toggleButtons(isRecording, mediaType) {
  elements.startAudio.disabled = isRecording && mediaType === 'audio';
  elements.stopAudio.disabled = !isRecording || mediaType !== 'audio';
  elements.startVideo.disabled = isRecording && mediaType === 'video';
  elements.stopVideo.disabled = !isRecording || mediaType !== 'video';
}

/**
 * Показывает модальное окно с ошибкой
 */
function showErrorModal(message) {
  alert(message); // В реальном приложении заменить на красивый модал
}