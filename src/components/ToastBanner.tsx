import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PushNotification } from '../types';
import { Bell, CheckCircle2, AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { iosToastVariants, iosQuickTap } from '../utils/motion';

interface ToastBannerProps {
  notification: PushNotification | null;
  onDismiss: () => void;
  onOpenDetails?: (notification: PushNotification) => void;
}

export const ToastBanner: React.FC<ToastBannerProps> = ({
  notification,
  onDismiss,
  onOpenDetails,
}) => {
  const getIcon = (type: PushNotification['type']) => {
    switch (type) {
      case 'transaction':
        return <CheckCircle2 className="w-5 h-5 text-[#30D158] shrink-0" />;
      case 'budget_alert':
        return <AlertTriangle className="w-5 h-5 text-[#FF9F0A] shrink-0" />;
      case 'security':
        return <ShieldCheck className="w-5 h-5 text-[#0A84FF] shrink-0" />;
      default:
        return <Bell className="w-5 h-5 text-[#8E8E93] shrink-0" />;
    }
  };

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          key={notification.id}
          variants={iosToastVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md select-none"
        >
          {/* iPhone Dynamic Island Style Floating Alert Pill */}
          <motion.div 
            whileTap={iosQuickTap}
            onClick={() => onOpenDetails && onOpenDetails(notification)}
            className="cursor-pointer flex items-start gap-3.5 p-3.5 rounded-[28px] bg-[#000000]/95 text-white shadow-2xl shadow-black/50 border border-white/[0.12] backdrop-blur-2xl transition-colors hover:border-white/20"
          >
            <div className="p-2.5 rounded-2xl bg-[#1C1C1E] border border-white/5 shrink-0">
              {getIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-[#8E8E93] uppercase">
                  KaiPay Dynamic Alert
                </span>
                <span className="text-[10px] text-[#8E8E93] font-mono">Baru saja</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                {notification.title}
              </h4>
              <p className="text-xs text-[#8E8E93] line-clamp-1 mt-0.5">
                {notification.message}
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="p-1.5 rounded-full text-[#8E8E93] hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
