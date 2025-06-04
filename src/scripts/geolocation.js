// Константы для валидации координат
const MAX_LATITUDE = 90;
const MIN_LATITUDE = -90;
const MAX_LONGITUDE = 180;
const MIN_LONGITUDE = -180;

/**
 * Парсит строку с координатами и возвращает объект {lat, lng}
 * @param {string} input - Строка с координатами (форматы: "51.50851,-0.12572", "[51.50851, -0.12572]")
 * @returns {Object} Объект с координатами {lat: number, lng: number}
 * @throws {Error} Если формат неверный или координаты вне допустимого диапазона
 */
export function parseCoordinates(input) {
  if (typeof input !== 'string') {
    throw new Error('Координаты должны быть строкой');
  }

  // Удаляем все пробелы и квадратные скобки
  const cleanedInput = input.replace(/\s*\[\s*|\s*\]\s*/g, '');
  
  // Разделяем по запятой, учитывая возможные пробелы
  const parts = cleanedInput.split(/\s*,\s*/);
  
  if (parts.length !== 2) {
    throw new Error('Неверный формат координат. Используйте "широта,долгота" или "широта, долгота"');
  }
  
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  
  if (isNaN(lat) || isNaN(lng)) {
    throw new Error('Координаты должны быть числами');
  }
  
  if (lat < MIN_LATITUDE || lat > MAX_LATITUDE) {
    throw new Error(`Широта должна быть между ${MIN_LATITUDE} и ${MAX_LATITUDE}`);
  }
  
  if (lng < MIN_LONGITUDE || lng > MAX_LONGITUDE) {
    throw new Error(`Долгота должна быть между ${MIN_LONGITUDE} и ${MAX_LONGITUDE}`);
  }
  
  return { 
    lat: parseFloat(lat.toFixed(6)), // Округляем до 6 знаков после запятой
    lng: parseFloat(lng.toFixed(6)) 
  };
}

/**
 * Получает текущую геопозицию пользователя
 * @returns {Promise<Object>} Promise, который разрешается объектом {lat: number, lng: number}
 * @throws {Error} Если геолокация не поддерживается или пользователь отказал в доступе
 */
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation не поддерживается вашим браузером'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      position => resolve({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      }),
      error => {
        let errorMessage;
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = 'Пользователь отказал в доступе';
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage = 'Информация о местоположении недоступна';
            break;
          case 3: // TIMEOUT
            errorMessage = 'Время ожидания геолокации истекло';
            break;
          default:
            errorMessage = 'Произошла неизвестная ошибка';
        }
        reject(new Error(errorMessage));
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  });
}

/**
 * Вспомогательная функция для проверки координат
 */
export function isValidCoordinates(coords) {
  try {
    const { lat, lng } = coords;
    return (lat >= MIN_LATITUDE && lat <= MAX_LATITUDE) && 
           (lng >= MIN_LONGITUDE && lng <= MAX_LONGITUDE);
  } catch {
    return false;
  }
}
try {
  // Автоматическое получение координат
  const position = await getCurrentPosition();
  console.log(position);
  
  // Ручной ввод координат
  const manualCoords = parseCoordinates("51.50851, -0.12572");
  console.log(manualCoords);
  
  // Проверка координат
  if (isValidCoordinates(manualCoords)) {
    console.log("Координаты валидны");
  }
} catch (error) {
  console.error("Ошибка:", error.message);
}