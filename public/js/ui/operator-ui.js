import { drawNextNumber } from '../core/bingo.js';
import { loadState, saveState, resetGame } from '../core/state.js';

// DOM Elements
const drawBtn = document.getElementById('draw-btn');
const resetBtn = document.getElementById('reset-btn');
const toggleThemeBtn = document.getElementById('toggle-theme');
const toggleSoundBtn = document.getElementById('toggle-sound');
const currentEl = document.getElementById('current');
const historyListEl = document.getElementById('history-list');
const counterEl = document.getElementById('counter');

// Configuração de faixa
const minInput = document.getElementById('min-num');
const maxInput = document.getElementById('max-num');
const applyRangeBtn = document.getElementById('apply-range');

// Botões de vitória
const bingoLineBtn = document.getElementById('bingo-line');
const bingoColumnBtn = document.getElementById('bingo-column');
const bingoFullBtn = document.getElementById('bingo-full');

let state = loadState();
let soundEnabled = localStorage.getItem('sound_enabled') !== 'false';

// Web Audio API
let audioContext;
function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}
function playBeep(frequency = 800, duration = 0.2) {
  if (!soundEnabled) return;
  try {
    initAudio();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
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
  [600, 800, 1000].forEach((freq, i) => {
    setTimeout(() => playBeep(freq, 0.15), i * 150);
  });
}

// Inicializa som
toggleSoundBtn.textContent = `🔊 Som: ${soundEnabled ? 'LIGADO' : 'DESLIGADO'}`;
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

toggleThemeBtn.addEventListener('click', toggleTheme);

toggleSoundBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  localStorage.setItem('sound_enabled', String(soundEnabled));
  toggleSoundBtn.textContent = `🔊 Som: ${soundEnabled ? 'LIGADO' : 'DESLIGADO'}`;
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
  // Sinaliza verificação pendente
  localStorage.setItem('bingo_verifying', JSON.stringify({
    type,
    timestamp: Date.now()
  }));
  
  currentEl.innerHTML = `
    <div style="font size: 2rem; margin: 1rem 0;">🕵️‍♂️ Verificando cartela…</div>
    <div>Pressione ENTER para confirmar ou ESC para cancelar.</div>
  `;
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
  // Só atualiza se não estiver em modo verificação
  if (!localStorage.getItem('bingo_verifying')) {
    currentEl.textContent = last !== undefined ? last : 'Aguardando sorteio...';
  }

  // Contador
  const range = JSON.parse(localStorage.getItem('bingo_range') || '{"min":1,"max":75}');
  const total = range.max - range.min + 1;
  counterEl.textContent = `${state.drawnNumbers.length}/${total} números sorteados`;

  // Histórico ordenado
  historyListEl.innerHTML = '';
  const sortedNumbers = [...state.drawnNumbers].sort((a, b) => a - b);
  sortedNumbers.forEach(num => {
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
  // Sorteio
  if (e.code === 'Space' || e.key === ' ') {
    e.preventDefault();
    drawBtn.click();
    return;
  }

  // Vitórias
  if (e.key.toLowerCase() === 'h') bingoLineBtn.click();
  if (e.key.toLowerCase() === 'v') bingoColumnBtn.click();
  if (e.key.toLowerCase() === 'f') bingoFullBtn.click();
  if (e.key.toLowerCase() === 'r') resetBtn.click();

  // Confirmação/cancelamento de vitória
  if (e.key === 'Enter') {
    const verifying = localStorage.getItem('bingo_verifying');
    if (verifying) {
      try {
        const data = JSON.parse(verifying);
        localStorage.setItem('bingo_win', JSON.stringify({
          type: data.type,
          timestamp: Date.now()
        }));
        playWinSound();
        localStorage.removeItem('bingo_verifying');
        render(); // Volta ao estado normal
      } catch (err) {
        localStorage.removeItem('bingo_verifying');
      }
    }
  } else if (e.key === 'Escape') {
    localStorage.removeItem('bingo_verifying');
    render(); // Volta ao estado normal
  }
});

// Inicializa
render();