const { parseCoords } = require('./parseCoords');

describe('parseCoords', () => {
  test('парсит корректную строку с координатами', () => {
    expect(parseCoords('[51.50851, -0.12572]')).toEqual([51.50851, -0.12572]);
  });

  test('обрабатывает строку с лишними пробелами', () => {
    expect(parseCoords(' [ 55.7558,   37.6173 ] ')).toEqual([55.7558, 37.6173]);
  });

  test('возвращает null при некорректной строке', () => {
    expect(parseCoords('Москва')).toBeNull();
    expect(parseCoords('[abc, def]')).toBeNull();
    expect(parseCoords('[200, 400]')).toBeNull(); // вне диапазона
  });
});