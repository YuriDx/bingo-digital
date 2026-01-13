import { drawNextNumber, generateCard } from '../core/bingo.js';
import { loadState, saveState, resetGame } from '../core/state.js';
import { exportCardsToPDF } from '../utils/pdf-export.js';

// Web Audio API - inicialização
let audioContext;
let soundEnabled = localStorage.getItem('sound_enabled') !== 'false';

function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playBeep(frequency = 800, duration = 0.2, type = 'sine') {
  if (!soundEnabled) return;
  try {
    initAudio();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (e) {
    console.warn('Áudio não disponível:', e);
  }
}

function playWinSound() {
  if (!soundEnabled) return;
  // Sequência rápida de tons (fanfarra simples)
  [600, 800, 1000].forEach((freq, i) => {
    setTimeout(() => playBeep(freq, 0.15, 'square'), i * 150);
  });
}

// DOM Elements
const drawBtn = document.getElementById('draw-btn');
const resetBtn = document.getElementById('reset-btn');
const printBtn = document.getElementById('print-cards');
const toggleThemeBtn = document.getElementById('toggle-theme');
const toggleSoundBtn = document.getElementById('toggle-sound');
const currentEl = document.getElementById('current');
const historyListEl = document.getElementById('history-list');

// Configuração de faixa
const minInput = document.getElementById('min-num');
const maxInput = document.getElementById('max-num');
const applyRangeBtn = document.getElementById('apply-range');

// Botões de vitória
const bingoLineBtn = document.getElementById('bingo-line');
const bingoColumnBtn = document.getElementById('bingo-column');
const bingoFullBtn = document.getElementById('bingo-full');

let state = loadState();

// Inicializa som
toggleSoundBtn.textContent = `Som: ${soundEnabled ? 'LIGADO' : 'DESLIGADO'}`;
toggleSoundBtn.style.background = soundEnabled ? '#9c27b0' : '#757575';

// Tema
const isDark = localStorage.getItem('theme') === 'dark';
if (isDark) document.body.classList.add('dark-mode');
toggleThemeBtn.textContent = isDark ? 'Modo Claro' : 'Modo Escuro';

// Carrega faixa salva
const savedRange = JSON.parse(localStorage.getItem('bingo_range') || '{"min":1,"max":75}');
minInput.value = savedRange.min;
maxInput.value = savedRange.max;

// Eventos
drawBtn.addEventListener('click', () => {
  drawNumber();
  playBeep();
});

resetBtn.addEventListener('click', () => {
  if (confirm('Reiniciar o jogo? Todos os números serão apagados.')) {
    state = resetGame();
    render();
  }
});

printBtn.addEventListener('click', () => {
  const cards = Array.from({ length: 4 }, generateCard);
  exportCardsToPDF(cards);
});

toggleThemeBtn.addEventListener('click', toggleTheme);

toggleSoundBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  localStorage.setItem('sound_enabled', String(soundEnabled));
  toggleSoundBtn.textContent = `Som: ${soundEnabled ? 'LIGADO' : 'DESLIGADO'}`;
  toggleSoundBtn.style.background = soundEnabled ? '#9c27b0' : '#757575';
});

// Faixa numérica
applyRangeBtn.addEventListener('click', () => {
  const min = parseInt(minInput.value) || 1;
  const max = parseInt(maxInput.value) || 75;
  if (max <= min) {
    alert('O número final deve ser maior que o inicial.');
    return;
  }
  localStorage.setItem('bingo_range', JSON.stringify({ min, max }));
  alert(`Faixa atualizada: ${min} a ${max}. Reinicie o jogo para aplicar.`);
});

// Vitórias
bingoLineBtn.addEventListener('click', () => triggerWin('line'));
bingoColumnBtn.addEventListener('click', () => triggerWin('column'));
bingoFullBtn.addEventListener('click', () => triggerWin('full'));

function triggerWin(type) {
  localStorage.setItem('bingo_win', JSON.stringify({
    type,
    timestamp: Date.now()
  }));
  playWinSound();
}

function drawNumber() {
  const next = drawNextNumber(state.availableNumbers);
  if (next === null) {
    alert('Todos os números já foram sorteados!');
    return;
  }
  state.drawnNumbers.push(next);
  saveState(state);
  render();
}

function render() {
  const last = state.drawnNumbers[state.drawnNumbers.length - 1];
  currentEl.textContent = last !== undefined ? last : 'Aguardando sorteio...';

  historyListEl.innerHTML = '';
  state.drawnNumbers.slice().reverse().forEach(num => {
    const el = document.createElement('span');
    el.className = 'history-item';
    el.textContent = num;
    historyListEl.appendChild(el);
  });
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isNowDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('theme', isNowDark ? 'dark' : 'light');
  toggleThemeBtn.textContent = isNowDark ? 'Modo Claro' : 'Modo Escuro';
}

// Atalhos de teclado
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.key === ' ') {
    e.preventDefault();
    drawBtn.click();
  }
  if (e.key.toLowerCase() === 'h') bingoLineBtn.click();
  if (e.key.toLowerCase() === 'v') bingoColumnBtn.click();
  if (e.key.toLowerCase() === 'f') bingoFullBtn.click();
});

// Inicializa
render();