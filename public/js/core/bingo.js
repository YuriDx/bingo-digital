// Gera uma cartela de bingo 5x5 (75 números)
export function generateCard() {
  const card = [];
  const ranges = [
    [1, 15],   // B
    [16, 30],  // I
    [31, 45],  // N
    [46, 60],  // G
    [61, 75]   // O
  ];

  for (let col = 0; col < 5; col++) {
    const [min, max] = ranges[col];
    const numbers = new Set();
    while (numbers.size < 5) {
      numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    const colArray = Array.from(numbers);
    if (col === 2) colArray[2] = 'FREE'; // centro é grátis
    card.push(colArray);
  }
  return card;
}

// Embaralha todos os números de 1 a 75
export function getShuffledNumbers() {
  const numbers = Array.from({ length: 75 }, (_, i) => i + 1);
  return numbers.sort(() => Math.random() - 0.5);
}

// Sorteia próximo número
export function drawNextNumber(available) {
  return available.length > 0 ? available.shift() : null;
}