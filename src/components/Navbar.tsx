import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Bell, Sun, Moon, Lock } from 'lucide-react';
import { UserProfile, PushNotification } from '../types';
import { iosQuickTap } from '../utils/motion';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile;
  notifications: PushNotification[];
  onOpenNotifications: () => void;
  onToggleTheme: () => void;
  onLockApp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  notifications,
  onOpenNotifications,
  onToggleTheme,
  onLockApp,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/[0.06] dark:border-white/[0.08] bg-[#F2F2F7]/85 dark:bg-[#000000]/80 backdrop-blur-2xl transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Apple Pay-Style Brand Wordmark */}
        <motion.div 
          whileTap={iosQuickTap}
          onClick={() => setActiveTab('home')}
          className="cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 group select-none"
        >
          <span className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Kai
          </span>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border border-zinc-800 dark:border-zinc-200 shadow-sm group-hover:scale-105 transition-transform">
            <span className="text-xs font-black tracking-wider uppercase">
              Pay
            </span>
          </div>
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 ml-0.5" />
        </motion.div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {[
            { id: 'home', label: 'Beranda' },
            { id: 'history', label: 'Riwayat Mutasi' },
            { id: 'qr', label: 'Pindai QRIS' },
            { id: 'analytics', label: 'Analitik & Anggaran' },
            { id: 'profile', label: 'Pengaturan Akun' },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileTap={iosQuickTap}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`transition-colors whitespace-nowrap shrink-0 pb-1 ${
                activeTab === tab.id
                  ? 'text-[#000000] dark:text-[#FFFFFF] font-semibold border-b-2 border-ios-accent'
                  : 'text-[#6C6C70] dark:text-[#8E8E93] hover:text-[#000000] dark:hover:text-[#FFFFFF]'
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </nav>

        {/* Zone 3: Primary Action & Utilities */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme switch button */}
          <motion.button
            whileTap={iosQuickTap}
            type="button"
            onClick={onToggleTheme}
            aria-label="Ganti mode gelap/terang"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#6C6C70] dark:text-[#8E8E93] hover:text-[#000000] dark:hover:text-[#FFFFFF] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            {user.theme === 'dark' ? (
              <Sun className="w-5 h-5 text-[#FF9F0A]" />
            ) : (
              <Moon className="w-5 h-5 text-[#007AFF]" />
            )}
          </motion.button>

          {/* Notifications bell */}
          <motion.button
            whileTap={iosQuickTap}
            type="button"
            onClick={onOpenNotifications}
            aria-label="Buka notifikasi"
            className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#6C6C70] dark:text-[#8E8E93] hover:text-[#000000] dark:hover:text-[#FFFFFF] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF3B30] ring-2 ring-[#F2F2F7] dark:ring-[#000000]" />
            )}
          </motion.button>

          {/* Quick Lock */}
          <motion.button
            whileTap={iosQuickTap}
            type="button"
            onClick={onLockApp}
            aria-label="Kunci aplikasi dengan PIN/Biometrik"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#6C6C70] dark:text-[#8E8E93] hover:text-[#000000] dark:hover:text-[#FFFFFF] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Kunci sesi"
          >
            <Lock className="w-4 h-4" />
          </motion.button>

          {/* User profile avatar trigger */}
          <motion.button
            whileTap={iosQuickTap}
            type="button"
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors border border-[#E5E5EA] dark:border-[#2C2C2E]"
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover ring-1 ring-[#D1D1D6] dark:ring-[#3A3A3C]"
            />
            <span className="hidden sm:inline text-xs font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] truncate max-w-[100px]">
              {user.name.split(' ')[0]}
            </span>
          </motion.button>
        </div>
      </div>
    </header>
  );
};
