import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, 
  EyeOff, 
  Send, 
  QrCode, 
  PlusCircle, 
  History, 
  ShieldCheck, 
  SlidersHorizontal,
  ArrowUpRight,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { UserProfile, Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';
import { sounds } from '../utils/sound';
import { iosQuickTap, iosSubtleTap, iosSpringTransition } from '../utils/motion';

interface BalanceCardProps {
  balance: number;
  user: UserProfile;
  transactions: Transaction[];
  onOpenSend: () => void;
  onOpenReceiveQr: () => void;
  onOpenTopUp: () => void;
  onOpenHistory: () => void;
  onQuickAdjustBalance: () => void;
  onOpenCard3D?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  user,
  transactions,
  onOpenSend,
  onOpenReceiveQr,
  onOpenTopUp,
  onOpenHistory,
  onQuickAdjustBalance,
  onOpenCard3D,
}) => {
  const [showBalance, setShowBalance] = useState<boolean>(true);

  // Calculate this month's stats
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthTransactions = transactions.filter((t) => {
    const d = new Date(t.timestamp);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalExpense = thisMonthTransactions
    .filter((t) => t.type === 'transfer_out' || t.type === 'qris_payment')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalIncome = thisMonthTransactions
    .filter((t) => t.type === 'transfer_in' || t.type === 'top_up')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="w-full">
      {/* Apple Cash / Apple Card Titanium Aesthetic */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={iosSpringTransition}
        className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1C1C1E] via-[#242426] to-[#141416] text-white p-6 sm:p-7 shadow-2xl shadow-black/35 border border-white/[0.12]"
      >
        {/* Apple Titanium Subtle Radial Sheen & Right-Side Light Bloom */}
        <div className="absolute -right-16 -top-16 w-60 h-60 bg-white/[0.04] rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-52 h-52 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

        {/* Right-Side Directional Specular Sheen (Apple Card Specular) */}
        <div className="absolute right-0 top-0 bottom-0 w-36 bg-gradient-to-l from-white/[0.14] via-white/[0.04] to-transparent pointer-events-none rounded-r-[28px]" />
        <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-gradient-to-b from-white/40 via-white/15 to-transparent pointer-events-none rounded-r-[28px]" />

        {/* Top Card Row: Apple Pay Lockup & Tools */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-white">Kai</span>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md bg-white text-black tracking-wider">
                Cash
              </span>
            </div>
            <span className="text-xs text-[#8E8E93] font-mono">· {user.currency}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenCard3D && (
              <motion.button
                whileTap={iosQuickTap}
                type="button"
                onClick={() => {
                  sounds.playHapticClick();
                  onOpenCard3D();
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 text-white text-[11px] font-semibold border border-white/10 transition-colors mr-1"
                title="Buka Kartu Titanium 3D"
              >
                <Sparkles className="w-3 h-3 text-[#FFD60A]" />
                <span>Kartu 3D</span>
              </motion.button>
            )}

            <motion.button
              whileTap={iosQuickTap}
              type="button"
              onClick={() => {
                sounds.playHapticClick();
                setShowBalance(!showBalance);
              }}
              aria-label={showBalance ? 'Sembunyikan saldo' : 'Tampilkan saldo'}
              className="p-2 rounded-full text-[#8E8E93] hover:text-white hover:bg-white/10 transition-colors"
              title={showBalance ? 'Sembunyikan saldo' : 'Tampilkan saldo'}
            >
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </motion.button>

            <motion.button
              whileTap={iosQuickTap}
              type="button"
              onClick={() => {
                sounds.playHapticClick();
                onQuickAdjustBalance();
              }}
              aria-label="Atur saldo virtual secara manual"
              className="p-2 rounded-full text-[#8E8E93] hover:text-white hover:bg-white/10 transition-colors"
              title="Atur Saldo Cepat"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Balance Display with SF Numbers */}
        <div className="relative z-10 my-4">
          <div className="flex items-baseline gap-2 overflow-hidden h-12 flex items-center">
            <AnimatePresence mode="wait">
              <motion.h1
                key={showBalance ? 'visible' : 'hidden'}
                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.2 }}
                className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums font-sans"
              >
                {showBalance ? formatCurrency(balance, user.currency) : '••••••••••'}
              </motion.h1>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3 mt-1.5 text-xs text-[#8E8E93]">
            <div className="flex items-center gap-1">
              <span className="font-mono">{user.phone}</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1 text-[#34C759]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">Apple Secure Enclave (Sim)</span>
            </div>
          </div>
        </div>

        {/* 4 Apple-Style Circular Quick Action Buttons */}
        <div className="relative z-10 grid grid-cols-4 gap-2 pt-4 border-t border-white/[0.08]">
          {/* Action 1: Kirim */}
          <motion.button
            whileTap={iosQuickTap}
            type="button"
            onClick={onOpenSend}
            className="flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-white/5 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg shadow-white/10 group-hover:bg-[#F2F2F7] transition-colors">
              <Send className="w-5 h-5 -rotate-12 translate-x-0.5" />
            </div>
            <span className="text-xs font-semibold text-white mt-2">
              Kirim
            </span>
          </motion.button>

          {/* Action 2: Minta / QR */}
          <motion.button
            whileTap={iosQuickTap}
            type="button"
            onClick={onOpenReceiveQr}
            className="flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-white/5 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center border border-white/10 backdrop-blur-md group-hover:bg-white/15 transition-colors">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-[#8E8E93] group-hover:text-white mt-2 transition-colors">
              Minta QR
            </span>
          </motion.button>

          {/* Action 3: Isi Saldo / Top Up */}
          <motion.button
            whileTap={iosQuickTap}
            type="button"
            onClick={onOpenTopUp}
            className="flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-white/5 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center border border-white/10 backdrop-blur-md group-hover:bg-white/15 transition-colors">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-[#8E8E93] group-hover:text-white mt-2 transition-colors">
              Isi Saldo
            </span>
          </motion.button>

          {/* Action 4: Riwayat Mutasi */}
          <motion.button
            whileTap={iosQuickTap}
            type="button"
            onClick={onOpenHistory}
            className="flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-white/5 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center border border-white/10 backdrop-blur-md group-hover:bg-white/15 transition-colors">
              <History className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-[#8E8E93] group-hover:text-white mt-2 transition-colors">
              Riwayat
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* Mini Monthly Flow Strip (iOS Inset Grouped Cards) */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <motion.div 
          whileTap={iosSubtleTap}
          className="flex items-center justify-between p-3.5 rounded-[22px] bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-sm transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#34C759]/15 text-[#34C759]">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5px]" />
            </div>
            <div>
              <p className="text-[11px] text-[#8E8E93] font-medium">Uang Masuk</p>
              <p className="text-xs sm:text-sm font-bold tabular-nums text-[#34C759] font-mono">
                {formatCurrency(totalIncome, user.currency)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileTap={iosSubtleTap}
          className="flex items-center justify-between p-3.5 rounded-[22px] bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-sm transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#8E8E93]/15 text-[#000000] dark:text-[#FFFFFF]">
              <TrendingDown className="w-4 h-4 stroke-[2.5px]" />
            </div>
            <div>
              <p className="text-[11px] text-[#8E8E93] font-medium">Pengeluaran</p>
              <p className="text-xs sm:text-sm font-bold tabular-nums text-[#000000] dark:text-[#FFFFFF] font-mono">
                {formatCurrency(totalExpense, user.currency)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
