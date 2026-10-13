import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CreditCard, 
  Building2, 
  ArrowRight
} from 'lucide-react';
import { UserProfile, Transaction } from '../types';
import { formatCurrency, generateReferenceNumber } from '../utils/formatters';
import { generateTransactionHash } from '../utils/crypto';
import { iosSheetVariants, iosBackdropVariants, iosQuickTap } from '../utils/motion';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  currentBalance: number;
  onCompleteTopUp: (transaction: Transaction, newBalance?: number) => void;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({
  isOpen,
  onClose,
  user,
  currentBalance,
  onCompleteTopUp,
}) => {
  const [mode, setMode] = useState<'topup' | 'direct_set'>('topup');
  const [amountStr, setAmountStr] = useState<string>('500000');
  const [directBalanceStr, setDirectBalanceStr] = useState<string>(currentBalance.toString());
  const [selectedMethod, setSelectedMethod] = useState<string>('BCA Virtual Account');
  const [isProcessing, setIsProcessing] = useState(false);

  const presets = [50000, 100000, 250000, 500000, 1000000, 2000000];

  const handleAmountChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setAmountStr(clean);
  };

  const handleDirectChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setDirectBalanceStr(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const refNumber = generateReferenceNumber();
    const timestamp = new Date().toISOString();

    if (mode === 'direct_set') {
      const newBal = directBalanceStr ? parseInt(directBalanceStr, 10) : 0;
      const diff = newBal - currentBalance;
      
      const hash = await generateTransactionHash({
        referenceNumber: refNumber,
        sender: 'Simulasi Saldo KaiPay',
        recipient: user.name,
        amount: Math.abs(diff),
        timestamp,
      });

      const tx: Transaction = {
        id: `tx_${Date.now()}`,
        referenceNumber: refNumber,
        type: diff >= 0 ? 'top_up' : 'transfer_out',
        amount: Math.abs(diff),
        timestamp,
        recipientName: user.name,
        recipientPhone: user.phone,
        senderName: 'Penyesuaian Saldo Virtual',
        category: 'topup',
        note: `Penyesuaian saldo manual menjadi ${formatCurrency(newBal, user.currency)}`,
        status: 'success',
        paymentMethod: 'Simulasi Saldo Manual',
        securityHash: hash,
      };

      setTimeout(() => {
        setIsProcessing(false);
        onCompleteTopUp(tx, newBal);
      }, 500);
    } else {
      const topUpAmount = amountStr ? parseInt(amountStr, 10) : 0;
      if (topUpAmount <= 0) {
        setIsProcessing(false);
        return;
      }

      const hash = await generateTransactionHash({
        referenceNumber: refNumber,
        sender: selectedMethod,
        recipient: user.name,
        amount: topUpAmount,
        timestamp,
      });

      const tx: Transaction = {
        id: `tx_${Date.now()}`,
        referenceNumber: refNumber,
        type: 'top_up',
        amount: topUpAmount,
        timestamp,
        recipientName: user.name,
        recipientPhone: user.phone,
        senderName: selectedMethod,
        category: 'topup',
        note: `Top Up Saldo via ${selectedMethod}`,
        status: 'success',
        paymentMethod: selectedMethod,
        securityHash: hash,
      };

      setTimeout(() => {
        setIsProcessing(false);
        onCompleteTopUp(tx);
      }, 500);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            variants={iosBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            variants={iosSheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-[#E5E5EA] dark:border-[#2C2C2E] overflow-hidden flex flex-col max-h-[90vh] z-10"
          >
            {/* iOS Grab Handle */}
            <div className="w-10 h-1.5 bg-[#8E8E93]/40 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E5EA] dark:border-[#2C2C2E]">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#000000] dark:text-[#FFFFFF]">
                  {mode === 'topup' ? 'Isi Saldo Virtual' : 'Atur Saldo Bebas'}
                </h3>
              </div>
              <motion.button
                whileTap={iosQuickTap}
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-[#8E8E93] hover:text-[#000000] dark:hover:text-[#FFFFFF] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Mode Switcher Tabs (iOS Segmented Control) */}
            <div className="p-4 pb-0">
              <div className="flex items-center gap-1 p-1 bg-[#767680]/12 dark:bg-[#767680]/24 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setMode('topup')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                    mode === 'topup'
                      ? 'bg-white dark:bg-[#636366] text-[#000000] dark:text-[#FFFFFF] shadow-sm'
                      : 'text-[#6C6C70] dark:text-[#8E8E93] hover:text-[#000000] dark:hover:text-[#FFFFFF]'
                  }`}
                >
                  Simulasi Top Up
                </button>
                <button
                  type="button"
                  onClick={() => setMode('direct_set')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                    mode === 'direct_set'
                      ? 'bg-white dark:bg-[#636366] text-[#000000] dark:text-[#FFFFFF] shadow-sm'
                      : 'text-[#6C6C70] dark:text-[#8E8E93] hover:text-[#000000] dark:hover:text-[#FFFFFF]'
                  }`}
                >
                  Set Saldo Bebas
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4">
              {mode === 'topup' ? (
                <>
                  {/* Top Up Amount */}
                  <div>
                    <label className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1">
                      Nominal Isi Saldo
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-lg font-bold text-[#8E8E93] font-mono">
                        Rp
                      </span>
                      <input
                        type="text"
                        value={amountStr}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        placeholder="0"
                        className="w-full h-14 pl-12 pr-4 rounded-2xl bg-[#767680]/12 dark:bg-[#767680]/24 border border-transparent text-2xl font-bold font-mono tabular-nums text-[#000000] dark:text-[#FFFFFF] focus:bg-white dark:focus:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
                      />
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div className="grid grid-cols-3 gap-2">
                    {presets.map((p) => (
                      <motion.button
                        key={p}
                        whileTap={iosQuickTap}
                        type="button"
                        onClick={() => setAmountStr(p.toString())}
                        className={`py-2 px-1 text-xs font-mono font-medium rounded-xl border transition-all ${
                          amountStr === p.toString()
                            ? 'bg-[#007AFF] text-white border-transparent shadow-sm'
                            : 'bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 text-[#1C1C1E] dark:text-[#F2F2F7] border-transparent hover:border-[#007AFF]/40'
                        }`}
                      >
                        {formatCurrency(p, 'IDR')}
                      </motion.button>
                    ))}
                  </div>

                  {/* Payment Methods */}
                  <div>
                    <label className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-2">
                      Pilih Saluran Pembayaran
                    </label>
                    <div className="space-y-2">
                      {[
                        { id: 'BCA Virtual Account', icon: Building2, desc: 'Instan tanpa biaya admin' },
                        { id: 'Mandiri Livin Virtual', icon: Building2, desc: 'Instan verifikasi' },
                        { id: 'BRI Direct Debit', icon: Building2, desc: 'Notifikasi otomatis' },
                        { id: 'Kartu Debit Virtual', icon: CreditCard, desc: 'Visa / Mastercard' },
                      ].map((m) => (
                        <motion.button
                          key={m.id}
                          whileTap={iosQuickTap}
                          type="button"
                          onClick={() => setSelectedMethod(m.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                            selectedMethod === m.id
                              ? 'border-[#007AFF] bg-[#007AFF]/5 dark:bg-[#007AFF]/10 shadow-sm'
                              : 'border-transparent bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 hover:bg-[#E5E5EA] dark:hover:bg-[#2C2C2E]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-white dark:bg-[#3A3A3C] text-[#007AFF] shadow-sm">
                              <m.icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#000000] dark:text-[#FFFFFF]">
                                {m.id}
                              </p>
                              <p className="text-[11px] text-[#6C6C70] dark:text-[#8E8E93]">
                                {m.desc}
                              </p>
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            selectedMethod === m.id 
                              ? 'border-[#007AFF] bg-[#007AFF] text-white' 
                              : 'border-[#8E8E93]'
                          }`}>
                            {selectedMethod === m.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 text-xs text-[#6C6C70] dark:text-[#8E8E93] leading-relaxed">
                      Fitur ini untuk keperluan simulasi & pengujian personal. Anda dapat mengatur angka saldo berapa pun secara bebas tanpa batasan.
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1">
                        Set Angka Saldo Virtual Baru
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-lg font-bold text-[#8E8E93] font-mono">
                          Rp
                        </span>
                        <input
                          type="text"
                          value={directBalanceStr}
                          onChange={(e) => handleDirectChange(e.target.value)}
                          placeholder="0"
                          className="w-full h-14 pl-12 pr-4 rounded-2xl bg-[#767680]/12 dark:bg-[#767680]/24 border border-transparent text-2xl font-bold font-mono tabular-nums text-[#000000] dark:text-[#FFFFFF] focus:bg-white dark:focus:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[1000000, 5000000, 10000000, 25000000, 50000000, 100000000].map((num) => (
                        <motion.button
                          key={num}
                          whileTap={iosQuickTap}
                          type="button"
                          onClick={() => setDirectBalanceStr(num.toString())}
                          className="py-2 text-[11px] font-mono font-medium rounded-xl border border-transparent bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 hover:bg-[#E5E5EA] dark:hover:bg-[#2C2C2E] text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors"
                        >
                          {formatCurrency(num, 'IDR')}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <motion.button
                whileTap={iosQuickTap}
                type="submit"
                disabled={isProcessing}
                className="w-full h-12 rounded-full bg-[#007AFF] hover:bg-[#0062CC] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Memproses Transaksi...</span>
                ) : (
                  <>
                    <span>{mode === 'topup' ? 'Isi Saldo Sekarang' : 'Terapkan Saldo'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
