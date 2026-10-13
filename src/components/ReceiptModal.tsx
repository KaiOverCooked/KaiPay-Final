import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  X, 
  Printer, 
  ShieldCheck, 
  Copy, 
  Check,
  Download,
  Image as ImageIcon
} from 'lucide-react';
import { Transaction, UserProfile } from '../types';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { printReceiptElement, downloadHdReceiptImage } from '../utils/export';
import { iosSheetVariants, iosBackdropVariants, iosQuickTap } from '../utils/motion';

interface ReceiptModalProps {
  transaction: Transaction | null;
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  user,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const isIncome = transaction.type === 'transfer_in' || transaction.type === 'top_up';

  const handleCopyDetails = () => {
    const text = `BUKTI TRANSAKSI KAIPAY
No. Ref: ${transaction.referenceNumber}
Tanggal: ${formatDateTime(transaction.timestamp)}
Status: ${transaction.status.toUpperCase()}
${isIncome ? 'Pengirim' : 'Penerima'}: ${isIncome ? transaction.senderName : transaction.recipientName}
Nominal: ${formatCurrency(transaction.amount, user.currency)}
Metode: ${transaction.paymentMethod}
E2E Hash: ${transaction.securityHash.slice(0, 16)}...`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop Dimmer */}
          <motion.div
            variants={iosBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Slide-Up Bottom Sheet */}
          <motion.div
            variants={iosSheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-[#E5E5EA] dark:border-[#2C2C2E] overflow-hidden max-h-[90vh] flex flex-col z-10"
          >
            {/* iOS Grab Handle */}
            <div className="w-10 h-1.5 bg-[#8E8E93]/40 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

            {/* Header Bar */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E5EA] dark:border-[#2C2C2E] no-print">
              <span className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                Struk Resmi KaiPay · Apple Style
              </span>
              <motion.button
                whileTap={iosQuickTap}
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-[#8E8E93] hover:text-[#000000] dark:hover:text-[#FFFFFF] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Printable Receipt Body */}
            <div id="printable-receipt" className="receipt-printable p-6 overflow-y-auto flex-1">
              {/* Logo & Status Badge */}
              <div className="flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="w-16 h-16 rounded-3xl bg-[#34C759]/15 text-[#34C759] flex items-center justify-center mb-3 ring-8 ring-[#34C759]/10"
                >
                  <CheckCircle2 className="w-9 h-9" />
                </motion.div>

                <span className="text-xs font-bold text-[#34C759] uppercase tracking-widest">
                  Transaksi Berhasil
                </span>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#000000] dark:text-[#FFFFFF] mt-1 tabular-nums font-mono">
                  {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, user.currency)}
                </h2>

                <p className="text-xs text-[#6C6C70] dark:text-[#8E8E93] mt-1">
                  {formatDateTime(transaction.timestamp)}
                </p>
              </div>

              {/* DANA-Style Receipt Jagged Divider */}
              <div className="my-5 border-t border-dashed border-[#D1D1D6] dark:border-[#3A3A3C] relative">
                <div className="absolute -left-8 -top-3 w-5 h-5 rounded-full bg-white dark:bg-[#1C1C1E] border-r border-[#E5E5EA] dark:border-[#2C2C2E]" />
                <div className="absolute -right-8 -top-3 w-5 h-5 rounded-full bg-white dark:bg-[#1C1C1E] border-l border-[#E5E5EA] dark:border-[#2C2C2E]" />
              </div>

              {/* Transaction Metadata Grid */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[#6C6C70] dark:text-[#8E8E93]">Nomor Referensi</span>
                  <span className="font-mono font-medium text-[#000000] dark:text-[#FFFFFF] select-all">
                    {transaction.referenceNumber}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[#6C6C70] dark:text-[#8E8E93]">
                    {isIncome ? 'Pengirim' : 'Penerima'}
                  </span>
                  <div className="text-right">
                    <span className="font-semibold text-[#000000] dark:text-[#FFFFFF] block">
                      {isIncome ? transaction.senderName : transaction.recipientName}
                    </span>
                    <span className="text-[11px] font-mono text-[#8E8E93]">
                      {transaction.recipientPhone}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[#6C6C70] dark:text-[#8E8E93]">Metode Pembayaran</span>
                  <span className="font-medium text-[#000000] dark:text-[#FFFFFF]">
                    {transaction.paymentMethod}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[#6C6C70] dark:text-[#8E8E93]">Kategori</span>
                  <span className="capitalize font-medium text-[#000000] dark:text-[#FFFFFF]">
                    {transaction.category}
                  </span>
                </div>

                {transaction.note && (
                  <div className="flex justify-between items-start py-1">
                    <span className="text-[#6C6C70] dark:text-[#8E8E93]">Catatan</span>
                    <span className="text-right font-medium text-[#000000] dark:text-[#FFFFFF] max-w-[60%] italic">
                      "{transaction.note}"
                    </span>
                  </div>
                )}
              </div>

              {/* Pricing Details Breakdown (iOS Inset Grouped) */}
              <div className="mt-5 p-3.5 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-transparent">
                <div className="flex justify-between text-xs py-1">
                  <span className="text-[#6C6C70] dark:text-[#8E8E93]">Nominal Transfer</span>
                  <span className="font-mono tabular-nums text-[#000000] dark:text-[#FFFFFF]">
                    {formatCurrency(transaction.amount, user.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-[#6C6C70] dark:text-[#8E8E93]">Biaya Layanan / Admin</span>
                  <span className="font-mono tabular-nums text-[#34C759] font-semibold">
                    Rp 0 (Gratis)
                  </span>
                </div>
                <div className="border-t border-[#E5E5EA] dark:border-[#38383A] my-2 pt-2 flex justify-between text-xs font-bold">
                  <span className="text-[#000000] dark:text-[#FFFFFF]">Total Transaksi</span>
                  <span className="font-mono tabular-nums text-[#000000] dark:text-[#FFFFFF]">
                    {formatCurrency(transaction.amount, user.currency)}
                  </span>
                </div>
              </div>

              {/* Cryptographic E2E Verification Footer */}
              <div className="mt-5 flex items-center justify-between p-3 rounded-xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/40 text-[11px] text-[#6C6C70] dark:text-[#8E8E93]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#34C759]" />
                  <span>Apple Secure Hash (E2E):</span>
                </div>
                <span className="font-mono text-[#000000] dark:text-[#FFFFFF]">
                  {transaction.securityHash.slice(0, 10)}...{transaction.securityHash.slice(-6)}
                </span>
              </div>
            </div>

            {/* Modal Action Buttons (Hidden when printing PDF) */}
            <div className="p-4 bg-white dark:bg-[#1C1C1E] border-t border-[#E5E5EA] dark:border-[#2C2C2E] flex flex-col gap-2.5 no-print">
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  whileTap={iosQuickTap}
                  type="button"
                  onClick={() => downloadHdReceiptImage(transaction, user.currency)}
                  className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-full bg-[#34C759] hover:bg-[#2EB34F] text-white text-xs font-bold transition-all shadow-md shadow-[#34C759]/25"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Unduh Struk HD</span>
                </motion.button>

                <motion.button
                  whileTap={iosQuickTap}
                  type="button"
                  onClick={() => printReceiptElement('printable-receipt')}
                  className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-full bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / PDF</span>
                </motion.button>
              </div>

              <motion.button
                whileTap={iosQuickTap}
                type="button"
                onClick={handleCopyDetails}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] text-[#000000] dark:text-[#FFFFFF] text-xs font-semibold transition-colors w-full"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#34C759]" />
                    <span className="text-[#34C759] font-bold">Rincian Struk Berhasil Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Rincian Teks</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
