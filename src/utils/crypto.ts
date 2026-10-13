/**
 * KaiPay E2E Encryption & Security Simulation
 * Generates cryptographic checksums using browser Web Crypto API (SHA-256)
 * to verify simulated transaction integrity and privacy.
 */

export async function generateTransactionHash(data: {
  referenceNumber: string;
  sender: string;
  recipient: string;
  amount: number;
  timestamp: string;
}): Promise<string> {
  const payloadString = `${data.referenceNumber}:${data.sender}:${data.recipient}:${data.amount}:${data.timestamp}:KAIPAY_E2EE_SECURE_SALT`;
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(payloadString);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback
    }
  }

  // Simple deterministic fallback hash
  let hash = 0;
  for (let i = 0; i < payloadString.length; i++) {
    const char = payloadString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return 'e2ee_' + Math.abs(hash).toString(16).padStart(16, '0') + '9fc817';
}

export function generateQuickPinHash(pin: string): string {
  let hash = 0;
  const salted = `KP_PIN_${pin}_SALT_982`;
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export function verifyPin(inputPin: string, storedHash: string): boolean {
  return generateQuickPinHash(inputPin) === storedHash;
}
