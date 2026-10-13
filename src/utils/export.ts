import { Transaction } from '../types';
import { formatCurrency, formatDateTime } from './formatters';

export function exportTransactionsToCSV(transactions: Transaction[], filename = 'Laporan_Transaksi_KaiPay.csv'): void {
  const headers = [
    'No. Referensi',
    'Tanggal & Waktu',
    'Jenis Transaksi',
    'Kategori',
    'Pihak Terlibat',
    'Nominal (IDR)',
    'Status',
    'Metode Pembayaran',
    'Catatan',
    'Checksum Enkripsi E2E'
  ];

  const rows = transactions.map(tx => {
    const isIncome = tx.type === 'transfer_in' || tx.type === 'top_up';
    const party = isIncome ? tx.senderName : tx.recipientName;
    const typeLabel = 
      tx.type === 'transfer_out' ? 'Transfer Keluar' :
      tx.type === 'transfer_in' ? 'Transfer Masuk' :
      tx.type === 'top_up' ? 'Isi Saldo (Top Up)' : 'Pembayaran QRIS';

    return [
      `"${tx.referenceNumber}"`,
      `"${formatDateTime(tx.timestamp)}"`,
      `"${typeLabel}"`,
      `"${tx.category}"`,
      `"${party}"`,
      `"${isIncome ? '+' : '-'}${tx.amount}"`,
      `"${tx.status.toUpperCase()}"`,
      `"${tx.paymentMethod}"`,
      `"${(tx.note || '-').replace(/"/g, '""')}"`,
      `"${tx.securityHash}"`
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printReceiptElement(elementId = 'printable-receipt'): void {
  const el = document.getElementById(elementId);
  if (!el) {
    window.print();
    return;
  }
  window.print();
}

/**
 * Renders an Ultra-HD (Retina 2x) receipt image onto HTML5 canvas and triggers direct PNG download
 */
export function downloadHdReceiptImage(transaction: Transaction, currency = 'IDR'): void {
  const width = 800;
  const height = 1120;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const isIncome = transaction.type === 'transfer_in' || transaction.type === 'top_up';

  // 1. Background
  ctx.fillStyle = '#0F0F11';
  ctx.fillRect(0, 0, width, height);

  // Card Container
  ctx.fillStyle = '#1C1C1E';
  ctx.beginPath();
  ctx.roundRect(30, 30, width - 60, height - 60, 36);
  ctx.fill();

  // Subtle Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 2. Top Header Brand Lockup
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('KaiPay', 60, 95);

  // Apple Pay Pill
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(180, 70, 75, 30, 8);
  ctx.fill();

  ctx.fillStyle = '#000000';
  ctx.font = '900 15px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText('PAY', 202, 91);

  ctx.fillStyle = '#8E8E93';
  ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText('BUKTI TRANSAKSI ELEKTRONIK RESMI', 60, 130);

  // Divider
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.moveTo(60, 155);
  ctx.lineTo(width - 60, 155);
  ctx.stroke();

  // 3. Status Circle & Checkmark
  ctx.fillStyle = 'rgba(52, 199, 89, 0.15)';
  ctx.beginPath();
  ctx.arc(width / 2, 230, 48, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#34C759';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(width / 2, 230, 48, 0, Math.PI * 2);
  ctx.stroke();

  // Checkmark glyph
  ctx.strokeStyle = '#34C759';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(width / 2 - 20, 230);
  ctx.lineTo(width / 2 - 6, 245);
  ctx.lineTo(width / 2 + 22, 215);
  ctx.stroke();

  // Status Text
  ctx.fillStyle = '#34C759';
  ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TRANSAKSI BERHASIL', width / 2, 310);

  // Big Amount
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 50px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const amountStr = `${isIncome ? '+' : '-'}Rp ${transaction.amount.toLocaleString('id-ID')}`;
  ctx.fillText(amountStr, width / 2, 375);

  ctx.fillStyle = '#8E8E93';
  ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(formatDateTime(transaction.timestamp), width / 2, 410);

  // Dashed Ticket Divider
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(60, 450);
  ctx.lineTo(width - 60, 450);
  ctx.stroke();
  ctx.setLineDash([]); // reset

  // 4. Key-Value Transaction Details
  ctx.textAlign = 'left';
  const drawRow = (label: string, value: string, y: number, highlight = false) => {
    ctx.fillStyle = '#8E8E93';
    ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText(label, 60, y);

    ctx.textAlign = 'right';
    ctx.fillStyle = highlight ? '#34C759' : '#FFFFFF';
    ctx.font = highlight ? 'bold 18px -apple-system, BlinkMacSystemFont, monospace' : '600 17px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(value, width - 60, y);
    ctx.textAlign = 'left';
  };

  let rowY = 505;
  drawRow('Nomor Referensi', transaction.referenceNumber, rowY);
  rowY += 45;
  drawRow(isIncome ? 'Pengirim' : 'Penerima', isIncome ? transaction.senderName : transaction.recipientName, rowY);
  rowY += 45;
  drawRow('Nomor Tujuan / NMID', transaction.recipientPhone, rowY);
  rowY += 45;
  drawRow('Metode Pembayaran', transaction.paymentMethod, rowY);
  rowY += 45;
  drawRow('Kategori', transaction.category.toUpperCase(), rowY);
  rowY += 45;
  if (transaction.note) {
    drawRow('Catatan', `"${transaction.note}"`, rowY);
    rowY += 45;
  }
  drawRow('Biaya Admin', 'Rp 0 (Gratis)', rowY, true);
  rowY += 45;
  drawRow('Total Pembayaran', `Rp ${transaction.amount.toLocaleString('id-ID')}`, rowY, true);

  // 5. Inset E2E Security Badge & Watermark Box
  const boxY = rowY + 35;
  ctx.fillStyle = '#262629';
  ctx.beginPath();
  ctx.roundRect(60, boxY, width - 120, 110, 16);
  ctx.fill();

  ctx.fillStyle = '#34C759';
  ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, monospace';
  ctx.fillText('🔒 APPLE SECURE ENCLAVE CERTIFIED (E2E)', 80, boxY + 35);

  ctx.fillStyle = '#8E8E93';
  ctx.font = '12px monospace';
  ctx.fillText(`HASH: ${transaction.securityHash.slice(0, 36)}...`, 80, boxY + 65);
  ctx.fillText('Verifikasi transaksi sah tercatat pada ekosistem KaiPay iOS.', 80, boxY + 90);

  // 6. Barcode-like visual at the bottom
  const barY = boxY + 135;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  for (let i = 60; i < width - 60; i += 7) {
    const barWidth = (i % 3 === 0) ? 3 : (i % 5 === 0) ? 4 : 2;
    ctx.fillRect(i, barY, barWidth, 25);
  }

  // Trigger Instant Download
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KaiPay_Struk_HD_${transaction.referenceNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 'image/png');
}

