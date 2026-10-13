import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck 
} from 'lucide-react';
import { PushNotification } from '../types';
import { formatDateRelative } from '../utils/formatters';
import { iosSheetVariants, iosBackdropVariants, iosQuickTap, iosSubtleTap } from '../utils/motion';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotification[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSelectNotification: (notif: PushNotification) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onSelectNotification,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: PushNotification['type']) => {
    switch (type) {
      case 'transaction':
        return <CheckCircle2 className="w-4 h-4 text-[#34C759]" />;
      case 'budget_alert':
        return <AlertTriangle className="w-4 h-4 text-[#FF9500]" />;
      case 'security':
        return <ShieldCheck className="w-4 h-4 text-[#007AFF]" />;
      default:
        return <Bell className="w-4 h-4 text-[#8E8E93]" />;
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
            className="relative w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-[#E5E5EA] dark:border-[#2C2C2E] overflow-hidden flex flex-col max-h-[85vh] z-10"
          >
            {/* iOS Grab Handle */}
            <div className="w-10 h-1.5 bg-[#8E8E93]/40 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E5EA] dark:border-[#2C2C2E]">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#000000] dark:text-[#FFFFFF]">
                  Notifikasi & Peringatan
                </h3>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FF3B30] text-white">
                    {unreadCount}
                  </span>
                )}
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

            {/* Action Toolbar */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-between px-5 py-2.5 bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border-b border-[#E5E5EA] dark:border-[#2C2C2E] text-xs">
                <motion.button
                  whileTap={iosSubtleTap}
                  type="button"
                  onClick={onMarkAllAsRead}
                  className="flex items-center gap-1.5 text-[#007AFF] font-medium transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Tandai Semua Dibaca</span>
                </motion.button>

                <motion.button
                  whileTap={iosSubtleTap}
                  type="button"
                  onClick={onClearAll}
                  className="flex items-center gap-1.5 text-[#FF3B30] font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Semua</span>
                </motion.button>
              </div>
            )}

            {/* Notification List */}
            <div className="overflow-y-auto flex-1 divide-y divide-[#E5E5EA] dark:divide-[#2C2C2E]">
              {notifications.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#8E8E93] flex items-center justify-center mb-3">
                    <Bell className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF]">
                    Tidak Ada Notifikasi
                  </h4>
                  <p className="text-xs text-[#6C6C70] dark:text-[#8E8E93] mt-1 max-w-xs">
                    Semua riwayat transfer dana, pengisian saldo, dan peringatan batas anggaran akan muncul di sini.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    whileTap={iosSubtleTap}
                    onClick={() => onSelectNotification(notif)}
                    className={`p-4 flex items-start gap-3.5 transition-colors cursor-pointer ${
                      notif.read
                        ? 'hover:bg-black/[0.02] dark:hover:bg-white/[0.03]'
                        : 'bg-[#007AFF]/5 dark:bg-[#0A84FF]/10 hover:bg-[#007AFF]/10'
                    }`}
                  >
                    <div className="p-2.5 rounded-2xl bg-white dark:bg-[#2C2C2E] shadow-sm shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-[#000000] dark:text-[#FFFFFF] truncate">
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-[#8E8E93] shrink-0 font-mono">
                          {formatDateRelative(notif.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-[#6C6C70] dark:text-[#8E8E93] mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                      {notif.transactionId && (
                        <span className="inline-block mt-1.5 text-[10px] font-semibold text-[#007AFF] hover:underline">
                          Lihat Struk Transaksi →
                        </span>
                      )}
                    </div>

                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[#007AFF] shrink-0 mt-2" />
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
