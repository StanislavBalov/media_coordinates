// Хранилище постов
const posts = [];

// Константы для типов постов
const POST_TYPES = {
  TEXT: 'text',
  AUDIO: 'audio',
  VIDEO: 'video'
};

/**
 * Добавляет текстовый пост в ленту
 * @param {string} text - Текст поста
 * @param {Object} coords - Координаты {lat, lng}
 */
export function addTextPost(text, coords) {
  addPost({
    type: POST_TYPES.TEXT,
    text,
    coords
  });
}

/**
 * Добавляет аудио пост в ленту
 * @param {string} audioUrl - URL аудио
 * @param {Object} coords - Координаты {lat, lng}
 */
export function addAudioPost(audioUrl, coords) {
  addPost({
    type: POST_TYPES.AUDIO,
    audioUrl,
    coords
  });
}

/**
 * Добавляет видео пост в ленту
 * @param {string} videoUrl - URL видео
 * @param {Object} coords - Координаты {lat, lng}
 */
export function addVideoPost(videoUrl, coords) {
  addPost({
    type: POST_TYPES.VIDEO,
    videoUrl,
    coords
  });
}

/**
 * Внутренняя функция для добавления поста
 * @param {Object} postData - Данные поста
 */
function addPost(postData) {
  const post = {
    ...postData,
    id: Date.now(),
    date: new Date()
  };
  
  posts.unshift(post);
  renderTimeline();
  saveToLocalStorage();
}

/**
 * Рендерит ленту постов
 */
function renderTimeline() {
  const timeline = document.getElementById('timeline');
  if (!timeline) return;
  
  timeline.innerHTML = '';
  
  posts.forEach(post => {
    const postElement = createPostElement(post);
    timeline.appendChild(postElement);
  });
}

/**
 * Создает DOM-элемент поста
 * @param {Object} post - Данные поста
 * @returns {HTMLElement} Элемент поста
 */
function createPostElement(post) {
  const postElement = document.createElement('div');
  postElement.className = 'post';
  postElement.dataset.id = post.id;
  
  const header = createPostHeader(post);
  const content = createPostContent(post);
  
  postElement.appendChild(header);
  postElement.appendChild(content);
  
  return postElement;
}

/**
 * Создает шапку поста
 */
function createPostHeader(post) {
  const header = document.createElement('div');
  header.className = 'post-header';
  
  header.innerHTML = `
    <span class="post-date">${formatDate(post.date)}</span>
    <span class="post-coords">[${post.coords.lat.toFixed(6)}, ${post.coords.lng.toFixed(6)}]</span>
    <button class="post-delete" data-id="${post.id}">×</button>
  `;
  
  // Добавляем обработчик удаления
  header.querySelector('.post-delete').addEventListener('click', () => {
    deletePost(post.id);
  });
  
  return header;
}

/**
 * Создает содержимое поста
 */
function createPostContent(post) {
  const content = document.createElement('div');
  content.className = 'post-content';
  
  switch (post.type) {
    case POST_TYPES.AUDIO:
      content.innerHTML = `
        <audio controls src="${post.audioUrl}"></audio>
        <p>Аудио запись</p>
      `;
      break;
      
    case POST_TYPES.VIDEO:
      content.innerHTML = `
        <video controls src="${post.videoUrl}" width="100%"></video>
        <p>Видео запись</p>
      `;
      break;
      
    default: // TEXT
      content.textContent = post.text;
  }
  
  return content;
}

/**
 * Удаляет пост по ID
 */
function deletePost(postId) {
  const index = posts.findIndex(post => post.id === postId);
  if (index !== -1) {
    posts.splice(index, 1);
    renderTimeline();
    saveToLocalStorage();
  }
}

/**
 * Форматирует дату
 */
function formatDate(date) {
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Сохраняет посты в localStorage
 */
function saveToLocalStorage() {
  localStorage.setItem('timelinePosts', JSON.stringify(posts));
}

/**
 * Загружает посты из localStorage
 */
function loadFromLocalStorage() {
  const savedPosts = localStorage.getItem('timelinePosts');
  if (savedPosts) {
    try {
      const parsed = JSON.parse(savedPosts);
      if (Array.isArray(parsed)) {
        posts.push(...parsed);
        renderTimeline();
      }
    } catch (e) {
      console.error('Ошибка загрузки постов:', e);
    }
  }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
});