import { CurrencyCode, CURRENCY_RATES } from '../types';

export function formatCurrency(amountInIdr: number, currency: CurrencyCode = 'IDR'): string {
  const rateInfo = CURRENCY_RATES[currency] || CURRENCY_RATES.IDR;
  const converted = amountInIdr / rateInfo.rateToIdr;

  if (currency === 'IDR') {
    return `Rp ${Math.round(converted).toLocaleString('id-ID')}`;
  } else if (currency === 'USD') {
    return `$ ${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (currency === 'EUR') {
    return `€ ${converted.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (currency === 'SGD') {
    return `S$ ${converted.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (currency === 'JPY') {
    return `¥ ${Math.round(converted).toLocaleString('ja-JP')}`;
  }

  return `Rp ${Math.round(converted).toLocaleString('id-ID')}`;
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
}

export function formatDateRelative(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  
  const isToday = 
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = 
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (isToday) {
    return `Hari ini, ${hours}:${minutes}`;
  } else if (isYesterday) {
    return `Kemarin, ${hours}:${minutes}`;
  } else {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${date.getDate()} ${months[date.getMonth()]}, ${hours}:${minutes}`;
  }
}

export function generateReferenceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(100000 + Math.random() * 900000);
  return `KP-${year}${month}${day}-${random}`;
}

export function maskPhoneNumber(phone: string): string {
  if (phone.length <= 6) return phone;
  return phone.slice(0, 4) + ' •••• ' + phone.slice(-3);
}
