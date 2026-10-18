import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Users, 
  UserPlus, 
  Check, 
  Copy, 
  Share2, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuickContact, UserProfile, Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';
import { sounds } from '../utils/sound';
import { iosSheetVariants, iosBackdropVariants, iosQuickTap } from '../utils/motion';

interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  contacts: QuickContact[];
  initialAmount?: number;
  initialMerchantName?: string;
  onCompleteSplit: (summary: {
    totalAmount: number;
    merchantName: string;
    participants: { name: string; phone: string; amount: number }[];
    myShare: number;
  }) => void;
}

export const SplitBillModal: React.FC<SplitBillModalProps> = ({
  isOpen,
  onClose,
  user,
  contacts,
  initialAmount = 120000,
  initialMerchantName = 'Tagihan QRIS',
  onCompleteSplit,
}) => {
  const [totalAmount, setTotalAmount] = useState<number>(initialAmount);
  const [totalStr, setTotalStr] = useState<string>(initialAmount.toString());
  const [merchantName, setMerchantName] = useState<string>(initialMerchantName);
  
  // Selected participants
  const [selectedContacts, setSelectedContacts] = useState<QuickContact[]>([]);
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendPhone, setNewFriendPhone] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const [copiedMessage, setCopiedMessage] = useState(false);
  const [splitMode, setSplitMode] = useState<'equal' | 'custom'>('equal');

  useEffect(() => {
    if (initialAmount > 0) {
      setTotalAmount(initialAmount);
      setTotalStr(initialAmount.toString());
    }
    if (initialMerchantName) {
      setMerchantName(initialMerchantName);
    }
    // Pre-select first 2 contacts for smooth instant preview
    if (contacts.length >= 2 && selectedContacts.length === 0) {
      setSelectedContacts(contacts.slice(0, 2));
    }
  }, [initialAmount, initialMerchantName, contacts]);

  if (!isOpen) return null;

  const totalPeople = selectedContacts.length + 1; // +1 includes user
  const equalShare = totalPeople > 0 ? Math.round(totalAmount / totalPeople) : totalAmount;

  const handleToggleContact = (contact: QuickContact) => {
    sounds.playHapticClick();
    if (selectedContacts.some((c) => c.id === contact.id)) {
      setSelectedContacts((prev) => prev.filter((c) => c.id !== contact.id));
    } else {
      setSelectedContacts((prev) => [...prev, contact]);
    }
  };

  const handleAddNewFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;
    const newContact: QuickContact = {
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: newFriendName.trim(),
      phone: newFriendPhone.trim() || '0812-0000-0000',
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    };
    setSelectedContacts((prev) => [...prev, newContact]);
    setNewFriendName('');
    setNewFriendPhone('');
    setShowAddForm(false);
    sounds.playHapticClick();
  };

  const generateShareMessage = () => {
    const friendShares = selectedContacts
      .map((c) => `• ${c.name}: ${formatCurrency(equalShare, user.currency)}`)
      .join('\n');

    return `🧾 *TAGIHAN SPLIT BILL KAIPAY*
📍 Lokasi: ${merchantName}
💰 Total Tagihan: ${formatCurrency(totalAmount, user.currency)}
👥 Peserta: ${totalPeople} orang (${formatCurrency(equalShare, user.currency)} / orang)

Rincian:
• ${user.name} (Saya): ${formatCurrency(equalShare, user.currency)}
${friendShares}

Silakan transfer ke nomor KaiPay saya:
📱 ${user.phone} (${user.name})
Terima kasih! ✨`;
  };

  const handleCopyMessage = () => {
    const text = generateShareMessage();
    navigator.clipboard.writeText(text);
    setCopiedMessage(true);
    sounds.playHapticClick();
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const handleFinishSplit = () => {
    sounds.playApplePayChime();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });

    onCompleteSplit({
      totalAmount,
      merchantName,
      participants: selectedContacts.map((c) => ({
        name: c.name,
        phone: c.phone,
        amount: equalShare,
      })),
      myShare: equalShare,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          variants={iosBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Sheet */}
        <motion.div
          variants={iosSheetVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-lg bg-white dark:bg-[#1C1C1E] rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-[#E5E5EA] dark:border-[#2C2C2E] overflow-hidden max-h-[90vh] flex flex-col z-10"
        >
          {/* Grab Handle */}
          <div className="w-10 h-1.5 bg-[#8E8E93]/40 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5EA] dark:border-[#2C2C2E]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#34C759]/15 text-[#34C759] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                  Split Bill QRIS
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Bagi tagihan otomatis dengan teman kontak
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* Bill Details Inset Card */}
            <div className="p-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                  Nama Tagihan / Toko QRIS
                </label>
                <input
                  type="text"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="w-full bg-white dark:bg-[#1C1C1E] px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  placeholder="e.g. Kopi Kenangan, Restoran, dsb."
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                  Total Tagihan Keseluruhan
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-zinc-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={totalStr}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      setTotalStr(e.target.value);
                      setTotalAmount(val);
                    }}
                    className="w-full bg-white dark:bg-[#1C1C1E] pl-11 pr-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-lg font-bold font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Select Contacts */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                  Pilih Teman ({selectedContacts.length} Dipilih)
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="text-xs font-semibold text-[#007AFF] hover:underline flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  + Tambah Teman
                </button>
              </div>

              {/* Add Custom Friend Form */}
              {showAddForm && (
                <form onSubmit={handleAddNewFriend} className="p-3 mb-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nama teman"
                      value={newFriendName}
                      onChange={(e) => setNewFriendName(e.target.value)}
                      className="flex-1 bg-white dark:bg-[#1C1C1E] px-3 py-1.5 rounded-lg text-xs text-zinc-900 dark:text-white border border-black/10 dark:border-white/10"
                    />
                    <input
                      type="tel"
                      placeholder="Nomor HP"
                      value={newFriendPhone}
                      onChange={(e) => setNewFriendPhone(e.target.value)}
                      className="w-32 bg-white dark:bg-[#1C1C1E] px-3 py-1.5 rounded-lg text-xs text-zinc-900 dark:text-white border border-black/10 dark:border-white/10"
                    />
                  </div>
                  <button
                    type="submit"
                    className="self-end px-3 py-1 bg-[#007AFF] text-white text-xs font-semibold rounded-lg"
                  >
                    Simpan ke Split
                  </button>
                </form>
              )}

              {/* Contact Avatars Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {contacts.map((contact, idx) => {
                  const isSelected = selectedContacts.some((c) => c.id === contact.id);
                  return (
                    <button
                      key={`${contact.id}-${idx}`}
                      type="button"
                      onClick={() => handleToggleContact(contact)}
                      className={`flex items-center gap-2.5 p-2 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-[#34C759]/10 border-[#34C759] shadow-sm'
                          : 'bg-white dark:bg-[#2C2C2E]/40 border-black/5 dark:border-white/5 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={contact.avatarUrl}
                        alt={contact.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                          {contact.name.split(' ')[0]}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-mono truncate">
                          {contact.phone}
                        </p>
                      </div>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#34C759] text-white' : 'border border-zinc-400'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Split Calculation Result Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-[#34C759]/30">
              <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Pembagian Rata ({totalPeople} Orang)
                </span>
                <span className="text-xs font-bold text-[#34C759] font-mono">
                  {formatCurrency(equalShare, user.currency)} / orang
                </span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">Bagian Anda ({user.name})</span>
                  <span className="font-bold font-mono text-zinc-900 dark:text-white">
                    {formatCurrency(equalShare, user.currency)}
                  </span>
                </div>
                {selectedContacts.map((c, idx) => (
                  <div key={`${c.id}-${idx}`} className="flex justify-between py-1 text-zinc-600 dark:text-zinc-400">
                    <span>Bagian {c.name}</span>
                    <span className="font-mono">{formatCurrency(equalShare, user.currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 border-t border-[#E5E5EA] dark:border-[#2C2C2E] grid grid-cols-2 gap-3 bg-white dark:bg-[#1C1C1E]">
            <motion.button
              whileTap={iosQuickTap}
              type="button"
              onClick={handleCopyMessage}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#F2F2F7] dark:bg-[#2C2C2E] text-zinc-900 dark:text-white text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              {copiedMessage ? (
                <>
                  <Check className="w-4 h-4 text-[#34C759]" />
                  <span className="text-[#34C759] font-bold">Pesan Tersalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Salin Pesan WA</span>
                </>
              )}
            </motion.button>

            <motion.button
              whileTap={iosQuickTap}
              type="button"
              onClick={handleFinishSplit}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#34C759] text-white text-xs font-bold shadow-lg shadow-[#34C759]/30 hover:bg-[#2eb34f] transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Selesaikan Split</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
