import { jest } from '@jest/globals';
import { parseCoordinates, getCurrentPosition, isValidCoordinates } from '../src/scripts/geolocation.js';

describe('geolocation module', () => {
  describe('parseCoordinates()', () => {
    test('корректно парсит координаты с пробелом после запятой', () => {
      const result = parseCoordinates('51.50851, -0.12572');
      expect(result).toEqual({ lat: 51.50851, lng: -0.12572 });
    });
    
    test('корректно парсит координаты без пробела после запятой', () => {
      const result = parseCoordinates('51.50851,-0.12572');
      expect(result).toEqual({ lat: 51.50851, lng: -0.12572 });
    });
    
    test('корректно парсит координаты в квадратных скобках', () => {
      const result = parseCoordinates('[51.50851, -0.12572]');
      expect(result).toEqual({ lat: 51.50851, lng: -0.12572 });
    });
    
    test('корректно парсит координаты с разными разделителями', () => {
      expect(parseCoordinates('51.50851, -0.12572')).toEqual({ lat: 51.50851, lng: -0.12572 });
      expect(parseCoordinates('51.50851,-0.12572')).toEqual({ lat: 51.50851, lng: -0.12572 });
      expect(parseCoordinates(' 51.50851 , -0.12572 ')).toEqual({ lat: 51.50851, lng: -0.12572 });
    });
    
    test('выбрасывает ошибку при неверном формате', () => {
  expect(() => parseCoordinates('51.50851 -0.12572')).toThrow('Неверный формат координат');
  expect(() => parseCoordinates('51.50851')).toThrow('Неверный формат координат');
  expect(() => parseCoordinates('текст')).toThrow('Неверный формат координат');
  expect(() => parseCoordinates('')).toThrow('Неверный формат координат');
});
    
    test('выбрасывает ошибку при нечисловых координатах', () => {
      expect(() => parseCoordinates('abc, def')).toThrow('Координаты должны быть числами');
    });
    
    test('выбрасывает ошибку при координатах вне диапазона', () => {
      expect(() => parseCoordinates('91.00000, 0.00000')).toThrow('Широта должна быть между -90 и 90');
      expect(() => parseCoordinates('0.00000, 181.00000')).toThrow('Долгота должна быть между -180 и 180');
    });

    test('выбрасывает ошибку при пустой строке', () => {
      expect(() => parseCoordinates('')).toThrow('Неверный формат координат');
    });
  });

describe('getCurrentPosition()', () => {
  let originalGeolocation;

  beforeAll(() => {
    // Сохраняем оригинальный navigator.geolocation
    originalGeolocation = global.navigator.geolocation;
  });

  beforeEach(() => {
    // Мокаем geolocation перед каждым тестом
    global.navigator.geolocation = {
      getCurrentPosition: jest.fn()
    };
  });

  afterAll(() => {
    // Восстанавливаем оригинальный geolocation
    global.navigator.geolocation = originalGeolocation;
  });

  test('возвращает Promise', () => {
    const result = getCurrentPosition();
    expect(result).toBeInstanceOf(Promise);
  });

  test('отклоняет промис если геолокация не поддерживается', async () => {
    // Эмулируем отсутствие geolocation
    delete global.navigator.geolocation;
    
    await expect(getCurrentPosition()).rejects.toThrow(
      'Geolocation не поддерживается вашим браузером'
    );
  });

  test('корректно обрабатывает успешный результат', async () => {
    // Мокаем успешный ответ
    const mockPosition = {
      coords: {
        latitude: 51.50851,
        longitude: -0.12572,
        accuracy: 100
      }
    };
    
    global.navigator.geolocation.getCurrentPosition.mockImplementation((success) => {
      success(mockPosition);
    });
    
    await expect(getCurrentPosition()).resolves.toEqual({
      lat: 51.50851,
      lng: -0.12572,
      accuracy: 100
    });
  });

  test('корректно обрабатывает ошибки', async () => {
  const testCases = [
    { code: 1, expectedError: 'Пользователь отказал в доступе' },
    { code: 2, expectedError: 'Информация о местоположении недоступна' },
    { code: 3, expectedError: 'Время ожидания геолокации истекло' },
    { code: 999, expectedError: 'Произошла неизвестная ошибка' }
  ];
  
  for (const { code, expectedError } of testCases) {
    global.navigator.geolocation.getCurrentPosition.mockImplementationOnce(
      (_, error) => error({ code })
    );
    
    await expect(getCurrentPosition()).rejects.toThrow(expectedError);
  }
});

  describe('isValidCoordinates()', () => {
    test('возвращает true для валидных координат', () => {
      expect(isValidCoordinates({ lat: 45.123, lng: -122.456 })).toBe(true);
      expect(isValidCoordinates({ lat: 0, lng: 0 })).toBe(true);
      expect(isValidCoordinates({ lat: 90, lng: 180 })).toBe(true);
      expect(isValidCoordinates({ lat: -90, lng: -180 })).toBe(true);
    });
    
    test('возвращает false для невалидных координат', () => {
      expect(isValidCoordinates({ lat: 91, lng: 0 })).toBe(false);
      expect(isValidCoordinates({ lat: 0, lng: 181 })).toBe(false);
      expect(isValidCoordinates({ lat: 'abc', lng: 0 })).toBe(false);
      expect(isValidCoordinates({})).toBe(false);
      expect(isValidCoordinates(null)).toBe(false);
      expect(isValidCoordinates(undefined)).toBe(false);
    });
  });
});