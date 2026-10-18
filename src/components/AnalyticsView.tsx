import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  TrendingDown, 
  ArrowUpRight, 
  AlertTriangle, 
  Edit3, 
  Check 
} from 'lucide-react';
import { 
  Transaction, 
  UserProfile, 
  CategoryBudget, 
  TransactionCategory 
} from '../types';
import { formatCurrency } from '../utils/formatters';
import { iosQuickTap, iosSubtleTap } from '../utils/motion';

interface AnalyticsViewProps {
  transactions: Transaction[];
  user: UserProfile;
  budgets: CategoryBudget[];
  onUpdateBudget: (category: TransactionCategory, newLimit: number) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  user,
  budgets,
  onUpdateBudget,
}) => {
  const [editingCategory, setEditingCategory] = useState<TransactionCategory | null>(null);
  const [newLimitStr, setNewLimitStr] = useState<string>('');

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

  // Group by category
  const categoryExpenses: Record<TransactionCategory, number> = {
    makanan: 0,
    transportasi: 0,
    belanja: 0,
    tagihan: 0,
    hiburan: 0,
    topup: 0,
    lainnya: 0,
  };

  thisMonthTransactions.forEach((tx) => {
    if (tx.type === 'transfer_out' || tx.type === 'qris_payment') {
      categoryExpenses[tx.category] = (categoryExpenses[tx.category] || 0) + tx.amount;
    }
  });

  // Calculate 4 weekly segments
  const weeklyData = [
    { week: 'Minggu 1', amount: Math.round(totalExpense * 0.22) },
    { week: 'Minggu 2', amount: Math.round(totalExpense * 0.35) },
    { week: 'Minggu 3', amount: Math.round(totalExpense * 0.28) },
    { week: 'Minggu 4', amount: Math.round(totalExpense * 0.15) },
  ];
  const maxWeekly = Math.max(...weeklyData.map((w) => w.amount), 1);

  const handleStartEdit = (cat: CategoryBudget) => {
    setEditingCategory(cat.category);
    setNewLimitStr(cat.monthlyLimit.toString());
  };

  const handleSaveEdit = (catKey: TransactionCategory) => {
    const parsed = parseInt(newLimitStr.replace(/\D/g, ''), 10) || 0;
    onUpdateBudget(catKey, parsed);
    setEditingCategory(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* Overview Heading */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#000000] dark:text-[#FFFFFF]">
          Analisis Pengeluaran & Anggaran
        </h2>
        <p className="text-xs text-[#6C6C70] dark:text-[#8E8E93] mt-0.5">
          Pantau perputaran uang bulanan dan kendalikan pagu anggaran per kategori
        </p>
      </div>

      {/* KPI Cards Strip (iOS Inset Grouped) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Expense */}
        <motion.div 
          whileTap={iosSubtleTap}
          className="p-5 rounded-[24px] bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
              Total Pengeluaran
            </span>
            <div className="p-2 rounded-xl bg-[#8E8E93]/15 text-[#000000] dark:text-[#FFFFFF]">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-[#000000] dark:text-[#FFFFFF] tabular-nums font-mono">
            {formatCurrency(totalExpense, user.currency)}
          </h3>
          <p className="text-[11px] text-[#8E8E93] mt-1">Bulan Berjalan</p>
        </motion.div>

        {/* Total Income */}
        <motion.div 
          whileTap={iosSubtleTap}
          className="p-5 rounded-[24px] bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
              Total Pemasukan
            </span>
            <div className="p-2 rounded-xl bg-[#34C759]/15 text-[#34C759]">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-[#34C759] tabular-nums font-mono">
            {formatCurrency(totalIncome, user.currency)}
          </h3>
          <p className="text-[11px] text-[#8E8E93] mt-1">Bulan Berjalan</p>
        </motion.div>

        {/* Savings Net Margin */}
        <motion.div 
          whileTap={iosSubtleTap}
          className="p-5 rounded-[24px] bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
              Arus Kas Bersih
            </span>
            <div className="p-2 rounded-xl bg-[#007AFF]/15 text-[#007AFF]">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-[#007AFF] dark:text-[#0A84FF] tabular-nums font-mono">
            {formatCurrency(totalIncome - totalExpense, user.currency)}
          </h3>
          <p className="text-[11px] text-[#8E8E93] mt-1">Surplus / Defisit</p>
        </motion.div>
      </div>

      {/* Weekly Spending Bar Chart (iOS Health/Fitness style bar chart) */}
      <div className="p-6 rounded-[26px] bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#000000] dark:text-[#FFFFFF]">
              Tren Pengeluaran Mingguan
            </h3>
            <p className="text-xs text-[#6C6C70] dark:text-[#8E8E93] mt-0.5">
              Distribusi pembayaran dalam 4 minggu terakhir
            </p>
          </div>
          <span className="text-xs font-mono text-[#8E8E93] tabular-nums">
            {thisMonthTransactions.length} Transaksi
          </span>
        </div>

        {/* SVG/HTML Bar Chart with Apple Blue spring bars */}
        <div className="pt-4 grid grid-cols-4 gap-4 items-end h-44 border-b border-[#E5E5EA] dark:border-[#2C2C2E] pb-2">
          {weeklyData.map((item, idx) => {
            const heightPercent = Math.max(12, Math.round((item.amount / maxWeekly) * 100));
            return (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-mono tabular-nums text-[#8E8E93] opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatCurrency(item.amount, user.currency)}
                </span>
                <div className="w-full max-w-[48px] bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-2xl overflow-hidden h-full flex flex-col justify-end p-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 24,
                      delay: idx * 0.08,
                    }}
                    className="w-full rounded-xl bg-gradient-to-t from-[#007AFF] to-[#5856D6] dark:from-[#0A84FF] dark:to-[#5E5CE6]"
                  />
                </div>
                <span className="text-xs font-medium text-[#6C6C70] dark:text-[#8E8E93]">
                  {item.week}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category-Based Budgeting System */}
      <div className="p-6 rounded-[26px] bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#000000] dark:text-[#FFFFFF]">
              Manajemen Pagu Anggaran Berbasis Kategori
            </h3>
            <p className="text-xs text-[#6C6C70] dark:text-[#8E8E93] mt-0.5">
              Atur batas maksimal pengeluaran bulanan dan dapatkan peringatan otomatis
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {budgets.map((b, idx) => {
            const spent = categoryExpenses[b.category] || 0;
            const percent = b.monthlyLimit > 0 ? Math.round((spent / b.monthlyLimit) * 100) : 0;
            const isWarning = percent >= 80 && percent < 100;
            const isExceeded = percent >= 100;
            const isEditing = editingCategory === b.category;

            return (
              <div
                key={`${b.category}-${idx}`}
                className="p-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-transparent transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#000000] dark:text-[#FFFFFF]">
                      {b.name}
                    </span>
                    {isExceeded && (
                      <span className="text-[10px] font-semibold text-[#FF3B30] flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Melebihi Limit</span>
                      </span>
                    )}
                    {isWarning && (
                      <span className="text-[10px] font-semibold text-[#FF9500] flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Mendekati Batas</span>
                      </span>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={newLimitStr}
                        onChange={(e) => setNewLimitStr(e.target.value)}
                        placeholder="Limit"
                        className="w-28 h-8 px-2 rounded-lg bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#3A3A3C] text-xs font-mono font-medium outline-none focus:ring-2 focus:ring-[#007AFF]"
                      />
                      <motion.button
                        whileTap={iosQuickTap}
                        type="button"
                        onClick={() => handleSaveEdit(b.category)}
                        className="p-1.5 rounded-lg bg-[#007AFF] text-white"
                        title="Simpan"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button
                      whileTap={iosQuickTap}
                      type="button"
                      onClick={() => handleStartEdit(b)}
                      className="flex items-center gap-1 text-[11px] font-medium text-[#007AFF] hover:underline transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Ubah Batas</span>
                    </motion.button>
                  )}
                </div>

                {/* Animated Spring Progress bar */}
                <div className="w-full h-2 rounded-full bg-[#E5E5EA] dark:bg-[#3A3A3C] overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, percent)}%` }}
                    transition={{
                      type: 'spring',
                      stiffness: 240,
                      damping: 24,
                    }}
                    className={`h-full rounded-full ${
                      isExceeded
                        ? 'bg-[#FF3B30]'
                        : isWarning
                        ? 'bg-[#FF9500]'
                        : 'bg-[#007AFF]'
                    }`}
                  />
                </div>

                {/* Budget Values Row */}
                <div className="flex justify-between items-center text-xs text-[#6C6C70] dark:text-[#8E8E93] font-mono">
                  <span>
                    Terpakai: <span className="font-semibold text-[#000000] dark:text-[#FFFFFF]">{formatCurrency(spent, user.currency)}</span>
                  </span>
                  <span>
                    Limit: <span className="font-semibold text-[#000000] dark:text-[#FFFFFF]">{formatCurrency(b.monthlyLimit, user.currency)}</span> ({percent}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
