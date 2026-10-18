import {
  UserProfile,
  Transaction,
  CategoryBudget,
  QuickContact,
  PushNotification,
} from '../types';
import { generateQuickPinHash } from './crypto';

const ACTIVE_ACCOUNT_KEY = 'kaipay_active_account_id_v2';
const STATE_PREFIX = 'kaipay_account_state_';

export interface WalletState {
  user: UserProfile;
  balance: number; // in IDR
  transactions: Transaction[];
  budgets: CategoryBudget[];
  contacts: QuickContact[];
  notifications: PushNotification[];
  isLocked: boolean;
}

export const USER_PERSONAL: UserProfile = {
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
  phoneVerified: true,
  phoneVerificationMethod: 'whatsapp',
  isMerchant: false,
};

export const USER_MERCHANT: UserProfile = {
  id: 'usr_merchant_kopi',
  name: 'Kopi Kenangan Senopati',
  phone: '0812-9876-5432',
  email: 'merchant.senopati@kopikenangan.id',
  avatarUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&auto=format&fit=crop&q=80',
  currency: 'IDR',
  theme: 'dark',
  accentColor: 'green',
  pin: generateQuickPinHash('123456'),
  biometricEnabled: true,
  twoFactorEnabled: true,
  phoneVerified: true,
  phoneVerificationMethod: 'whatsapp',
  isMerchant: true,
  qrisNmid: 'ID1020088910022',
};

export const INITIAL_USER = USER_PERSONAL;

export const INITIAL_CONTACTS: QuickContact[] = [
  {
    id: 'cnt_1',
    name: 'Budi Santoso',
    phone: '0813-8821-4491',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    group: 'teman',
    isFavorite: true,
    recentCategory: 'makanan',
  },
  {
    id: 'cnt_2',
    name: 'Siti Rahma',
    phone: '0857-1192-3488',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    group: 'keluarga',
    isFavorite: true,
    recentCategory: 'belanja',
  },
  {
    id: 'cnt_3',
    name: 'Kevin Wijaya',
    phone: '0821-4471-9012',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    group: 'teman',
    isFavorite: false,
    recentCategory: 'transportasi',
  },
  {
    id: 'cnt_4',
    name: 'Kopi Kenangan Senopati',
    phone: '0812-9876-5432',
    avatarUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&auto=format&fit=crop&q=80',
    group: 'bisnis',
    isFavorite: true,
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
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    recipientName: 'Kopi Kenangan Senopati',
    recipientPhone: '0812-9876-5432',
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
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    recipientName: 'Budi Santoso',
    recipientPhone: '0813-8821-4491',
    senderName: 'Kaelen Adiputra',
    category: 'makanan',
    note: 'Patungan makan siang sushi',
    status: 'success',
    paymentMethod: 'KaiPay Peer Transfer',
    securityHash: 'e2ee_381fae9029141b74dc8a',
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
    title: 'WhatsApp OTP Terverifikasi',
    message: 'Nomor telepon resmi Anda telah terverifikasi melalui WhatsApp Security Gateway.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: true,
    type: 'security',
  },
];

export function getActiveAccountId(): string {
  if (typeof window === 'undefined') return USER_PERSONAL.id;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const accountParam = urlParams.get('account');
    if (accountParam === 'merchant' || accountParam === USER_MERCHANT.id) return USER_MERCHANT.id;
    if (accountParam === 'personal' || accountParam === USER_PERSONAL.id) return USER_PERSONAL.id;
    if (window.location.hash === '#merchant') return USER_MERCHANT.id;
    if (window.location.hash === '#personal') return USER_PERSONAL.id;
  } catch {}
  return sessionStorage.getItem(ACTIVE_ACCOUNT_KEY) || localStorage.getItem(ACTIVE_ACCOUNT_KEY) || USER_PERSONAL.id;
}

export function setActiveAccountId(id: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ACTIVE_ACCOUNT_KEY, id);
  localStorage.setItem(ACTIVE_ACCOUNT_KEY, id);
}

export function generateUniqueId(prefix: string = 'id'): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function loadWalletState(accountId = getActiveAccountId()): WalletState {
  if (typeof window === 'undefined') {
    return createInitialState(accountId);
  }

  try {
    const raw = localStorage.getItem(`${STATE_PREFIX}${accountId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      const baseUser = accountId === USER_MERCHANT.id ? USER_MERCHANT : USER_PERSONAL;

      // Deduplicate transactions by id to prevent React duplicate key errors
      const seenTxIds = new Set<string>();
      const dedupedTransactions: Transaction[] = [];
      (parsed.transactions || []).forEach((t: Transaction) => {
        if (t && t.id && !seenTxIds.has(t.id)) {
          seenTxIds.add(t.id);
          dedupedTransactions.push(t);
        }
      });

      // Deduplicate notifications by id
      const seenNotifIds = new Set<string>();
      const dedupedNotifications: PushNotification[] = [];
      (parsed.notifications || []).forEach((n: PushNotification) => {
        if (n && n.id && !seenNotifIds.has(n.id)) {
          seenNotifIds.add(n.id);
          dedupedNotifications.push(n);
        }
      });

      // Deduplicate contacts by id
      const seenContactIds = new Set<string>();
      const dedupedContacts: QuickContact[] = [];
      (parsed.contacts || []).forEach((c: QuickContact) => {
        if (c && c.id && !seenContactIds.has(c.id)) {
          seenContactIds.add(c.id);
          dedupedContacts.push(c);
        }
      });

      return {
        ...parsed,
        transactions: dedupedTransactions,
        notifications: dedupedNotifications,
        contacts: dedupedContacts.length > 0 ? dedupedContacts : INITIAL_CONTACTS,
        budgets: parsed.budgets && parsed.budgets.length > 0 ? parsed.budgets : INITIAL_BUDGETS,
        user: { ...baseUser, ...parsed.user },
      };
    }
  } catch (e) {
    console.error('Failed to parse wallet state:', e);
  }

  const defaultState = createInitialState(accountId);
  saveWalletState(defaultState, accountId);
  return defaultState;
}

function createInitialState(accountId: string): WalletState {
  if (accountId === USER_MERCHANT.id) {
    return {
      user: USER_MERCHANT,
      balance: 1450000,
      transactions: [
        {
          id: 'tx_m_01',
          referenceNumber: 'KP-20261013-882194',
          type: 'transfer_in',
          amount: 48500,
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          recipientName: 'Kopi Kenangan Senopati',
          recipientPhone: '0812-9876-5432',
          senderName: 'Kaelen Adiputra',
          category: 'makanan',
          note: '2x Kopi Kenangan Mantan Large (QRIS)',
          status: 'success',
          paymentMethod: 'QRIS Dana Masuk',
          securityHash: 'e2ee_884fbc910248ad912fc0',
        },
      ],
      budgets: INITIAL_BUDGETS,
      contacts: INITIAL_CONTACTS,
      notifications: [
        {
          id: 'notif_m_1',
          title: 'Dana Masuk via QRIS',
          message: 'Diterima Rp 48.500 dari Kaelen Adiputra.',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          read: false,
          type: 'transaction',
        },
      ],
      isLocked: false,
    };
  }

  return {
    user: USER_PERSONAL,
    balance: 2850000,
    transactions: INITIAL_TRANSACTIONS,
    budgets: INITIAL_BUDGETS,
    contacts: INITIAL_CONTACTS,
    notifications: INITIAL_NOTIFICATIONS,
    isLocked: false,
  };
}

export function saveWalletState(state: WalletState, accountId = state.user.id): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STATE_PREFIX}${accountId}`, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save wallet state:', e);
  }
}

/**
 * Transfers funds from sender to recipient across accounts stored in localStorage
 */
export function executePeerPayment(params: {
  senderId: string;
  senderName: string;
  senderPhone: string;
  recipientId: string;
  recipientName: string;
  recipientPhone: string;
  amount: number;
  note: string;
}): { senderTx: Transaction; recipientTx: Transaction } {
  const refNumber = `KP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100000 + Math.random() * 900000)}`;
  const timestamp = new Date().toISOString();
  const hash = `e2ee_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

  const senderTx: Transaction = {
    id: generateUniqueId('tx_out'),
    referenceNumber: refNumber,
    type: 'qris_payment',
    amount: params.amount,
    timestamp,
    recipientName: params.recipientName,
    recipientPhone: params.recipientPhone,
    senderName: params.senderName,
    category: 'makanan',
    note: params.note || `Pembayaran QRIS ke ${params.recipientName}`,
    status: 'success',
    paymentMethod: 'QRIS KaiPay Saldo',
    securityHash: hash,
  };

  const recipientTx: Transaction = {
    id: generateUniqueId('tx_in'),
    referenceNumber: refNumber,
    type: 'transfer_in',
    amount: params.amount,
    timestamp,
    recipientName: params.recipientName,
    recipientPhone: params.recipientPhone,
    senderName: params.senderName,
    category: 'topup',
    note: params.note || `Terima pembayaran QRIS dari ${params.senderName}`,
    status: 'success',
    paymentMethod: 'QRIS Saldo Masuk',
    securityHash: hash,
  };

  // 1. Update recipient wallet state in storage
  try {
    const raw = localStorage.getItem(`${STATE_PREFIX}${params.recipientId}`);
    if (raw) {
      const parsed: WalletState = JSON.parse(raw);
      parsed.balance += params.amount;
      const existingTx = (parsed.transactions || []).filter((t: Transaction) => t.id !== recipientTx.id);
      parsed.transactions = [recipientTx, ...existingTx];
      const newNotifId = generateUniqueId('notif');
      const existingNotif = (parsed.notifications || []).filter((n: PushNotification) => n.id !== newNotifId);
      parsed.notifications = [
        {
          id: newNotifId,
          title: 'Dana QRIS Diterima!',
          message: `Kamu menerima ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(params.amount)} dari ${params.senderName}.`,
          timestamp,
          read: false,
          type: 'transaction',
          transactionId: recipientTx.id,
        },
        ...existingNotif,
      ];
      localStorage.setItem(`${STATE_PREFIX}${params.recipientId}`, JSON.stringify(parsed));
    }
  } catch (err) {
    console.error('Error updating recipient storage:', err);
  }

  return { senderTx, recipientTx };
}
