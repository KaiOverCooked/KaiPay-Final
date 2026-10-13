import {
  UserProfile,
  Transaction,
  CategoryBudget,
  QuickContact,
  PushNotification,
} from '../types';
import { generateQuickPinHash } from './crypto';

const STORAGE_KEY = 'kaipay_wallet_state_v1';

export interface WalletState {
  user: UserProfile;
  balance: number; // in IDR
  transactions: Transaction[];
  budgets: CategoryBudget[];
  contacts: QuickContact[];
  notifications: PushNotification[];
  isLocked: boolean;
}

export const INITIAL_USER: UserProfile = {
  id: 'usr_kaelen_01',
  name: 'Kaelen Adiputra',
  phone: '0812-9842-1088',
  email: 'kaelen.adiputra@gmail.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  currency: 'IDR',
  theme: 'dark',
  accentColor: 'blue',
  pin: generateQuickPinHash('123456'),
  biometricEnabled: true,
  twoFactorEnabled: true,
};

export const INITIAL_CONTACTS: QuickContact[] = [
  {
    id: 'cnt_1',
    name: 'Budi Santoso',
    phone: '0813-8821-4491',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    recentCategory: 'makanan',
  },
  {
    id: 'cnt_2',
    name: 'Siti Rahma',
    phone: '0857-1192-3488',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    recentCategory: 'belanja',
  },
  {
    id: 'cnt_3',
    name: 'Kevin Wijaya',
    phone: '0821-4471-9012',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    recentCategory: 'transportasi',
  },
  {
    id: 'cnt_4',
    name: 'Amanda Putri',
    phone: '0819-3382-7715',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    recentCategory: 'hiburan',
  },
  {
    id: 'cnt_5',
    name: 'Dika Pratama',
    phone: '0878-5529-6120',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    recentCategory: 'makanan',
  },
];

export const INITIAL_BUDGETS: CategoryBudget[] = [
  { category: 'makanan', name: 'Makanan & Minuman', monthlyLimit: 2000000, color: '#f97316' },
  { category: 'belanja', name: 'Belanja', monthlyLimit: 1200000, color: '#8b5cf6' },
  { category: 'tagihan', name: 'Tagihan & Utilitas', monthlyLimit: 800000, color: '#ec4899' },
  { category: 'transportasi', name: 'Transportasi', monthlyLimit: 600000, color: '#0ea5e9' },
  { category: 'hiburan', name: 'Hiburan', monthlyLimit: 500000, color: '#eab308' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_01',
    referenceNumber: 'KP-20261013-882194',
    type: 'qris_payment',
    amount: 48500,
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    recipientName: 'Kopi Kenangan Senopati',
    recipientPhone: 'QRIS-NMID-ID102948',
    senderName: 'Kaelen Adiputra',
    category: 'makanan',
    note: '2x Kopi Kenangan Mantan Large',
    status: 'success',
    paymentMethod: 'QRIS KaiPay Saldo',
    securityHash: 'e2ee_884fbc910248ad912fc0',
  },
  {
    id: 'tx_02',
    referenceNumber: 'KP-20261013-720194',
    type: 'transfer_out',
    amount: 150000,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    recipientName: 'Budi Santoso',
    recipientPhone: '0813-8821-4491',
    senderName: 'Kaelen Adiputra',
    category: 'makanan',
    note: 'Patungan makan siang sushi',
    status: 'success',
    paymentMethod: 'KaiPay Peer Transfer',
    securityHash: 'e2ee_381fae9029141b74dc8a',
  },
  {
    id: 'tx_03',
    referenceNumber: 'KP-20261012-918231',
    type: 'transfer_in',
    amount: 750000,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // Yesterday
    recipientName: 'Kaelen Adiputra',
    recipientPhone: '0812-9842-1088',
    senderName: 'Amanda Putri',
    category: 'topup',
    note: 'Pengembalian tiket konser',
    status: 'success',
    paymentMethod: 'KaiPay Instant Transfer',
    securityHash: 'e2ee_772183921abbfd903120',
  },
  {
    id: 'tx_04',
    referenceNumber: 'KP-20261011-551029',
    type: 'transfer_out',
    amount: 275000,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    recipientName: 'PLN Prabayar',
    recipientPhone: 'ID-PLN-54129841',
    senderName: 'Kaelen Adiputra',
    category: 'tagihan',
    note: 'Token Listrik Rumah 250rb',
    status: 'success',
    paymentMethod: 'KaiPay Tagihan Online',
    securityHash: 'e2ee_5510298319ad09bc8712',
  },
  {
    id: 'tx_05',
    referenceNumber: 'KP-20261010-339182',
    type: 'top_up',
    amount: 1000000,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    recipientName: 'Kaelen Adiputra',
    recipientPhone: '0812-9842-1088',
    senderName: 'BCA Virtual Account',
    category: 'topup',
    note: 'Top Up dari BCA Mobile',
    status: 'success',
    paymentMethod: 'BCA Virtual Account',
    securityHash: 'e2ee_99182741bbaef1092471',
  },
  {
    id: 'tx_06',
    referenceNumber: 'KP-20261009-410291',
    type: 'transfer_out',
    amount: 320000,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 4 days ago
    recipientName: 'Uniqlo Grand Indonesia',
    recipientPhone: 'QRIS-NMID-ID998124',
    senderName: 'Kaelen Adiputra',
    category: 'belanja',
    note: 'Kaos Airism & Kaos Kaki',
    status: 'success',
    paymentMethod: 'QRIS KaiPay',
    securityHash: 'e2ee_4491827361928bcde912',
  },
];

export const INITIAL_NOTIFICATIONS: PushNotification[] = [
  {
    id: 'notif_1',
    title: 'Pembayaran QRIS Berhasil',
    message: 'Pembayaran sebesar Rp 48.500 ke Kopi Kenangan Senopati telah terverifikasi.',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: false,
    type: 'transaction',
    transactionId: 'tx_01',
  },
  {
    id: 'notif_2',
    title: 'Transfer Uang Keluar',
    message: 'Transfer Rp 150.000 ke Budi Santoso berhasil diproses.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    read: false,
    type: 'transaction',
    transactionId: 'tx_02',
  },
  {
    id: 'notif_3',
    title: 'Saldo Masuk',
    message: 'Kamu menerima Rp 750.000 dari Amanda Putri. Saldo virtual bertambah.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    read: true,
    type: 'transaction',
    transactionId: 'tx_03',
  },
  {
    id: 'notif_4',
    title: 'Keamanan Akun Terproteksi',
    message: 'Enkripsi data E2E aktif dan biometrik Face ID/Fingerprint telah siap digunakan.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    read: true,
    type: 'security',
  },
];

export function loadWalletState(): WalletState {
  if (typeof window === 'undefined') {
    return {
      user: INITIAL_USER,
      balance: 2450000,
      transactions: INITIAL_TRANSACTIONS,
      budgets: INITIAL_BUDGETS,
      contacts: INITIAL_CONTACTS,
      notifications: INITIAL_NOTIFICATIONS,
      isLocked: false,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        user: { ...INITIAL_USER, ...parsed.user },
      };
    }
  } catch (e) {
    console.error('Failed to parse wallet state:', e);
  }

  const defaultState: WalletState = {
    user: INITIAL_USER,
    balance: 2450000,
    transactions: INITIAL_TRANSACTIONS,
    budgets: INITIAL_BUDGETS,
    contacts: INITIAL_CONTACTS,
    notifications: INITIAL_NOTIFICATIONS,
    isLocked: false,
  };

  saveWalletState(defaultState);
  return defaultState;
}

export function saveWalletState(state: WalletState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save wallet state:', e);
  }
}
