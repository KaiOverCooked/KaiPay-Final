import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Sparkles, 
  ChevronUp, 
  QrCode, 
  Send, 
  Users, 
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Bell,
  X
} from 'lucide-react';
import { PushNotification, Transaction, UserProfile } from '../types';
import { formatCurrency } from '../utils/formatters';
import { sounds } from '../utils/sound';
import { iosQuickTap } from '../utils/motion';

interface DynamicIslandProps {
  notification: PushNotification | null;
  lastTransaction: Transaction | null;
  user: UserProfile;
  balance: number;
  onDismissNotification: () => void;
  onOpenQr: () => void;
  onOpenSend: () => void;
  onOpenSplitBill: (tx?: Transaction) => void;
  onOpenCard3D: () => void;
  onOpenReceipt: (tx: Transaction) => void;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  notification,
  lastTransaction,
  user,
  balance,
  onDismissNotification,
  onOpenQr,
  onOpenSend,
  onOpenSplitBill,
  onOpenCard3D,
  onOpenReceipt,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // If there is an active push notification, auto show relevant info
  const hasAlert = !!notification;

  const handleToggleExpand = () => {
    sounds.playHapticClick();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed top-2.5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none select-none max-w-[94vw]">
      <motion.div
        layout
        transition={{
          type: 'spring',
          stiffness: 450,
          damping: 32,
          mass: 0.8,
        }}
        onClick={handleToggleExpand}
        className={`pointer-events-auto cursor-pointer bg-black text-white rounded-[32px] border border-white/[0.14] shadow-2xl shadow-black/80 backdrop-blur-2xl overflow-hidden transition-colors ${
          isExpanded
            ? 'w-[360px] sm:w-[410px] p-4'
            : hasAlert
            ? 'w-[320px] sm:w-[350px] px-3.5 py-2.5'
            : 'w-[195px] px-3 py-1.5 hover:border-white/30'
        }`}
      >
        <AnimatePresence mode="wait">
          {/* STATE 1: EXPANDED FULL INTERACTIVE ISLAND */}
          {isExpanded ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="space-y-3.5"
            >
              {/* Top Row: Island Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-black text-[9px] tracking-tight">
                    Pay
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1">
                      KaiPay Live Activity
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#30D158] animate-pulse" />
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Apple Secure Enclave
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-mono text-zinc-400">
                    {formatCurrency(balance, user.currency)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(false);
                      sounds.playHapticClick();
                    }}
                    className="p-1 text-zinc-400 hover:text-white rounded-full hover:bg-white/10"
                    aria-label="Tutup Dynamic Island"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Middle Row: Recent Alert or Quick Activity */}
              {notification ? (
                <div className="p-3 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-start gap-2.5">
                  <div className="p-1.5 rounded-xl bg-white/10 text-emerald-400 shrink-0 mt-0.5">
                    {notification.type === 'transaction' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#30D158]" />
                    ) : notification.type === 'budget_alert' ? (
                      <AlertTriangle className="w-4 h-4 text-[#FF9F0A]" />
                    ) : (
                      <Bell className="w-4 h-4 text-sky-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {notification.title}
                    </p>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismissNotification();
                    }}
                    className="text-zinc-500 hover:text-zinc-300 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : lastTransaction ? (
                <div className="p-3 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-zinc-400 truncate">
                        Transaksi Terakhir
                      </p>
                      <p className="text-xs font-bold text-white truncate">
                        {lastTransaction.recipientName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <p className="text-xs font-bold text-emerald-400 font-mono">
                      {formatCurrency(lastTransaction.amount, user.currency)}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(false);
                        onOpenReceipt(lastTransaction);
                      }}
                      className="text-[10px] text-sky-400 hover:underline"
                    >
                      Lihat Struk HD
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Sistem Pembayaran Siap & Aman
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">iOS 18</span>
                </div>
              )}

              {/* Bottom Quick Action Grid */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                <motion.button
                  whileTap={iosQuickTap}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                    onOpenQr();
                  }}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors"
                >
                  <QrCode className="w-4 h-4 text-white" />
                  <span className="text-[10px] font-medium mt-1">QRIS</span>
                </motion.button>

                <motion.button
                  whileTap={iosQuickTap}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                    onOpenSend();
                  }}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span className="text-[10px] font-medium mt-1">Kirim</span>
                </motion.button>

                <motion.button
                  whileTap={iosQuickTap}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                    onOpenSplitBill(lastTransaction || undefined);
                  }}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors"
                >
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-medium mt-1">Split Bill</span>
                </motion.button>

                <motion.button
                  whileTap={iosQuickTap}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                    onOpenCard3D();
                  }}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors"
                >
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] font-medium mt-1">Kartu 3D</span>
                </motion.button>
              </div>
            </motion.div>
          ) : hasAlert ? (
            /* STATE 2: ALERT COMPACT ISLAND */
            <motion.div
              key="alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-white truncate leading-tight">
                    {notification.title}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate leading-tight">
                    {notification.message}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20">
                  Ekspansi
                </span>
              </div>
            </motion.div>
          ) : (
            /* STATE 3: DEFAULT COMPACT PILL */
            <motion.div
              key="compact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#1C1C1E] border border-white/20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#30D158] animate-pulse" />
                </div>
                <span className="text-xs font-semibold tracking-tight text-white">
                  KaiPay
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-zinc-400">
                <Sparkles className="w-3 h-3 text-[#FFD60A]" />
                <span className="text-[10px] font-mono text-zinc-300">Siap</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
