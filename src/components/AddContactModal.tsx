import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { QuickContact, TransactionCategory, CATEGORY_DETAILS } from '../types';
import { iosSheetVariants, iosBackdropVariants, iosQuickTap } from '../utils/motion';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContact: (contact: QuickContact) => void;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
  onAddContact,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('makanan');

  const defaultAvatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const randomAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];
    const newContact: QuickContact = {
      id: `cnt_${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      avatarUrl: randomAvatar,
      recentCategory: category,
    };

    onAddContact(newContact);
    onClose();
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
            className="relative w-full max-w-sm bg-white dark:bg-[#1C1C1E] rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-[#E5E5EA] dark:border-[#2C2C2E] overflow-hidden flex flex-col z-10"
          >
            {/* iOS Grab Handle */}
            <div className="w-10 h-1.5 bg-[#8E8E93]/40 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E5EA] dark:border-[#2C2C2E]">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#000000] dark:text-[#FFFFFF]">
                  Tambah Kontak Rekan
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

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1">
                  Nama Lengkap Rekan
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Rian Anggara"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#767680]/12 dark:bg-[#767680]/24 border border-transparent text-xs font-medium text-[#000000] dark:text-[#FFFFFF] focus:bg-white dark:focus:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1">
                  Nomor Telepon / ID KaiPay
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 0813-9921-8842"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#767680]/12 dark:bg-[#767680]/24 border border-transparent text-xs font-mono font-medium text-[#000000] dark:text-[#FFFFFF] focus:bg-white dark:focus:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1">
                  Kategori Umum
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                  className="w-full h-11 px-3 rounded-xl bg-[#767680]/12 dark:bg-[#767680]/24 border border-transparent text-xs font-medium text-[#000000] dark:text-[#FFFFFF] focus:ring-2 focus:ring-[#007AFF]"
                >
                  {Object.keys(CATEGORY_DETAILS).map((k) => (
                    <option key={k} value={k}>
                      {CATEGORY_DETAILS[k as TransactionCategory].label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <motion.button
                  whileTap={iosQuickTap}
                  type="submit"
                  className="w-full h-11 rounded-full bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-bold transition-colors shadow-sm"
                >
                  Simpan ke Kontak KaiPay
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
