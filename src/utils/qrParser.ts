export interface ScannedQrPayload {
  name: string;
  phone: string;
  amount?: number;
  note?: string;
  raw?: string;
}

/**
 * Parses raw QR string into structured payment payload
 * Supports:
 * - KaiPay URL schema (https://kaipay.me/pay/...)
 * - JSON payload schema
 * - Official Indonesian QRIS EMVCo TLV specification (000201...)
 * - Plain phone number or contact string
 */
export function parseQrData(raw: string): ScannedQrPayload {
  const clean = raw.trim();

  // 1. Check if JSON
  if (clean.startsWith('{') && clean.endsWith('}')) {
    try {
      const parsed = JSON.parse(clean);
      return {
        name: parsed.name || parsed.merchant || parsed.merchantName || 'QRIS Merchant',
        phone: parsed.phone || parsed.nmid || parsed.merchantId || `QRIS-${Date.now().toString().slice(-6)}`,
        amount: typeof parsed.amount === 'number' ? parsed.amount : (parsed.amount ? parseInt(parsed.amount, 10) : undefined),
        note: parsed.note || parsed.description || 'Pembayaran QRIS',
        raw: clean,
      };
    } catch {
      // Continue to next parsers
    }
  }

  // 2. Check if KaiPay or payment URL
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    try {
      const url = new URL(clean);
      // Path like /pay/08123456789
      const pathParts = url.pathname.split('/').filter(Boolean);
      const phoneOrId = pathParts[pathParts.length - 1] || 'QRIS-URL';
      const amtParam = url.searchParams.get('amt') || url.searchParams.get('amount');
      const noteParam = url.searchParams.get('note') || url.searchParams.get('desc');
      const nameParam = url.searchParams.get('name') || url.searchParams.get('merchant');

      return {
        name: nameParam || (pathParts.includes('pay') ? `Pengguna (${phoneOrId})` : url.hostname),
        phone: phoneOrId,
        amount: amtParam ? parseInt(amtParam, 10) : undefined,
        note: noteParam ? decodeURIComponent(noteParam) : 'Transfer via Tautan KaiPay',
        raw: clean,
      };
    } catch {
      // Continue
    }
  }

  // 3. Check Indonesian QRIS standard (EMVCo Tag-Length-Value format starting with 000201)
  if (clean.startsWith('000201') || clean.includes('ID.CO.QRIS') || clean.includes('A000000602')) {
    const emv = parseEmvCoTlv(clean);
    return {
      name: emv.merchantName || 'QRIS Merchant Nasional',
      phone: emv.nmid || emv.merchantPan || `QRIS-NMID-${Math.floor(100000 + Math.random() * 900000)}`,
      amount: emv.amount,
      note: emv.additionalData || 'Pembayaran QRIS Standar BI',
      raw: clean,
    };
  }

  // 4. Check Indonesian phone format (08... or +62...)
  const phoneRegex = /^(\+62|62|08)[0-9]{8,13}$/;
  if (phoneRegex.test(clean.replace(/[-\s]/g, ''))) {
    return {
      name: `Rekan (${clean})`,
      phone: clean,
      note: 'Transfer Kontak KaiPay',
      raw: clean,
    };
  }

  // 5. Default generic scan
  return {
    name: clean.length > 28 ? `${clean.slice(0, 25)}...` : clean,
    phone: `QR-${Math.floor(100000 + Math.random() * 900000)}`,
    note: 'Pemindaian Kode QR',
    raw: clean,
  };
}

/**
 * Parses EMVCo Tag-Length-Value (TLV) strings used in Bank Indonesia QRIS
 */
function parseEmvCoTlv(payload: string): {
  merchantName?: string;
  merchantCity?: string;
  amount?: number;
  nmid?: string;
  merchantPan?: string;
  additionalData?: string;
} {
  const result: ReturnType<typeof parseEmvCoTlv> = {};
  let i = 0;

  while (i < payload.length - 4) {
    const tag = payload.substring(i, i + 2);
    const length = parseInt(payload.substring(i + 2, i + 4), 10);
    if (isNaN(length) || length <= 0) {
      i += 2;
      continue;
    }

    const valueStart = i + 4;
    const valueEnd = valueStart + length;
    if (valueEnd > payload.length) break;

    const value = payload.substring(valueStart, valueEnd);

    // Tag 59: Merchant Name
    if (tag === '59') {
      result.merchantName = value;
    }
    // Tag 60: Merchant City
    else if (tag === '60') {
      result.merchantCity = value;
    }
    // Tag 54: Transaction Amount
    else if (tag === '54') {
      const amt = parseFloat(value);
      if (!isNaN(amt)) result.amount = Math.round(amt);
    }
    // Tag 26 to 51: Merchant Account Information
    else if ((parseInt(tag, 10) >= 26 && parseInt(tag, 10) <= 51)) {
      if (value.includes('ID') || value.length > 8) {
        result.nmid = value.slice(-15);
      }
    }
    // Tag 62: Additional Data Field Template
    else if (tag === '62') {
      result.additionalData = value;
    }

    i = valueEnd;
  }

  return result;
}
