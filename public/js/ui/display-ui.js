let lastWin = null;

function renderDisplay() {
  const stateStr = localStorage.getItem('bingo_state_v1');
  if (!stateStr) return;

  let state;
  try {
    state = JSON.parse(stateStr);
  } catch (e) {
    return;
  }

  // Verifica se há vitória ativa
  const winStr = localStorage.getItem('bingo_win');
  if (winStr) {
    try {
      const win = JSON.parse(winStr);
      const now = Date.now();
      if (now - win.timestamp < 10000) {
        if (lastWin !== win.type) {
          showWinAnimation(win.type);
          lastWin = win.type;
        }
        return; // não mostra números durante vitória
      } else {
        localStorage.removeItem('bingo_win');
        lastWin = null;
      }
    } catch (e) {
      localStorage.removeItem('bingo_win');
    }
  }

  // Mostra números normais
  const currentNumber = state.drawnNumbers[state.drawnNumbers.length - 1] || '—';
  document.getElementById('current-number').textContent = currentNumber;

  const historyEl = document.getElementById('history');
  historyEl.innerHTML = '';
  state.drawnNumbers.forEach(num => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.textContent = num;
    historyEl.appendChild(item);
  });
}

function showWinAnimation(type) {
  const screen = document.querySelector('.display-screen');
  if (!screen) return;

  const labels = {
    line: 'Horizontal!',
    column: 'Vertical!',
    full: 'Cartela Cheia!'
  };

  const colors = {
    line: '#0f9d58',
    column: '#4285f4',
    full: '#db4437'
  };

  screen.innerHTML = `
    <div style="font-size: 5rem; font-weight: bold; margin-bottom: 1rem; text-shadow: 0 0 10px rgba(0,0,0,0.3);">
      🎉 BINGO!
    </div>
    <div style="font-size: 2.5rem; text-transform: uppercase; text-shadow: 0 0 8px rgba(0,0,0,0.3);">
      ${labels[type] || 'Vitória!'}
    </div>
    <div style="margin-top: 2rem;">
      <img src="../src/assets/logo.svg" height="40">
    </div>
  `;

  document.body.style.backgroundColor = colors[type];
  document.body.style.color = 'white';

  // Restaura após 8 segundos
  setTimeout(() => {
    document.body.style.backgroundColor = '';
    document.body.style.color = '';
    renderDisplay();
  }, 8000);
}

// Atualiza a cada 500ms
setInterval(renderDisplay, 500);
renderDisplay();