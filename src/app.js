const map = document.getElementById('map');

// Пример координат (в процентах, можно заменить на координаты в пикселях)
const points = [
  { x: 30, y: 40, color: 'red' },
  { x: 60, y: 70, color: 'blue' }
];

points.forEach(({ x, y, color }) => {
  const dot = document.createElement('div');
  dot.classList.add('dot');
  dot.style.left = `${x}%`;
  dot.style.top = `${y}%`;
  dot.style.backgroundColor = color;
  map.appendChild(dot);
});