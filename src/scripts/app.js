import './styles/style.css';
import { getCurrentPosition, parseCoordinates } from './geolocation.js';
import { addTextPost } from './timeline.js';

// DOM элементы
let postInput;
let modal = null;

function initDOM() {
  postInput = document.getElementById('post-input');
}

async function handlePostCreation() {
  if (postInput.value.trim()) {
    await createPostWithGeolocation(postInput.value.trim());
    postInput.value = '';
  }
}

function showLoader() {
  const loader = document.createElement('div');
  loader.className = 'loader';
  document.body.appendChild(loader);
  return loader;
}

function hideLoader(loader) {
  if (loader && loader.parentNode) {
    loader.parentNode.removeChild(loader);
  }
}

async function createPostWithGeolocation(text) {
  const loader = showLoader();
  try {
    const position = await getCurrentPosition();
    await addTextPost(text, position);
  } catch (error) {
    console.error('Geolocation error:', error);
    showCoordinatesModal(text);
  } finally {
    hideLoader(loader);
  }
}

function showCoordinatesModal(text) {
  if (modal) return;

  modal = document.createElement('div');
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
  setupModalEvents(text);
}

function setupModalEvents(text) {
  const confirmBtn = modal.querySelector('#confirm-btn');
  const cancelBtn = modal.querySelector('#cancel-btn');
  const input = modal.querySelector('#coordinates-input');

  const cleanup = () => {
    document.body.removeChild(modal);
    modal = null;
  };

  const handleConfirm = () => {
    try {
      const coords = parseCoordinates(input.value);
      addTextPost(text, coords);
      cleanup();
    } catch (error) {
      alert(error.message);
      input.focus();
    }
  };

  confirmBtn.addEventListener('click', handleConfirm);
  cancelBtn.addEventListener('click', cleanup);
  
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleConfirm();
  });
}

export function initApp() {
  initDOM();
  postInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') await handlePostCreation();
  });
}

document.addEventListener('DOMContentLoaded', initApp);