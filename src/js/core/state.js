const STORAGE_KEY = 'bingo_state_v1';

function getShuffledNumbers(min = 1, max = 75) {
  const count = max - min + 1;
  if (count <= 0) return [];
  const numbers = Array.from({ length: count }, (_, i) => i + min);
  return numbers.sort(() => Math.random() - 0.5);
}

export function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.warn('Estado corrompido. Reiniciando.');
    }
  }
  return resetGame();
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetGame() {
  const rangeStr = localStorage.getItem('bingo_range');
  const { min = 1, max = 75 } = rangeStr ? JSON.parse(rangeStr) : {};

  const newState = {
    drawnNumbers: [],
    availableNumbers: getShuffledNumbers(min, max),
    cards: []
  };
  saveState(newState);
  return newState;
}