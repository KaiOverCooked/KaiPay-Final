import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Navbar 
} from './components/Navbar';
import { 
  BottomNav 
} from './components/BottomNav';
import { 
  BalanceCard 
} from './components/BalanceCard';
import { 
  QuickContacts 
} from './components/QuickContacts';
import { 
  SendMoneyModal 
} from './components/SendMoneyModal';
import { 
  TopUpModal 
} from './components/TopUpModal';
import { 
  QrModal 
} from './components/QrModal';
import { 
  ReceiptModal 
} from './components/ReceiptModal';
import { 
  TransactionHistoryView 
} from './components/TransactionHistoryView';
import { 
  AnalyticsView 
} from './components/AnalyticsView';
import { 
  ProfileView 
} from './components/ProfileView';
import { 
  NotificationDrawer 
} from './components/NotificationDrawer';
import { 
  ToastBanner 
} from './components/ToastBanner';
import { 
  DynamicIsland 
} from './components/DynamicIsland';
import { 
  VirtualCard3D 
} from './components/VirtualCard3D';
import { 
  SplitBillModal 
} from './components/SplitBillModal';
import { 
  FaceIdModal 
} from './components/FaceIdModal';
import { 
  AuthLockScreen 
} from './components/AuthLockScreen';
import { 
  AddContactModal 
} from './components/AddContactModal';
import { 
  loadWalletState, 
  saveWalletState, 
  WalletState,
  INITIAL_USER,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_CONTACTS,
  INITIAL_NOTIFICATIONS
} from './utils/storage';
import { 
  Transaction, 
  UserProfile, 
  QuickContact, 
  PushNotification, 
  TransactionCategory 
} from './types';
import { 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownLeft,
  ChevronRight,
  Users,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { formatCurrency, formatDateRelative } from './utils/formatters';
import { sounds } from './utils/sound';
import { iosTabVariants, iosQuickTap, iosSubtleTap } from './utils/motion';

export default function App() {
  const [state, setState] = useState<WalletState>(() => loadWalletState());
  const [activeTab, setActiveTab] = useState<string>('home');

  // Modals & Drawers state
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [sendRecipient, setSendRecipient] = useState<{ name: string; phone: string; amount?: number; note?: string } | null>(null);
  
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [qrTab, setQrTab] = useState<'scan' | 'generate'>('scan');

  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);

  // 3D Card & Split Bill & Face ID state
  const [isCard3DOpen, setIsCard3DOpen] = useState(false);
  const [isSplitBillOpen, setIsSplitBillOpen] = useState(false);
  const [splitBillInitial, setSplitBillInitial] = useState<{ amount: number; merchantName: string }>({
    amount: 120000,
    merchantName: 'Tagihan Bersama',
  });
  const [isStandaloneFaceIdOpen, setIsStandaloneFaceIdOpen] = useState(false);
  const [faceIdSuccessCallback, setFaceIdSuccessCallback] = useState<(() => void) | null>(null);

  // Floating Push Notification Alert
  const [activeToast, setActiveToast] = useState<PushNotification | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    saveWalletState(state);
  }, [state]);

  // Apply Theme class to HTML document
  useEffect(() => {
    if (state.user.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.user.theme]);

  // Auto-dismiss floating toast banner after 4.5 seconds
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  // Push Notification Dispatcher
  const dispatchPushNotification = (
    title: string, 
    message: string, 
    type: PushNotification['type'] = 'transaction',
    transactionId?: string
  ) => {
    const newNotif: PushNotification = {
      id: `notif_${Date.now()}`,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      type,
      transactionId,
    };

    setState((prev) => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications],
    }));

    setActiveToast(newNotif);
  };

  // Transfer Completion Handler
  const handleCompleteTransfer = (tx: Transaction) => {
    setState((prev) => {
      const nextBalance = prev.balance - tx.amount;
      const nextTransactions = [tx, ...prev.transactions];

      // Check category budget threshold
      const matchingBudget = prev.budgets.find((b) => b.category === tx.category);
      if (matchingBudget) {
        const currentSpent = nextTransactions
          .filter((t) => t.category === tx.category && (t.type === 'transfer_out' || t.type === 'qris_payment'))
          .reduce((sum, t) => sum + t.amount, 0);

        if (currentSpent > matchingBudget.monthlyLimit) {
          setTimeout(() => {
            dispatchPushNotification(
              'Peringatan Batas Anggaran!',
              `Pengeluaran kategori ${matchingBudget.name} telah melebihi pagu bulanan ${formatCurrency(matchingBudget.monthlyLimit, prev.user.currency)}.`,
              'budget_alert'
            );
          }, 1200);
        }
      }

      return {
        ...prev,
        balance: nextBalance,
        transactions: nextTransactions,
      };
    });

    setIsSendOpen(false);
    setSendRecipient(null);
    setSelectedReceiptTx(tx);
    setIsReceiptOpen(true);

    dispatchPushNotification(
      'Transfer Berhasil',
      `Berhasil mengirim ${formatCurrency(tx.amount, state.user.currency)} ke ${tx.recipientName}.`,
      'transaction',
      tx.id
    );
  };

  // Top Up Completion Handler
  const handleCompleteTopUp = (tx: Transaction, newBalance?: number) => {
    setState((prev) => {
      const finalBalance = newBalance !== undefined ? newBalance : prev.balance + tx.amount;
      return {
        ...prev,
        balance: finalBalance,
        transactions: [tx, ...prev.transactions],
      };
    });

    setIsTopUpOpen(false);
    setSelectedReceiptTx(tx);
    setIsReceiptOpen(true);

    dispatchPushNotification(
      'Isi Saldo Berhasil',
      `Saldo virtual berhasil diperbarui menjadi ${formatCurrency(newBalance !== undefined ? newBalance : state.balance + tx.amount, state.user.currency)}.`,
      'transaction',
      tx.id
    );
  };

  // Scanned QR Handler (from Camera / File / Fast Presets)
  const handleScannedQr = (data: { name: string; phone: string; amount?: number; note?: string }) => {
    setIsQrOpen(false);
    setSendRecipient(data);
    setIsSendOpen(true);
  };

  // Request Face ID for sensitive operations
  const handleRequestFaceId = (onSuccess: () => void) => {
    setFaceIdSuccessCallback(() => onSuccess);
    setIsStandaloneFaceIdOpen(true);
  };

  // Open Split Bill modal
  const handleOpenSplitBill = (tx?: Transaction) => {
    if (tx) {
      setSplitBillInitial({
        amount: tx.amount,
        merchantName: tx.recipientName || 'Tagihan QRIS',
      });
    } else {
      setSplitBillInitial({
        amount: 150000,
        merchantName: 'Tagihan Bersama',
      });
    }
    setIsSplitBillOpen(true);
  };

  const handleOpenSplitBillFromQr = (data: { name: string; phone: string; amount?: number; note?: string }) => {
    setSplitBillInitial({
      amount: data.amount || 120000,
      merchantName: data.name || 'Merchant QRIS',
    });
    setIsSplitBillOpen(true);
  };

  const handleCompleteSplit = (summary: {
    totalAmount: number;
    merchantName: string;
    participants: { name: string; phone: string; amount: number }[];
    myShare: number;
  }) => {
    dispatchPushNotification(
      'Split Bill Berhasil Dibuat',
      `Tagihan ${summary.merchantName} (${formatCurrency(summary.totalAmount, state.user.currency)}) dibagi rata ke ${summary.participants.length} teman. Bagian Anda: ${formatCurrency(summary.myShare, state.user.currency)}.`,
      'transaction'
    );
  };

  // Update Category Budget
  const handleUpdateBudget = (category: TransactionCategory, newLimit: number) => {
    setState((prev) => ({
      ...prev,
      budgets: prev.budgets.map((b) =>
        b.category === category ? { ...b, monthlyLimit: newLimit } : b
      ),
    }));

    dispatchPushNotification(
      'Pagu Anggaran Diperbarui',
      `Batas pengeluaran bulanan berhasil diperbarui menjadi ${formatCurrency(newLimit, state.user.currency)}.`,
      'system'
    );
  };

  // Update User Profile
  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        ...updated,
      },
    }));
  };

  // Toggle Theme
  const handleToggleTheme = () => {
    const nextTheme = state.user.theme === 'dark' ? 'light' : 'dark';
    handleUpdateUser({ theme: nextTheme });
  };

  // Add Contact
  const handleAddContact = (contact: QuickContact) => {
    setState((prev) => ({
      ...prev,
      contacts: [contact, ...prev.contacts],
    }));

    dispatchPushNotification(
      'Kontak Tersimpan',
      `${contact.name} berhasil ditambahkan ke daftar kontak KaiPay.`,
      'system'
    );
  };

  // Reset Data to Default
  const handleResetData = () => {
    const defaultState: WalletState = {
      user: INITIAL_USER,
      balance: 2450000,
      transactions: INITIAL_TRANSACTIONS,
      budgets: INITIAL_BUDGETS,
      contacts: INITIAL_CONTACTS,
      notifications: INITIAL_NOTIFICATIONS,
      isLocked: false,
    };
    setState(defaultState);
    saveWalletState(defaultState);
    alert('Seluruh data KaiPay berhasil diatur ulang ke kondisi awal.');
  };

  // Open transaction receipt on notification click
  const handleSelectNotification = (notif: PushNotification) => {
    if (notif.transactionId) {
      const match = state.transactions.find((t) => t.id === notif.transactionId);
      if (match) {
        setIsNotificationOpen(false);
        setSelectedReceiptTx(match);
        setIsReceiptOpen(true);
      }
    }
  };

  // Show Auth Lock Screen if locked
  if (state.isLocked) {
    return (
      <AuthLockScreen
        user={state.user}
        onUnlock={() => setState((prev) => ({ ...prev, isLocked: false }))}
      />
    );
  }

  // Recent 5 transactions for Home screen feed
  const recentTransactions = state.transactions.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] text-[#1C1C1E] dark:text-[#F2F2F7] flex flex-col font-sans transition-colors duration-300">
      {/* iPhone Dynamic Island: Interactive & Expandable Live Activity & Alerts */}
      <DynamicIsland
        notification={activeToast}
        lastTransaction={state.transactions[0] || null}
        user={state.user}
        balance={state.balance}
        onDismissNotification={() => setActiveToast(null)}
        onOpenQr={() => {
          setQrTab('scan');
          setIsQrOpen(true);
        }}
        onOpenSend={() => {
          setSendRecipient(null);
          setIsSendOpen(true);
        }}
        onOpenSplitBill={(tx) => handleOpenSplitBill(tx)}
        onOpenCard3D={() => setIsCard3DOpen(true)}
        onOpenReceipt={(tx) => {
          setSelectedReceiptTx(tx);
          setIsReceiptOpen(true);
        }}
      />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={state.user}
        notifications={state.notifications}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onToggleTheme={handleToggleTheme}
        onLockApp={() => setState((prev) => ({ ...prev, isLocked: true }))}
      />

      {/* Main Viewport Content Area with iOS Tab Gliding Transitions */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-12">
        <AnimatePresence mode="wait" initial={false}>
          {/* TAB: BERANDA (HOME) */}
          {activeTab === 'home' && (
            <motion.div
              key="home"
              variants={iosTabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              custom={1}
              className="space-y-6"
            >
              {/* Desktop Two-Column Split Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column (Main Balance & Quick Actions & Contacts) */}
                <div className="lg:col-span-7 space-y-6">
                  <BalanceCard
                    balance={state.balance}
                    user={state.user}
                    transactions={state.transactions}
                    onOpenSend={() => {
                      setSendRecipient(null);
                      setIsSendOpen(true);
                    }}
                    onOpenReceiveQr={() => {
                      setQrTab('generate');
                      setIsQrOpen(true);
                    }}
                    onOpenTopUp={() => setIsTopUpOpen(true)}
                    onOpenHistory={() => setActiveTab('history')}
                    onQuickAdjustBalance={() => setIsTopUpOpen(true)}
                    onOpenCard3D={() => setIsCard3DOpen(true)}
                  />

                  <QuickContacts
                    contacts={state.contacts}
                    onSelectContact={(c) => {
                      setSendRecipient({ name: c.name, phone: c.phone });
                      setIsSendOpen(true);
                    }}
                    onAddNewContact={() => setIsAddContactOpen(true)}
                  />

                  {/* Recent Transactions Feed (iOS Grouped Inset Card) */}
                  <div className="rounded-[26px] bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#000000] dark:text-[#FFFFFF]">
                        Aktivitas Terakhir
                      </h3>
                      <motion.button
                        whileTap={iosQuickTap}
                        type="button"
                        onClick={() => setActiveTab('history')}
                        className="text-xs font-semibold text-[#007AFF] hover:underline flex items-center gap-1 transition-colors"
                      >
                        <span>Lihat Semua</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#007AFF]" />
                      </motion.button>
                    </div>

                    <div className="divide-y divide-[#E5E5EA] dark:divide-[#2C2C2E]">
                      {recentTransactions.map((tx) => {
                        const isIncome = tx.type === 'transfer_in' || tx.type === 'top_up';
                        return (
                          <motion.div
                            key={tx.id}
                            whileTap={iosSubtleTap}
                            onClick={() => {
                              setSelectedReceiptTx(tx);
                              setIsReceiptOpen(true);
                            }}
                            className="py-3 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.03] rounded-2xl px-2 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3 min-w-0 pr-2">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                                isIncome
                                ? 'bg-[#34C759]/15 text-[#34C759]'
                                : 'bg-[#8E8E93]/15 text-[#000000] dark:text-[#FFFFFF]'
                              }`}>
                                {isIncome ? <ArrowDownLeft className="w-4 h-4 stroke-[2.5px]" /> : <ArrowUpRight className="w-4 h-4 stroke-[2.5px]" />}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-[#000000] dark:text-[#FFFFFF] truncate">
                                  {isIncome ? tx.senderName : tx.recipientName}
                                </h4>
                                <p className="text-[11px] text-[#6C6C70] dark:text-[#8E8E93] truncate">
                                  {formatDateRelative(tx.timestamp)} · {tx.category}
                                </p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className={`text-xs font-bold font-mono tabular-nums ${
                                isIncome ? 'text-[#34C759]' : 'text-[#000000] dark:text-[#FFFFFF]'
                              }`}>
                                {isIncome ? '+' : '-'}{formatCurrency(tx.amount, state.user.currency)}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column (Spending Summary & Interactive QRIS Banner) */}
                <div className="lg:col-span-5 space-y-6">
                  {/* QRIS Fast Pay Card (Apple Wallet Style) */}
                  <div className="p-6 rounded-[28px] bg-gradient-to-br from-[#1C1C1E] via-[#242426] to-[#141416] text-white border border-white/[0.12] shadow-xl relative overflow-hidden">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold tracking-widest uppercase text-[#30D158]">
                          QRIS & Apple Pay Standard
                        </span>
                        <h3 className="text-base font-bold text-white mt-1">
                          Bayar Instan Tanpa Kontak
                        </h3>
                        <p className="text-xs text-[#8E8E93] mt-1 leading-relaxed">
                          Pindai kode QRIS di merchant favorit atau tampilkan kode QR akun Anda untuk menerima transfer dana.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 mt-5">
                      <motion.button
                        whileTap={iosQuickTap}
                        type="button"
                        onClick={() => {
                          setQrTab('scan');
                          setIsQrOpen(true);
                        }}
                        className="py-2.5 px-3 rounded-full bg-[#007AFF] hover:bg-[#0062CC] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <span>Buka Scanner</span>
                      </motion.button>
                      <motion.button
                        whileTap={iosQuickTap}
                        type="button"
                        onClick={() => {
                          setQrTab('generate');
                          setIsQrOpen(true);
                        }}
                        className="py-2.5 px-3 rounded-full bg-white/10 text-white border border-white/10 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-white/15 transition-all"
                      >
                        <span>Kode QR Saya</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Quick Budget Health Widget (iOS Inset Card) */}
                  <div className="p-6 rounded-[26px] bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-[#000000] dark:text-[#FFFFFF]">
                          Pemantauan Pagu Anggaran
                        </h3>
                        <p className="text-xs text-[#6C6C70] dark:text-[#8E8E93]">
                          Ringkasan batas pengeluaran bulan ini
                        </p>
                      </div>
                      <motion.button
                        whileTap={iosQuickTap}
                        type="button"
                        onClick={() => setActiveTab('analytics')}
                        className="text-xs text-[#007AFF] hover:underline font-semibold"
                      >
                        Kelola
                      </motion.button>
                    </div>

                    <div className="space-y-3 pt-1">
                      {state.budgets.slice(0, 3).map((b) => {
                        const spent = state.transactions
                          .filter((t) => t.category === b.category && (t.type === 'transfer_out' || t.type === 'qris_payment'))
                          .reduce((sum, t) => sum + t.amount, 0);
                        const percent = b.monthlyLimit > 0 ? Math.round((spent / b.monthlyLimit) * 100) : 0;
                        return (
                          <div key={b.category} className="space-y-1">
                            <div className="flex justify-between text-xs font-medium">
                              <span className="text-[#000000] dark:text-[#FFFFFF]">{b.name}</span>
                              <span className="font-mono text-[#8E8E93]">{percent}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-[#E5E5EA] dark:bg-[#2C2C2E] overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, percent)}%` }}
                                transition={{ type: 'spring', stiffness: 240, damping: 24 }}
                                className={`h-full rounded-full ${
                                  percent >= 100 ? 'bg-[#FF3B30]' : percent >= 80 ? 'bg-[#FF9500]' : 'bg-[#007AFF]'
                                }`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Security Guarantee Note */}
                  <div className="p-4 rounded-[22px] bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] flex items-start gap-3 text-xs text-[#6C6C70] dark:text-[#8E8E93]">
                    <ShieldCheck className="w-5 h-5 text-[#34C759] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#000000] dark:text-[#FFFFFF] block">
                        Apple Security Architecture (Sim)
                      </span>
                      Setiap transaksi diverifikasi dengan protokol SHA-256 dan dilindungi otorisasi sensor Face ID / Touch ID.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: RIWAYAT MUTASI */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              variants={iosTabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              custom={1}
            >
              <TransactionHistoryView
                transactions={state.transactions}
                user={state.user}
                onSelectTransaction={(tx) => {
                  setSelectedReceiptTx(tx);
                  setIsReceiptOpen(true);
                }}
                onInitiateTransfer={() => {
                  setSendRecipient(null);
                  setIsSendOpen(true);
                }}
              />
            </motion.div>
          )}

          {/* TAB: PINDAI QRIS */}
          {activeTab === 'qr' && (
            <motion.div
              key="qr"
              variants={iosTabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              custom={1}
              className="max-w-md mx-auto"
            >
              <QrModal
                isOpen={true}
                onClose={() => setActiveTab('home')}
                user={state.user}
                initialTab="scan"
                onScannedQr={(data) => {
                  setActiveTab('home');
                  handleScannedQr(data);
                }}
              />
            </motion.div>
          )}

          {/* TAB: ANALITIK & ANGGARAN */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              variants={iosTabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              custom={1}
            >
              <AnalyticsView
                transactions={state.transactions}
                user={state.user}
                budgets={state.budgets}
                onUpdateBudget={handleUpdateBudget}
              />
            </motion.div>
          )}

          {/* TAB: PENGATURAN AKUN */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              variants={iosTabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              custom={1}
            >
              <ProfileView
                user={state.user}
                onUpdateUser={handleUpdateUser}
                onResetData={handleResetData}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQrScan={() => {
          setQrTab('scan');
          setIsQrOpen(true);
        }}
      />

      {/* POPUP MODALS WITH SPRING SLIDE-UP */}
      {/* 1. Send Money Modal */}
      <SendMoneyModal
        isOpen={isSendOpen}
        onClose={() => {
          setIsSendOpen(false);
          setSendRecipient(null);
        }}
        balance={state.balance}
        user={state.user}
        contacts={state.contacts}
        preselectedRecipient={sendRecipient}
        onCompleteTransfer={handleCompleteTransfer}
      />

      {/* 2. Top Up Modal */}
      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        user={state.user}
        currentBalance={state.balance}
        onCompleteTopUp={handleCompleteTopUp}
      />

      {/* 3. QR Modal with Live Camera & History */}
      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        user={state.user}
        initialTab={qrTab}
        onScannedQr={handleScannedQr}
        onOpenSplitBillFromQr={handleOpenSplitBillFromQr}
      />

      {/* 4. Digital Receipt Modal */}
      <ReceiptModal
        transaction={selectedReceiptTx}
        user={state.user}
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          setSelectedReceiptTx(null);
        }}
      />

      {/* 5. Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={state.notifications}
        onMarkAllAsRead={() => {
          setState((prev) => ({
            ...prev,
            notifications: prev.notifications.map((n) => ({ ...n, read: true })),
          }));
        }}
        onClearAll={() => {
          setState((prev) => ({ ...prev, notifications: [] }));
        }}
        onSelectNotification={(n) => handleSelectNotification(n)}
      />

      {/* 6. Add Contact Modal */}
      <AddContactModal
        isOpen={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
        onAddContact={handleAddContact}
      />

      {/* 7. Virtual Kai Card Titanium 3D Modal */}
      <VirtualCard3D
        isOpen={isCard3DOpen}
        onClose={() => setIsCard3DOpen(false)}
        user={state.user}
        balance={state.balance}
        onRequestFaceId={handleRequestFaceId}
      />

      {/* 8. Split Bill Modal */}
      <SplitBillModal
        isOpen={isSplitBillOpen}
        onClose={() => setIsSplitBillOpen(false)}
        user={state.user}
        contacts={state.contacts}
        initialAmount={splitBillInitial.amount}
        initialMerchantName={splitBillInitial.merchantName}
        onCompleteSplit={handleCompleteSplit}
      />

      {/* 9. Standalone Face ID Verification Modal */}
      <FaceIdModal
        isOpen={isStandaloneFaceIdOpen}
        onClose={() => {
          setIsStandaloneFaceIdOpen(false);
          setFaceIdSuccessCallback(null);
        }}
        onSuccess={() => {
          setIsStandaloneFaceIdOpen(false);
          if (faceIdSuccessCallback) {
            faceIdSuccessCallback();
            setFaceIdSuccessCallback(null);
          }
        }}
        title="Autentikasi Face ID"
        subtitle="Verifikasi biometrik berhasil dikonfirmasi"
      />
    </div>
  );
}
