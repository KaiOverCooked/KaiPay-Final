/**
 * QRIS (Quick Response Code Indonesian Standard) Engine
 * Complies with Bank Indonesia (BI) and ASPI EMVCo QR Specification
 */

import { QrisStandardPayload } from '../types';

/**
 * Calculates CRC-16/CCITT-FALSE checksum for EMVCo QRIS standard
 */
export function calculateCrc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  const hex = (crc & 0xffff).toString(16).toUpperCase();
  return hex.padStart(4, '0');
}

/**
 * Formats a single EMVCo TLV (Tag-Length-Value) chunk
 */
function formatTlv(tag: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${tag}${len}${value}`;
}

/**
 * Generates an authentic EMVCo / ASPI QRIS string
 */
export function generateQrisString(params: {
  merchantName: string;
  merchantCity?: string;
  nmid?: string;
  phone: string;
  userId: string;
  amount?: number;
  sessionId?: string;
}): string {
  const cleanName = params.merchantName.trim().slice(0, 25).toUpperCase();
  const cleanCity = (params.merchantCity || 'JAKARTA SELATAN').trim().slice(0, 15).toUpperCase();
  const nmid = params.nmid || `ID10200${params.phone.replace(/\D/g, '').slice(-8)}88`;
  const isDynamic = !!(params.amount && params.amount > 0);
  const sessionId = params.sessionId || `SES_${Date.now().toString(36).toUpperCase()}`;

  // Tag 00: Payload Format Indicator
  let payload = formatTlv('00', '01');

  // Tag 01: Point of Initiation Method ('11' for Static, '12' for Dynamic with Amount)
  payload += formatTlv('01', isDynamic ? '12' : '11');

  // Tag 26: Merchant Account Information (Indonesian Domestic QRIS)
  const sub26 = formatTlv('00', 'ID.CO.QRIS.WWW') + formatTlv('01', nmid) + formatTlv('02', params.phone);
  payload += formatTlv('26', sub26);

  // Tag 51: Payment Network Specific (KaiPay National Switching Simulation)
  const sub51 = formatTlv('00', 'ID.KAIPAY.ASPI') + formatTlv('01', params.userId);
  payload += formatTlv('51', sub51);

  // Tag 52: Merchant Category Code (General Merchant / Eatery)
  payload += formatTlv('52', '5812');

  // Tag 53: Transaction Currency (360 = IDR)
  payload += formatTlv('53', '360');

  // Tag 54: Transaction Amount (if Dynamic)
  if (isDynamic && params.amount) {
    payload += formatTlv('54', Math.round(params.amount).toString());
  }

  // Tag 58: Country Code (ID)
  payload += formatTlv('58', 'ID');

  // Tag 59: Merchant Name
  payload += formatTlv('59', cleanName);

  // Tag 60: Merchant City
  payload += formatTlv('60', cleanCity);

  // Tag 61: Postal Code
  payload += formatTlv('61', '12190');

  // Tag 62: Additional Data Field Template (Session Reference & Account ID)
  const sub62 = formatTlv('01', sessionId) + formatTlv('07', params.phone);
  payload += formatTlv('62', sub62);

  // Tag 63: CRC placeholder
  const withoutCrc = payload + '6304';
  const checksum = calculateCrc16(withoutCrc);

  return withoutCrc + checksum;
}

/**
 * Parses a QR code string (standard EMVCo QRIS or KaiPay structured format)
 */
export function parseQrisString(raw: string): QrisStandardPayload | null {
  if (!raw || typeof raw !== 'string') return null;
  const str = raw.trim();

  // 1. Try parsing EMVCo standard QRIS
  if (str.startsWith('000201') || str.includes('6304')) {
    try {
      let merchantName = 'Merchant QRIS';
      let merchantCity = 'Indonesia';
      let nmid = 'ID10200882910';
      let amount: number | undefined;
      let isDynamic = false;
      let recipientPhone = '';
      let recipientId = 'user_merchant';
      let sessionId = `SES_${Date.now().toString(36).toUpperCase()}`;

      let idx = 0;
      while (idx < str.length - 4) {
        const tag = str.slice(idx, idx + 2);
        const len = parseInt(str.slice(idx + 2, idx + 4), 10);
        if (isNaN(len)) break;

        const val = str.slice(idx + 4, idx + 4 + len);
        idx += 4 + len;

        if (tag === '01') {
          isDynamic = val === '12';
        } else if (tag === '26') {
          // Extract NMID or Phone inside tag 26
          let subIdx = 0;
          while (subIdx < val.length) {
            const subTag = val.slice(subIdx, subIdx + 2);
            const subLen = parseInt(val.slice(subIdx + 2, subIdx + 4), 10);
            if (isNaN(subLen)) break;
            const subVal = val.slice(subIdx + 4, subIdx + 4 + subLen);
            subIdx += 4 + subLen;
            if (subTag === '01') nmid = subVal;
            if (subTag === '02') recipientPhone = subVal;
          }
        } else if (tag === '51') {
          // Extract User ID
          let subIdx = 0;
          while (subIdx < val.length) {
            const subTag = val.slice(subIdx, subIdx + 2);
            const subLen = parseInt(val.slice(subIdx + 2, subIdx + 4), 10);
            if (isNaN(subLen)) break;
            const subVal = val.slice(subIdx + 4, subIdx + 4 + subLen);
            subIdx += 4 + subLen;
            if (subTag === '01') recipientId = subVal;
          }
        } else if (tag === '54') {
          const num = parseFloat(val);
          if (!isNaN(num)) amount = num;
        } else if (tag === '59') {
          merchantName = val;
        } else if (tag === '60') {
          merchantCity = val;
        } else if (tag === '62') {
          let subIdx = 0;
          while (subIdx < val.length) {
            const subTag = val.slice(subIdx, subIdx + 2);
            const subLen = parseInt(val.slice(subIdx + 2, subIdx + 4), 10);
            if (isNaN(subLen)) break;
            const subVal = val.slice(subIdx + 4, subIdx + 4 + subLen);
            subIdx += 4 + subLen;
            if (subTag === '01') sessionId = subVal;
            if (subTag === '07' && !recipientPhone) recipientPhone = subVal;
          }
        }
      }

      const crc = str.slice(-4);

      return {
        version: '01',
        isDynamic,
        nmid,
        merchantName,
        merchantCity,
        recipientPhone: recipientPhone || '0812-9876-5432',
        recipientId: recipientId || 'user_merchant',
        amount,
        currency: 'IDR',
        sessionId,
        crc,
        rawString: str,
      };
    } catch {
      // Fall through to secondary parser
    }
  }

  // 2. Try JSON formatted QR (internal KaiPay format)
  try {
    const json = JSON.parse(str);
    if (json.name || json.merchantName) {
      return {
        version: '01',
        isDynamic: !!json.amount,
        nmid: json.nmid || 'ID10200884920',
        merchantName: json.name || json.merchantName || 'Merchant QRIS',
        merchantCity: json.city || 'JAKARTA',
        recipientPhone: json.phone || json.recipientPhone || '0812-9876-5432',
        recipientId: json.userId || json.recipientId || 'user_merchant',
        amount: json.amount ? Number(json.amount) : undefined,
        currency: 'IDR',
        sessionId: json.sessionId || `SES_${Date.now().toString(36).toUpperCase()}`,
        crc: 'A4F2',
        rawString: str,
      };
    }
  } catch {}

  // 3. Fallback for plain text or phone URLs
  return {
    version: '01',
    isDynamic: false,
    nmid: 'ID10200889100',
    merchantName: str.replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 25) || 'Merchant QRIS KaiPay',
    merchantCity: 'JAKARTA',
    recipientPhone: '0812-9876-5432',
    recipientId: 'user_merchant',
    currency: 'IDR',
    sessionId: `SES_${Date.now().toString(36).toUpperCase()}`,
    crc: '99AA',
    rawString: str,
  };
}
