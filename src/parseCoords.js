function parseCoords(input) {
  const trimmed = input.trim();

  // Убираем все пробелы между скобками и числами
  const cleaned = trimmed.replace(/\s+/g, '');

  const match = cleaned.match(/^\[(\-?\d+(\.\d+)?),(\-?\d+(\.\d+)?)\]$/);
  if (!match) return null;

  const lat = parseFloat(match[1]);
  const lon = parseFloat(match[3]);

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;

  return [lat, lon];
}

module.exports = { parseCoords };