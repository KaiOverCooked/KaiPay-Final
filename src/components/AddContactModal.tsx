import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Camera, Users, Heart, Briefcase, Check } from 'lucide-react';
import { QuickContact, TransactionCategory, ContactGroup, CATEGORY_DETAILS } from '../types';
import { sounds } from '../utils/sound';
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
  const [group, setGroup] = useState<ContactGroup>('teman');
  const [isFavorite, setIsFavorite] = useState(false);
  const [category, setCategory] = useState<TransactionCategory>('makanan');
  const [avatarUrl, setAvatarUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presetAvatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  ];

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
          sounds.playHapticClick();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const chosenAvatar = avatarUrl || presetAvatars[Math.floor(Math.random() * presetAvatars.length)];
    const newContact: QuickContact = {
      id: `cnt_${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      avatarUrl: chosenAvatar,
      group,
      isFavorite,
      recentCategory: category,
    };

    sounds.playApplePayChime();
    onAddContact(newContact);
    onClose();
    setName('');
    setPhone('');
    setAvatarUrl('');
    setIsFavorite(false);
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
            className="relative w-full max-w-sm bg-white dark:bg-[#1C1C1E] rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-[#E5E5EA] dark:border-[#2C2C2E] overflow-hidden flex flex-col z-10 max-h-[90vh]"
          >
            {/* iOS Grab Handle */}
            <div className="w-10 h-1.5 bg-[#8E8E93]/40 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E5EA] dark:border-[#2C2C2E]">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#000000] dark:text-[#FFFFFF]">
                  Tambah Kontak Baru
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

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
              {/* Avatar Selector */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <img
                    src={avatarUrl || presetAvatars[0]}
                    alt="Avatar preview"
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-ios-accent shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-ios-accent text-white shadow-md hover:scale-105 transition-transform"
                    title="Unggah Foto Kustom"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarFile}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
                  {presetAvatars.map((pUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAvatarUrl(pUrl);
                        sounds.playHapticClick();
                      }}
                      className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-transform ${
                        avatarUrl === pUrl ? 'border-ios-accent scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={pUrl} alt="Preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1">
                  Nama Lengkap Kontak
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Rian Anggara"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#767680]/12 dark:bg-[#767680]/24 border border-transparent text-xs font-medium text-[#000000] dark:text-[#FFFFFF] focus:bg-white dark:focus:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-ios-accent transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1">
                  Nomor HP / ID KaiPay
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 0813-9921-8842"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#767680]/12 dark:bg-[#767680]/24 border border-transparent text-xs font-mono font-medium text-[#000000] dark:text-[#FFFFFF] focus:bg-white dark:focus:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-ios-accent transition-all"
                />
              </div>

              {/* Group Selector: Teman | Keluarga | Bisnis */}
              <div>
                <label className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1.5">
                  Kategori Grup Kontak
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#767680]/12 dark:bg-[#767680]/24 rounded-2xl">
                  {[
                    { id: 'teman', label: 'Teman', icon: Users },
                    { id: 'keluarga', label: 'Keluarga', icon: Heart },
                    { id: 'bisnis', label: 'Bisnis', icon: Briefcase },
                  ].map((g) => {
                    const Icon = g.icon;
                    const isSelected = group === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          setGroup(g.id as ContactGroup);
                          sounds.playHapticClick();
                        }}
                        className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                          isSelected
                            ? 'bg-white dark:bg-[#636366] text-black dark:text-white shadow-sm'
                            : 'text-[#8E8E93] hover:text-black dark:hover:text-white'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{g.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Favorite Toggle */}
              <div 
                onClick={() => {
                  setIsFavorite(!isFavorite);
                  sounds.playHapticClick();
                }}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#767680]/10 dark:bg-[#767680]/20 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <Star className={`w-4 h-4 ${isFavorite ? 'text-amber-400 fill-amber-400' : 'text-[#8E8E93]'}`} />
                  <div>
                    <p className="text-xs font-bold text-[#000000] dark:text-[#FFFFFF]">
                      Sematkan ke Favorit
                    </p>
                    <p className="text-[10px] text-[#8E8E93]">
                      Tampilkan di urutan paling awal
                    </p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                  isFavorite ? 'bg-ios-accent border-ios-accent text-white' : 'border-[#8E8E93]'
                }`}>
                  {isFavorite && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              <div className="pt-2">
                <motion.button
                  whileTap={iosQuickTap}
                  type="submit"
                  className="w-full h-11 rounded-full bg-ios-accent hover:bg-ios-accent text-white text-xs font-bold transition-colors shadow-sm"
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
