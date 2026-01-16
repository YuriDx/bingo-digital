let lastWin = null;
let isAnimating = false;
let lastNumber = null;

function renderDisplay() {
  if (isAnimating) return;

  const stateStr = localStorage.getItem('bingo_state_v1');
  if (!stateStr) return;

  let state;
  try {
    state = JSON.parse(stateStr);
  } catch (e) {
    return;
  }

  const currentNumber = state.drawnNumbers[state.drawnNumbers.length - 1] || '—';

  // Só atualiza se o número mudou ou há vitória/verificação
  const verifying = localStorage.getItem('bingo_verifying');
  const win = localStorage.getItem('bingo_win');

  if (currentNumber === lastNumber && !verifying && !win) {
    return; // Nada mudou
  }
  lastNumber = currentNumber;

  const screen = document.querySelector('.display-screen');
  if (!screen) return;

  // Verificação pendente
  if (verifying) {
    try {
      const v = JSON.parse(verifying);
      if (Date.now() - v.timestamp < 30000) {
        screen.innerHTML = `
          <div style="font-size: 5rem; margin-bottom: 1rem;">🕵️‍♂️</div>
          <div style="font-size: 2.5rem;">Verificando cartela…</div>
          <div style="margin-top: 1rem; font-size: 1.2rem;">Aguarde confirmação.</div>
          <div style="margin-top: 2rem; font-size: 1.2rem;">Bingo Digital</div>
        `;
        document.body.style.backgroundColor = '#1a1a1a';
        document.body.style.color = 'white';
        return;
      } else {
        localStorage.removeItem('bingo_verifying');
      }
    } catch (e) {
      localStorage.removeItem('bingo_verifying');
    }
  }

  // Vitória confirmada
  if (win) {
    try {
      const w = JSON.parse(win);
      if (Date.now() - w.timestamp < 10000) {
        if (lastWin !== w.type) {
          showWinAnimation(w.type);
          lastWin = w.type;
        }
        return;
      } else {
        localStorage.removeItem('bingo_win');
        lastWin = null;
      }
    } catch (e) {
      localStorage.removeItem('bingo_win');
    }
  }

  // Renderiza números normais (sem animação)
  screen.innerHTML = `
    <div id="current-number" class="number-display-static">${currentNumber}</div>
    <div id="counter" style="font-size: 1.5rem; margin: 1rem 0; opacity: 0.8;"></div>
    <div id="history" class="history"></div>
    <div style="margin-top: 2rem; font-size: 1.2rem;">Bingo Digital</div>
  `;

  // Contador
  const range = JSON.parse(localStorage.getItem('bingo_range') || '{"min":1,"max":75}');
  const total = range.max - range.min + 1;
  document.getElementById('counter').textContent = `${state.drawnNumbers.length}/${total}`;

  // Histórico ordenado
  const historyEl = document.getElementById('history');
  if (historyEl) {
    const sortedNumbers = [...state.drawnNumbers].sort((a, b) => a - b);
    sortedNumbers.forEach(num => {
      const item = document.createElement('div');
      item.className = 'history-item';
      item.textContent = num;
      historyEl.appendChild(item);
    });
  }
}

function showWinAnimation(type) {
  isAnimating = true;
  lastWin = type;

  const screen = document.querySelector('.display-screen');
  if (!screen) return;

  const labels = {
    line: 'Horizontal',
    column: 'Vertical',
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
    <div style="margin-top: 2rem; font-size: 1.2rem;">Bingo Digital</div>
  `;

  document.body.style.backgroundColor = colors[type];
  document.body.style.color = 'white';

  setTimeout(() => {
    document.body.style.backgroundColor = '';
    document.body.style.color = '';
    isAnimating = false;
    lastNumber = null; // Força atualização após animação
    renderDisplay();
  }, 8000);
}

// Atualiza a cada 2 segundos (sem sobrecarregar)
setInterval(renderDisplay, 2000);
renderDisplay();