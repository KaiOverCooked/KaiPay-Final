export type TransactionType = 'transfer_out' | 'transfer_in' | 'top_up' | 'qris_payment';

export type TransactionCategory = 
  | 'makanan' 
  | 'transportasi' 
  | 'belanja' 
  | 'tagihan' 
  | 'hiburan' 
  | 'topup' 
  | 'lainnya';

export type CurrencyCode = 'IDR' | 'USD' | 'EUR' | 'SGD' | 'JPY';

export interface CurrencyRate {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToIdr: number; // 1 unit in IDR
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatarUrl: string;
  currency: CurrencyCode;
  theme: 'dark' | 'light';
  accentColor?: 'blue' | 'monochrome' | 'green' | 'purple' | 'orange';
  pin: string;
  biometricEnabled: boolean;
  twoFactorEnabled: boolean;
}

export interface Transaction {
  id: string;
  referenceNumber: string;
  type: TransactionType;
  amount: number; // Stored in base currency IDR
  timestamp: string; // ISO String
  recipientName: string;
  recipientPhone: string;
  senderName: string;
  category: TransactionCategory;
  note: string;
  status: 'success' | 'pending' | 'failed';
  paymentMethod: string;
  securityHash: string;
}

export interface CategoryBudget {
  category: TransactionCategory;
  name: string;
  monthlyLimit: number; // in IDR
  color: string;
}

export interface QuickContact {
  id: string;
  name: string;
  phone: string;
  avatarUrl: string;
  recentCategory?: TransactionCategory;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'transaction' | 'budget_alert' | 'security' | 'system';
  transactionId?: string;
}

export const CURRENCY_RATES: Record<CurrencyCode, CurrencyRate> = {
  IDR: { code: 'IDR', symbol: 'Rp', name: 'Rupiah Indonesia', rateToIdr: 1 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateToIdr: 16000 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateToIdr: 17200 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateToIdr: 11800 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToIdr: 105 },
};

export const CATEGORY_DETAILS: Record<TransactionCategory, { label: string; iconName: string; color: string }> = {
  makanan: { label: 'Makanan & Minuman', iconName: 'Utensils', color: '#f97316' },
  transportasi: { label: 'Transportasi', iconName: 'Car', color: '#0ea5e9' },
  belanja: { label: 'Belanja & Belanjaan', iconName: 'ShoppingBag', color: '#8b5cf6' },
  tagihan: { label: 'Tagihan & Utilitas', iconName: 'Receipt', color: '#ec4899' },
  hiburan: { label: 'Hiburan & Hobi', iconName: 'Film', color: '#eab308' },
  topup: { label: 'Isi Saldo & Top Up', iconName: 'Wallet', color: '#10b981' },
  lainnya: { label: 'Lain-lain', iconName: 'MoreHorizontal', color: '#6b7280' },
};

export interface QrisScanHistoryItem {
  id: string;
  merchantName: string;
  phoneOrNmid: string;
  amount?: number;
  note?: string;
  timestamp: string; // ISO String
  timeString: string; // e.g. "14:32:05"
  dateString: string; // e.g. "13"
  monthString: string; // e.g. "Oktober"
  yearString: string; // e.g. "2026"
  rawQr?: string;
}

export interface SplitBillContact {
  id: string;
  name: string;
  phone: string;
  amount: number;
  isPaid?: boolean;
}

