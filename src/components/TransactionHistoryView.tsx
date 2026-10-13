import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  Filter, 
  FileSpreadsheet, 
  ChevronRight,
  Users
} from 'lucide-react';
import { Transaction, UserProfile, TransactionCategory, CATEGORY_DETAILS } from '../types';
import { formatCurrency, formatDateRelative } from '../utils/formatters';
import { exportTransactionsToCSV } from '../utils/export';
import { sounds } from '../utils/sound';
import { iosQuickTap, iosSubtleTap } from '../utils/motion';

interface TransactionHistoryViewProps {
  transactions: Transaction[];
  user: UserProfile;
  onSelectTransaction: (tx: Transaction) => void;
  onInitiateTransfer: () => void;
  onSplitBill?: (tx: Transaction) => void;
}

export const TransactionHistoryView: React.FC<TransactionHistoryViewProps> = ({
  transactions,
  user,
  onSelectTransaction,
  onInitiateTransfer,
  onSplitBill,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === 'in' && !(tx.type === 'transfer_in' || tx.type === 'top_up')) {
      return false;
    }
    if (filterType === 'out' && !(tx.type === 'transfer_out' || tx.type === 'qris_payment')) {
      return false;
    }
    if (selectedCategory !== 'all' && tx.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = tx.recipientName.toLowerCase().includes(q) || tx.senderName.toLowerCase().includes(q);
      const matchRef = tx.referenceNumber.toLowerCase().includes(q);
      const matchNote = tx.note.toLowerCase().includes(q);
      return matchName || matchRef || matchNote;
    }
    return true;
  });

  const handleExportCSV = () => {
    exportTransactionsToCSV(filteredTransactions, `Laporan_Transaksi_KaiPay_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#000000] dark:text-[#FFFFFF]">
            Riwayat Mutasi & Transaksi
          </h2>
          <p className="text-xs text-[#6C6C70] dark:text-[#8E8E93] mt-0.5">
            Daftar lengkap seluruh aktivitas pembayaran, transfer, dan pengisian saldo
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={iosQuickTap}
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-full bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] text-xs font-semibold text-[#000000] dark:text-[#FFFFFF] hover:bg-[#F2F2F7] dark:hover:bg-[#2C2C2E] transition-colors shadow-sm"
            title="Ekspor CSV Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#34C759]" />
            <span>Ekspor CSV</span>
          </motion.button>
        </div>
      </div>

      {/* Filter Toolbar (iOS Grouped Box) */}
      <div className="p-4 rounded-[24px] bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] space-y-3 shadow-sm">
        {/* iOS Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari transaksi berdasarkan nama, catatan, atau no referensi..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#767680]/12 dark:bg-[#767680]/24 border border-transparent text-xs font-medium text-[#000000] dark:text-[#FFFFFF] placeholder-[#8E8E93] focus:bg-white dark:focus:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
          />
          <Search className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-3.5" />
        </div>

        {/* iOS Segmented Filter Controls & Category Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {/* iOS Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-[#767680]/12 dark:bg-[#767680]/24 rounded-xl">
            {(['all', 'in', 'out'] as const).map((mode) => {
              const label = mode === 'all' ? 'Semua' : mode === 'in' ? 'Uang Masuk' : 'Uang Keluar';
              const isActive = filterType === mode;
              return (
                <motion.button
                  key={mode}
                  whileTap={iosQuickTap}
                  type="button"
                  onClick={() => setFilterType(mode)}
                  className={`py-1.5 px-3 text-xs rounded-lg transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-white dark:bg-[#636366] text-[#000000] dark:text-[#FFFFFF] shadow-sm font-semibold'
                      : 'text-[#6C6C70] dark:text-[#8E8E93] hover:text-[#000000] dark:hover:text-[#FFFFFF]'
                  }`}
                >
                  {label}
                </motion.button>
              );
            })}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#8E8E93]" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-3 rounded-xl bg-[#767680]/12 dark:bg-[#767680]/24 text-xs font-medium text-[#000000] dark:text-[#FFFFFF] border-none focus:ring-2 focus:ring-[#007AFF]"
            >
              <option value="all">Semua Kategori</option>
              {Object.keys(CATEGORY_DETAILS).map((k) => (
                <option key={k} value={k}>
                  {CATEGORY_DETAILS[k as TransactionCategory].label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List (iOS Inset Grouped Table) */}
      <div className="rounded-[26px] bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] overflow-hidden shadow-sm divide-y divide-[#E5E5EA] dark:divide-[#2C2C2E]">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#8E8E93] flex items-center justify-center mb-3">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF]">
              Tidak Ada Transaksi Ditemukan
            </h3>
            <p className="text-xs text-[#6C6C70] dark:text-[#8E8E93] max-w-sm mt-1">
              Tidak ada catatan mutasi yang cocok dengan kriteria filter atau pencarian Anda.
            </p>
            <motion.button
              whileTap={iosQuickTap}
              type="button"
              onClick={onInitiateTransfer}
              className="mt-4 py-2 px-4 rounded-full bg-[#007AFF] text-white text-xs font-bold hover:bg-[#0062CC] transition-colors"
            >
              Kirim Uang Sekarang
            </motion.button>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isIncome = tx.type === 'transfer_in' || tx.type === 'top_up';
            return (
              <motion.div
                key={tx.id}
                whileTap={iosSubtleTap}
                onClick={() => onSelectTransaction(tx)}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors cursor-pointer group"
              >
                {/* Left: Icon & Description */}
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    isIncome 
                      ? 'bg-[#34C759]/15 text-[#34C759]' 
                      : 'bg-[#8E8E93]/15 text-[#000000] dark:text-[#FFFFFF]'
                  }`}>
                    {isIncome ? (
                      <ArrowDownLeft className="w-5 h-5 stroke-[2.2px]" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 stroke-[2.2px]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF] truncate">
                      {isIncome ? tx.senderName : tx.recipientName}
                    </h4>

                    {/* Metadata */}
                    <div className="flex items-center gap-2 text-xs text-[#6C6C70] dark:text-[#8E8E93] mt-0.5">
                      <span className="capitalize">{tx.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDateRelative(tx.timestamp)}</span>
                      {tx.note && (
                        <>
                          <span aria-hidden="true" className="hidden sm:inline">·</span>
                          <span className="hidden sm:inline truncate max-w-[120px]">{tx.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Chevron */}
                <div className="text-right shrink-0 flex items-center gap-3">
                  <div>
                    <span className={`text-sm sm:text-base font-bold tabular-nums font-mono block ${
                      isIncome 
                        ? 'text-[#34C759]' 
                        : 'text-[#000000] dark:text-[#FFFFFF]'
                    }`}>
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount, user.currency)}
                    </span>
                    <span className="text-[11px] text-[#8E8E93] font-mono block">
                      {tx.referenceNumber.slice(-8)}
                    </span>
                    {!isIncome && onSplitBill && (
                      <motion.button
                        whileTap={iosQuickTap}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sounds.playHapticClick();
                          onSplitBill(tx);
                        }}
                        className="px-2 py-0.5 mt-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-[#34C759] text-[10px] font-semibold flex items-center gap-1 transition-colors ml-auto"
                        title="Bagi tagihan transaksi ini"
                      >
                        <Users className="w-3 h-3" />
                        <span>Split</span>
                      </motion.button>
                    )}
                  </div>

                  <ChevronRight className="w-4 h-4 text-[#C7C7CC] dark:text-[#48484A] group-hover:translate-x-0.5 transition-transform hidden sm:block" />
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
