import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  ArrowRight, 
  Fingerprint, 
  ShieldCheck, 
  Delete, 
  AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  UserProfile, 
  QuickContact, 
  Transaction, 
  TransactionCategory, 
  CATEGORY_DETAILS 
} from '../types';
import { formatCurrency, generateReferenceNumber } from '../utils/formatters';
import { generateTransactionHash, verifyPin } from '../utils/crypto';
import { sounds } from '../utils/sound';
import { FaceIdModal } from './FaceIdModal';
import { 
  iosSheetVariants, 
  iosBackdropVariants, 
  iosQuickTap, 
  iosSpringTransition 
} from '../utils/motion';

interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  user: UserProfile;
  contacts: QuickContact[];
  preselectedRecipient?: { name: string; phone: string; amount?: number; note?: string } | null;
  onCompleteTransfer: (transaction: Transaction) => void;
}

export const SendMoneyModal: React.FC<SendMoneyModalProps> = ({
  isOpen,
  onClose,
  balance,
  user,
  contacts,
  preselectedRecipient,
  onCompleteTransfer,
}) => {
  const [step, setStep] = useState<'recipient' | 'amount' | 'auth'>('recipient');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [amountStr, setAmountStr] = useState<string>('');
  const [category, setCategory] = useState<TransactionCategory>('makanan');
  const [note, setNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auth state
  const [authMethod, setAuthMethod] = useState<'biometric' | 'pin'>('biometric');
  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [isFaceIdOpen, setIsFaceIdOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedRecipient) {
      setRecipientName(preselectedRecipient.name);
      setRecipientPhone(preselectedRecipient.phone);
      if (preselectedRecipient.amount && preselectedRecipient.amount > 0) {
        setAmount(preselectedRecipient.amount);
        setAmountStr(preselectedRecipient.amount.toString());
      }
      if (preselectedRecipient.note) {
        setNote(preselectedRecipient.note);
      }
      setStep('amount');
    } else {
      setStep('recipient');
      setRecipientName('');
      setRecipientPhone('');
      setAmount(0);
      setAmountStr('');
      setNote('');
    }
    setPinDigits([]);
    setAuthError(null);
  }, [preselectedRecipient, isOpen]);

  const quickAmounts = [20000, 50000, 100000, 250000, 500000, 1000000];

  const handleSelectContact = (contact: QuickContact) => {
    sounds.playHapticClick();
    setRecipientName(contact.name);
    setRecipientPhone(contact.phone);
    if (contact.recentCategory) {
      setCategory(contact.recentCategory);
    }
    setStep('amount');
  };

  const handleManualRecipientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientPhone.trim()) return;
    if (!recipientName.trim()) {
      setRecipientName(`Pengguna (${recipientPhone})`);
    }
    sounds.playHapticClick();
    setStep('amount');
  };

  const handleAmountChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setAmountStr(clean);
    setAmount(clean ? parseInt(clean, 10) : 0);
  };

  const handleQuickAmount = (val: number) => {
    sounds.playHapticClick();
    setAmount(val);
    setAmountStr(val.toString());
  };

  const handleProceedToAuth = () => {
    if (amount <= 0) {
      setAuthError('Nominal transfer harus lebih besar dari Rp 0');
      return;
    }
    if (amount > balance) {
      setAuthError('Saldo virtual tidak mencukupi untuk transfer ini');
      return;
    }
    sounds.playHapticClick();
    setAuthError(null);
    setPinDigits([]);
    setStep('auth');
  };

  const executeTransfer = async () => {
    const refNumber = generateReferenceNumber();
    const timestamp = new Date().toISOString();

    const hash = await generateTransactionHash({
      referenceNumber: refNumber,
      sender: user.name,
      recipient: recipientName,
      amount,
      timestamp,
    });

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      referenceNumber: refNumber,
      type: 'transfer_out',
      amount,
      timestamp,
      recipientName,
      recipientPhone,
      senderName: user.name,
      category,
      note: note.trim() || `Transfer ke ${recipientName}`,
      status: 'success',
      paymentMethod: 'KaiPay Saldo Virtual',
      securityHash: hash,
    };

    sounds.playApplePayChime();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#007AFF', '#34C759', '#FF9500', '#5856D6'],
    });

    onCompleteTransfer(newTx);
  };

  const handleBiometricAuth = () => {
    setAuthError(null);
    setIsFaceIdOpen(true);
  };

  const handlePinKey = (num: string) => {
    sounds.playHapticClick();
    if (pinDigits.length < 6) {
      const next = [...pinDigits, num];
      setPinDigits(next);
      if (next.length === 6) {
        const pinString = next.join('');
        if (verifyPin(pinString, user.pin) || pinString === '123456') {
          executeTransfer();
        } else {
          setAuthError('PIN salah. Coba lagi atau gunakan biometrik (PIN Demo: 123456)');
          setPinDigits([]);
        }
      }
    }
  };

  const handlePinDelete = () => {
    sounds.playHapticClick();
    setPinDigits((prev) => prev.slice(0, -1));
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

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
            className="relative w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-[#E5E5EA] dark:border-[#2C2C2E] overflow-hidden flex flex-col max-h-[90vh] z-10"
          >
            {/* iOS Grab Handle */}
            <div className="w-10 h-1.5 bg-[#8E8E93]/40 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

            {/* Top Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E5EA] dark:border-[#2C2C2E]">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#000000] dark:text-[#FFFFFF]">
                  {step === 'recipient' && 'Kirim Saldo'}
                  {step === 'amount' && 'Nominal & Catatan'}
                  {step === 'auth' && 'Verifikasi Keamanan Apple'}
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

            {/* STEP 1: SELECT RECIPIENT */}
            {step === 'recipient' && (
              <motion.div 
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={iosSpringTransition}
                className="p-5 overflow-y-auto flex-1 space-y-4"
              >
                {/* Search or manual phone */}
                <form onSubmit={handleManualRecipientSubmit} className="space-y-3">
                  <label className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider block">
                    Nomor Handphone / ID KaiPay
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={recipientPhone}
                      onChange={(e) => {
                        setRecipientPhone(e.target.value);
                        setSearchQuery(e.target.value);
                      }}
                      placeholder="Contoh: 0812-xxxx-xxxx"
                      className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#767680]/12 dark:bg-[#767680]/24 border border-transparent text-sm font-medium text-[#000000] dark:text-[#FFFFFF] placeholder-[#8E8E93] focus:bg-white dark:focus:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
                    />
                    <Search className="w-5 h-5 text-[#8E8E93] absolute left-3.5 top-3.5" />
                  </div>

                  {recipientPhone.trim().length >= 4 && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Nama Penerima (Opsional)"
                        className="w-full h-11 px-4 rounded-xl bg-[#767680]/12 dark:bg-[#767680]/24 border border-transparent text-xs font-medium text-[#000000] dark:text-[#FFFFFF] placeholder-[#8E8E93] focus:bg-white dark:focus:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                      />
                      <motion.button
                        whileTap={iosQuickTap}
                        type="submit"
                        className="w-full h-11 rounded-full bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <span>Lanjutkan Transfer ke Nomor Ini</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  )}
                </form>

                {/* Quick Contacts List */}
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-2.5">
                    Daftar Teman & Kontak
                  </span>
                  <div className="space-y-1.5">
                    {filteredContacts.map((contact) => (
                      <motion.button
                        key={contact.id}
                        whileTap={iosQuickTap}
                        type="button"
                        onClick={() => handleSelectContact(contact)}
                        className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 hover:bg-[#E5E5EA] dark:hover:bg-[#2C2C2E] border border-transparent transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={contact.avatarUrl}
                            alt={contact.name}
                            referrerPolicy="no-referrer"
                            className="w-11 h-11 rounded-2xl object-cover ring-1 ring-black/5 dark:ring-white/10"
                          />
                          <div>
                            <h4 className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF]">
                              {contact.name}
                            </h4>
                            <p className="text-xs font-mono text-[#8E8E93]">
                              {contact.phone}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#8E8E93]" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: INPUT AMOUNT & CATEGORY & NOTE */}
            {step === 'amount' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={iosSpringTransition}
                className="p-5 overflow-y-auto flex-1 space-y-4"
              >
                {/* Recipient Card */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#007AFF] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {recipientName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF]">
                        {recipientName}
                      </h4>
                      <p className="text-xs font-mono text-[#8E8E93]">
                        {recipientPhone}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep('recipient')}
                    className="text-xs text-[#007AFF] hover:underline font-medium"
                  >
                    Ganti
                  </button>
                </div>

                {/* Amount Input */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                      Nominal Transfer
                    </label>
                    <span className="text-xs text-[#8E8E93]">
                      Saldo: <span className="font-mono font-medium text-[#000000] dark:text-[#FFFFFF]">{formatCurrency(balance, user.currency)}</span>
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-lg font-bold text-[#8E8E93] font-mono">
                      Rp
                    </span>
                    <input
                      type="text"
                      value={amountStr}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      placeholder="0"
                      autoFocus
                      className="w-full h-14 pl-12 pr-4 rounded-2xl bg-[#767680]/12 dark:bg-[#767680]/24 border border-transparent text-2xl font-bold font-mono tabular-nums text-[#000000] dark:text-[#FFFFFF] focus:bg-white dark:focus:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
                    />
                  </div>
                </div>

                {/* Quick Chips with Tactile Bounce */}
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((q) => (
                    <motion.button
                      key={q}
                      whileTap={iosQuickTap}
                      type="button"
                      onClick={() => handleQuickAmount(q)}
                      className={`py-2 px-1 text-xs font-mono font-medium rounded-xl border transition-all ${
                        amount === q
                          ? 'bg-[#007AFF] text-white border-transparent shadow-sm'
                          : 'bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 text-[#1C1C1E] dark:text-[#F2F2F7] border-transparent hover:border-[#007AFF]/40'
                      }`}
                    >
                      {formatCurrency(q, 'IDR')}
                    </motion.button>
                  ))}
                </div>

                {/* Category Selector */}
                <div>
                  <label className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1.5">
                    Kategori Pengeluaran
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(Object.keys(CATEGORY_DETAILS) as TransactionCategory[])
                      .filter((c) => c !== 'topup')
                      .map((catKey) => {
                        const info = CATEGORY_DETAILS[catKey];
                        const isSelected = category === catKey;
                        return (
                          <motion.button
                            key={catKey}
                            whileTap={iosQuickTap}
                            type="button"
                            onClick={() => setCategory(catKey)}
                            className={`p-2 rounded-xl text-left border transition-all ${
                              isSelected
                                ? 'bg-[#007AFF] text-white border-transparent shadow-sm'
                                : 'bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 text-[#1C1C1E] dark:text-[#F2F2F7] border-transparent hover:border-[#007AFF]/40'
                            }`}
                          >
                            <p className="text-[11px] font-semibold truncate leading-tight">
                              {info.label.split(' ')[0]}
                            </p>
                          </motion.button>
                        );
                      })}
                  </div>
                </div>

                {/* Optional Note */}
                <div>
                  <label className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1.5">
                    Catatan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Misal: Bayar makan siang, uang bensin"
                    className="w-full h-11 px-4 rounded-xl bg-[#767680]/12 dark:bg-[#767680]/24 border border-transparent text-xs font-medium text-[#000000] dark:text-[#FFFFFF] placeholder-[#8E8E93] focus:bg-white dark:focus:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  />
                </div>

                {authError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <motion.button
                  whileTap={iosQuickTap}
                  type="button"
                  disabled={amount <= 0 || amount > balance}
                  onClick={handleProceedToAuth}
                  className="w-full h-12 rounded-full bg-[#007AFF] hover:bg-[#0062CC] text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <span>Lanjut ke Konfirmasi</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}

            {/* STEP 3: SECURITY AUTHENTICATION (BIOMETRIC / PIN) */}
            {step === 'auth' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={iosSpringTransition}
                className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center text-center space-y-5"
              >
                {/* Amount Summary */}
                <div>
                  <span className="text-xs text-[#8E8E93] uppercase tracking-wider">
                    Konfirmasi Transfer ke
                  </span>
                  <h3 className="text-lg font-bold text-[#000000] dark:text-[#FFFFFF] mt-0.5">
                    {recipientName}
                  </h3>
                  <p className="text-2xl font-extrabold font-mono text-[#000000] dark:text-[#FFFFFF] mt-1 tabular-nums">
                    {formatCurrency(amount, user.currency)}
                  </p>
                </div>

                {/* Auth Method Switcher (iOS Segmented Control) */}
                <div className="flex items-center gap-1 p-1 bg-[#767680]/12 dark:bg-[#767680]/24 rounded-2xl">
                  <motion.button
                    whileTap={iosQuickTap}
                    type="button"
                    onClick={() => setAuthMethod('biometric')}
                    className={`py-1.5 px-3 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                      authMethod === 'biometric'
                        ? 'bg-white dark:bg-[#636366] text-[#000000] dark:text-[#FFFFFF] shadow-sm'
                        : 'text-[#6C6C70] dark:text-[#8E8E93] hover:text-[#000000] dark:hover:text-[#FFFFFF]'
                    }`}
                  >
                    <Fingerprint className="w-3.5 h-3.5" />
                    <span>Touch / Face ID</span>
                  </motion.button>
                  <motion.button
                    whileTap={iosQuickTap}
                    type="button"
                    onClick={() => setAuthMethod('pin')}
                    className={`py-1.5 px-3 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                      authMethod === 'pin'
                        ? 'bg-white dark:bg-[#636366] text-[#000000] dark:text-[#FFFFFF] shadow-sm'
                        : 'text-[#6C6C70] dark:text-[#8E8E93] hover:text-[#000000] dark:hover:text-[#FFFFFF]'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>PIN 6 Digit</span>
                  </motion.button>
                </div>

                {/* BIOMETRIC MODE */}
                {authMethod === 'biometric' && (
                  <div className="py-4 flex flex-col items-center space-y-4">
                    <motion.button
                      whileTap={iosQuickTap}
                      type="button"
                      onClick={handleBiometricAuth}
                      disabled={isAuthenticating}
                      className={`w-24 h-24 rounded-full bg-[#007AFF] text-white flex items-center justify-center shadow-2xl transition-all ring-4 ring-[#007AFF]/25 ${
                        isAuthenticating ? 'scale-95 animate-pulse' : 'hover:scale-105'
                      }`}
                      aria-label="Pindai Touch ID atau Face ID"
                    >
                      <Fingerprint className="w-12 h-12" />
                    </motion.button>

                    <div>
                      <p className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF]">
                        {isAuthenticating ? 'Memverifikasi Apple Biometrik...' : 'Sentuh sensor atau Face ID'}
                      </p>
                      <p className="text-xs text-[#8E8E93] mt-1">
                        Ketuk ikon di atas untuk menyetujui transaksi via Secure Enclave
                      </p>
                    </div>
                  </div>
                )}

                {/* PIN MODE */}
                {authMethod === 'pin' && (
                  <div className="w-full max-w-xs space-y-4">
                    {/* 6 Digit Indicators */}
                    <div className="flex items-center justify-center gap-3 py-2">
                      {[0, 1, 2, 3, 4, 5].map((idx) => (
                        <div
                          key={idx}
                          className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                            pinDigits.length > idx
                              ? 'bg-[#007AFF] border-[#007AFF] scale-110'
                              : 'border-[#D1D1D6] dark:border-[#3A3A3C]'
                          }`}
                        />
                      ))}
                    </div>

                    {authError && (
                      <p className="text-xs text-[#FF3B30] font-medium">
                        {authError}
                      </p>
                    )}

                    {/* iOS Keypad */}
                    <div className="grid grid-cols-3 gap-2.5 pt-2">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                        <motion.button
                          key={digit}
                          whileTap={iosQuickTap}
                          type="button"
                          onClick={() => handlePinKey(digit)}
                          className="h-12 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] text-[#000000] dark:text-[#FFFFFF] font-mono font-bold text-lg transition-all"
                        >
                          {digit}
                        </motion.button>
                      ))}
                      <motion.button
                        whileTap={iosQuickTap}
                        type="button"
                        onClick={() => setStep('amount')}
                        className="h-12 rounded-2xl text-[#8E8E93] hover:text-[#000000] dark:hover:text-[#FFFFFF] text-xs font-semibold"
                      >
                        Batal
                      </motion.button>
                      <motion.button
                        key="0"
                        whileTap={iosQuickTap}
                        type="button"
                        onClick={() => handlePinKey('0')}
                        className="h-12 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] text-[#000000] dark:text-[#FFFFFF] font-mono font-bold text-lg transition-all"
                      >
                        0
                      </motion.button>
                      <motion.button
                        whileTap={iosQuickTap}
                        type="button"
                        onClick={handlePinDelete}
                        className="h-12 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] text-[#6C6C70] dark:text-[#8E8E93] flex items-center justify-center transition-all"
                        aria-label="Hapus digit"
                      >
                        <Delete className="w-5 h-5" />
                      </motion.button>
                    </div>

                    <p className="text-[11px] text-[#8E8E93]">
                      PIN Demo default: <span className="font-mono font-bold text-[#007AFF]">123456</span>
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      )}

      {/* 3D Face ID Authentication Overlay */}
      <FaceIdModal
        isOpen={isFaceIdOpen}
        onClose={() => setIsFaceIdOpen(false)}
        onSuccess={() => {
          setIsFaceIdOpen(false);
          executeTransfer();
        }}
        title="Autentikasi Face ID"
        subtitle={`Konfirmasi transfer ${formatCurrency(amount, user.currency)} ke ${recipientName}`}
      />
    </AnimatePresence>
  );
};
