import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  UserPlus, 
  Star, 
  Send, 
  Users, 
  Trash2, 
  X, 
  Phone, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History,
  ShieldCheck
} from 'lucide-react';
import { QuickContact, Transaction, UserProfile, ContactGroup } from '../types';
import { formatCurrency, formatDateRelative } from '../utils/formatters';
import { sounds } from '../utils/sound';
import { iosQuickTap, iosSheetVariants, iosBackdropVariants } from '../utils/motion';

interface QuickContactsProps {
  contacts: QuickContact[];
  transactions: Transaction[];
  user: UserProfile;
  onSelectContact: (contact: QuickContact) => void;
  onAddNewContact: () => void;
  onToggleFavorite?: (contactId: string) => void;
  onDeleteContact?: (contactId: string) => void;
  onOpenSplitBillWithContact?: (contact: QuickContact) => void;
}

export const QuickContacts: React.FC<QuickContactsProps> = ({
  contacts,
  transactions,
  user,
  onSelectContact,
  onAddNewContact,
  onToggleFavorite,
  onDeleteContact,
  onOpenSplitBillWithContact,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<'all' | 'favorite' | ContactGroup>('all');
  const [activeContactDetail, setActiveContactDetail] = useState<QuickContact | null>(null);

  // Filter contacts based on selected group
  const filteredContacts = contacts.filter((c) => {
    if (selectedGroup === 'favorite') return c.isFavorite;
    if (selectedGroup === 'all') return true;
    return c.group === selectedGroup;
  });

  // Sort favorites first
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return 0;
  });

  // When a contact is inspected, get transaction history with that contact
  const contactTransactions = activeContactDetail
    ? transactions.filter(
        (t) =>
          t.recipientPhone === activeContactDetail.phone ||
          t.recipientName.toLowerCase() === activeContactDetail.name.toLowerCase() ||
          t.senderName.toLowerCase() === activeContactDetail.name.toLowerCase()
      )
    : [];

  const totalSentToContact = contactTransactions
    .filter((t) => t.type === 'transfer_out' || t.type === 'qris_payment')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="w-full">
      {/* Header & Group Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 px-1">
        <div>
          <h3 className="text-sm font-bold text-[#000000] dark:text-[#FFFFFF]">
            Kontak Teman & Keluarga
          </h3>
          <p className="text-[11px] text-[#6C6C70] dark:text-[#8E8E93]">
            Transfer instan, kelola favorit, dan riwayat per rekan
          </p>
        </div>

        {/* Group Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'favorite', label: 'Favorit ★' },
            { id: 'teman', label: 'Teman' },
            { id: 'keluarga', label: 'Keluarga' },
            { id: 'bisnis', label: 'Bisnis' },
          ].map((grp) => (
            <button
              key={grp.id}
              type="button"
              onClick={() => {
                setSelectedGroup(grp.id as typeof selectedGroup);
                sounds.playHapticClick();
              }}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all whitespace-nowrap ${
                selectedGroup === grp.id
                  ? 'bg-ios-accent text-white shadow-sm'
                  : 'bg-[#767680]/12 dark:bg-[#767680]/24 text-[#6C6C70] dark:text-[#8E8E93] hover:text-black dark:hover:text-white'
              }`}
            >
              {grp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal Avatar Carousel */}
      <div className="flex items-center gap-3.5 overflow-x-auto pb-2 scrollbar-none px-1">
        {/* Add Contact Button */}
        <motion.button
          whileTap={iosQuickTap}
          type="button"
          onClick={onAddNewContact}
          className="flex flex-col items-center gap-1.5 shrink-0 group focus-visible:outline-none"
        >
          <div className="w-13 h-13 rounded-2xl border-2 border-dashed border-[#C7C7CC] dark:border-[#38383A] flex items-center justify-center text-ios-accent group-hover:border-ios-accent group-hover:bg-ios-accent-subtle transition-all">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-[#6C6C70] dark:text-[#8E8E93] truncate max-w-[64px]">
            Tambah
          </span>
        </motion.button>

        {/* Contact List */}
        {sortedContacts.map((contact, idx) => (
          <motion.button
            key={`${contact.id}-${idx}`}
            whileTap={iosQuickTap}
            type="button"
            onClick={() => {
              setActiveContactDetail(contact);
              sounds.playHapticClick();
            }}
            className="flex flex-col items-center gap-1.5 shrink-0 group focus-visible:outline-none relative"
          >
            <div className="relative">
              <img
                src={contact.avatarUrl}
                alt={contact.name}
                referrerPolicy="no-referrer"
                className="w-13 h-13 rounded-2xl object-cover ring-2 ring-transparent group-hover:ring-ios-accent transition-all shadow-sm"
              />

              {/* Favorite Star Badge */}
              {contact.isFavorite && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-sm">
                  <Star className="w-2.5 h-2.5 fill-black" />
                </div>
              )}

              {/* Category Pill Tag */}
              {contact.group && (
                <span className="absolute -bottom-1 -left-1 text-[8px] font-black uppercase tracking-wider px-1 py-0.2 rounded-md bg-black/80 text-white backdrop-blur-md">
                  {contact.group.slice(0, 3)}
                </span>
              )}
            </div>

            <span className="text-[11px] font-semibold text-[#000000] dark:text-[#FFFFFF] truncate max-w-[68px]">
              {contact.name.split(' ')[0]}
            </span>
          </motion.button>
        ))}
      </div>

      {/* CONTACT DETAIL SHEET (iOS AirDrop / Contact Card Modal) */}
      <AnimatePresence>
        {activeContactDetail && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              variants={iosBackdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setActiveContactDetail(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              variants={iosSheetVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-[#E5E5EA] dark:border-[#2C2C2E] overflow-hidden flex flex-col z-10 max-h-[88vh]"
            >
              {/* iOS Grab Handle */}
              <div className="w-10 h-1.5 bg-[#8E8E93]/40 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5EA] dark:border-[#2C2C2E]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E8E93]">
                  Kartu Kontak KaiPay
                </span>
                <button
                  type="button"
                  onClick={() => setActiveContactDetail(null)}
                  className="p-1.5 rounded-full text-[#8E8E93] hover:text-black dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contact Profile Overview */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={activeContactDetail.avatarUrl}
                      alt={activeContactDetail.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-[#E5E5EA] dark:ring-[#2C2C2E] shadow-md"
                    />
                    {activeContactDetail.isFavorite && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-md">
                        <Star className="w-3 h-3 fill-black" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-lg font-bold text-[#000000] dark:text-[#FFFFFF] truncate">
                      {activeContactDetail.name}
                    </h4>
                    <p className="text-xs font-mono text-[#8E8E93] mt-0.5">
                      {activeContactDetail.phone}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#767680]/15 dark:bg-[#767680]/25 text-[#000000] dark:text-white">
                        {activeContactDetail.group || 'Teman'}
                      </span>
                      <span className="text-[11px] text-[#34C759] font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Terverifikasi
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <motion.button
                    whileTap={iosQuickTap}
                    type="button"
                    onClick={() => {
                      const tgt = activeContactDetail;
                      setActiveContactDetail(null);
                      onSelectContact(tgt);
                    }}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-ios-accent text-white text-xs font-bold shadow-md shadow-black/10 transition-transform"
                  >
                    <Send className="w-4 h-4 -rotate-12" />
                    <span>Transfer Sekarang</span>
                  </motion.button>

                  <motion.button
                    whileTap={iosQuickTap}
                    type="button"
                    onClick={() => {
                      const tgt = activeContactDetail;
                      setActiveContactDetail(null);
                      if (onOpenSplitBillWithContact) {
                        onOpenSplitBillWithContact(tgt);
                      }
                    }}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-500/15 text-[#34C759] hover:bg-emerald-500/25 text-xs font-bold transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    <span>Split Bill Bersama</span>
                  </motion.button>
                </div>

                {/* Total Transferred & Stats */}
                <div className="p-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#8E8E93] block">
                      Total Dana Terkirim ke Rekan
                    </span>
                    <span className="text-base font-bold font-mono text-[#000000] dark:text-white">
                      {formatCurrency(totalSentToContact, user.currency)}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[#8E8E93] font-mono">
                    {contactTransactions.length} transaksi
                  </span>
                </div>

                {/* Specific Transaction History with Contact */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8E8E93]">
                      Riwayat Bersama Rekan
                    </span>
                    <History className="w-3.5 h-3.5 text-[#8E8E93]" />
                  </div>

                  {contactTransactions.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#8E8E93] bg-[#F2F2F7]/50 dark:bg-[#2C2C2E]/30 rounded-2xl">
                      Belum ada mutasi bersama rekan ini.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {contactTransactions.slice(0, 4).map((tx, idx) => {
                        const isIncome = tx.type === 'transfer_in' || tx.type === 'top_up';
                        return (
                          <div
                            key={`${tx.id}-${idx}`}
                            className="p-3 rounded-xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              {isIncome ? (
                                <ArrowDownLeft className="w-3.5 h-3.5 text-[#34C759]" />
                              ) : (
                                <ArrowUpRight className="w-3.5 h-3.5 text-[#8E8E93]" />
                              )}
                              <div>
                                <p className="font-semibold text-[#000000] dark:text-white truncate max-w-[140px]">
                                  {tx.note || (isIncome ? 'Uang Masuk' : 'Transfer')}
                                </p>
                                <p className="text-[10px] text-[#8E8E93]">
                                  {formatDateRelative(tx.timestamp)}
                                </p>
                              </div>
                            </div>

                            <span className={`font-mono font-bold ${isIncome ? 'text-[#34C759]' : 'text-black dark:text-white'}`}>
                              {isIncome ? '+' : '-'}{formatCurrency(tx.amount, user.currency)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Management Options */}
                <div className="pt-2 flex items-center justify-between text-xs border-t border-[#E5E5EA] dark:border-[#2C2C2E]">
                  {onToggleFavorite && (
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playHapticClick();
                        onToggleFavorite(activeContactDetail.id);
                        setActiveContactDetail((prev) =>
                          prev ? { ...prev, isFavorite: !prev.isFavorite } : null
                        );
                      }}
                      className="text-amber-500 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>{activeContactDetail.isFavorite ? 'Hapus dari Favorit' : 'Jadikan Favorit'}</span>
                    </button>
                  )}

                  {onDeleteContact && (
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playHapticClick();
                        onDeleteContact(activeContactDetail.id);
                        setActiveContactDetail(null);
                      }}
                      className="text-[#FF3B30] font-semibold hover:underline flex items-center gap-1 ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Kontak</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
