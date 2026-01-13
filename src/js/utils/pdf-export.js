// src/js/utils/pdf-export.js
// jsPDF é carregado globalmente via <script> no HTML

export function exportCardsToPDF(cards) {
  // Acessa jsPDF como variável global
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const cardWidth = (pageWidth - 3 * margin) / 2;
  const cardHeight = cardWidth;

  doc.setFontSize(12);
  doc.text('Cartelas de Bingo - Martins Labs', pageWidth / 2, 15, { align: 'center' });

  cards.forEach((card, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2) % 2;
    if (index > 0 && index % 4 === 0) {
      doc.addPage();
    }

    const xOffset = margin + col * (cardWidth + margin);
    const yOffset = 25 + row * (cardHeight + margin);
    doc.rect(xOffset, yOffset, cardWidth, cardHeight);

    const letters = ['B', 'I', 'N', 'G', 'O'];
    const cellWidth = cardWidth / 5;
    const cellHeight = cardHeight / 5;

    letters.forEach((letter, i) => {
      doc.setFontSize(10);
      doc.text(letter, xOffset + i * cellWidth + cellWidth / 2, yOffset + 8, { align: 'center' });
    });

    doc.setFontSize(14);
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const value = card[c][r];
        const x = xOffset + c * cellWidth + cellWidth / 2;
        const y = yOffset + 15 + r * cellHeight + cellHeight / 2;
        doc.text(String(value), x, y, { align: 'center' });
      }
    }
  });

  doc.save('cartelas-bingo.pdf');
}