import React from 'react';
import { motion } from 'motion/react';
import { Plus, UserPlus } from 'lucide-react';
import { QuickContact } from '../types';
import { iosQuickTap } from '../utils/motion';

interface QuickContactsProps {
  contacts: QuickContact[];
  onSelectContact: (contact: QuickContact) => void;
  onAddNewContact: () => void;
}

export const QuickContacts: React.FC<QuickContactsProps> = ({
  contacts,
  onSelectContact,
  onAddNewContact,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-bold text-[#000000] dark:text-[#FFFFFF]">
          Kirim Cepat ke Teman (AirDrop Style)
        </h3>
        <motion.button
          whileTap={iosQuickTap}
          type="button"
          onClick={onAddNewContact}
          className="text-xs font-semibold text-[#007AFF] hover:underline flex items-center gap-1 transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Tambah</span>
        </motion.button>
      </div>

      <div className="flex items-center gap-3.5 overflow-x-auto pb-2 scrollbar-none px-1">
        {/* Add Contact Card */}
        <motion.button
          whileTap={iosQuickTap}
          type="button"
          onClick={onAddNewContact}
          className="flex flex-col items-center gap-1.5 shrink-0 group focus-visible:outline-none"
        >
          <div className="w-13 h-13 rounded-2xl border-2 border-dashed border-[#C7C7CC] dark:border-[#38383A] flex items-center justify-center text-[#007AFF] group-hover:border-[#007AFF] group-hover:bg-[#007AFF]/5 transition-all">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium text-[#6C6C70] dark:text-[#8E8E93] truncate max-w-[64px]">
            Baru
          </span>
        </motion.button>

        {/* Contact List */}
        {contacts.map((contact) => (
          <motion.button
            key={contact.id}
            whileTap={iosQuickTap}
            type="button"
            onClick={() => onSelectContact(contact)}
            className="flex flex-col items-center gap-1.5 shrink-0 group focus-visible:outline-none"
          >
            <div className="relative">
              <img
                src={contact.avatarUrl}
                alt={contact.name}
                referrerPolicy="no-referrer"
                className="w-13 h-13 rounded-2xl object-cover ring-2 ring-transparent group-hover:ring-[#007AFF] transition-all shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#34C759] border-2 border-white dark:border-[#1C1C1E] flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
                ✓
              </span>
            </div>
            <span className="text-[11px] font-semibold text-[#000000] dark:text-[#FFFFFF] truncate max-w-[68px]">
              {contact.name.split(' ')[0]}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
