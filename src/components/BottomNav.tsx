import React from 'react';
import { motion } from 'motion/react';
import { Home, History, QrCode, BarChart3, User } from 'lucide-react';
import { iosQuickTap } from '../utils/motion';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQrScan: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenQrScan,
}) => {
  return (
    <div className="md:hidden fixed bottom-4 left-3 right-3 max-w-[390px] mx-auto z-40 select-none">
      {/* iOS Floating Frosted Glass Capsule Dock */}
      <nav className="relative flex items-center justify-between p-1.5 rounded-full bg-[#FFFFFF]/80 dark:bg-[#1C1C1E]/80 backdrop-blur-3xl border border-white/60 dark:border-white/10 shadow-2xl shadow-black/20 ring-1 ring-black/5 dark:ring-white/5">
        {/* Tab 1: Home */}
        <motion.button
          whileTap={iosQuickTap}
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex-1 h-12 rounded-full flex flex-col items-center justify-center transition-colors ${
            activeTab === 'home'
              ? 'text-ios-accent'
              : 'text-[#8E8E93] hover:text-[#000000] dark:hover:text-[#FFFFFF]'
          }`}
        >
          <Home
            className={`w-4 h-4 transition-transform ${
              activeTab === 'home' ? 'stroke-[2.5px] scale-110' : 'stroke-[1.8px]'
            }`}
          />
          <span className={`text-[10px] mt-0.5 tracking-tight ${activeTab === 'home' ? 'font-bold' : 'font-medium'}`}>
            Beranda
          </span>
        </motion.button>

        {/* Tab 2: Riwayat */}
        <motion.button
          whileTap={iosQuickTap}
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex-1 h-12 rounded-full flex flex-col items-center justify-center transition-colors ${
            activeTab === 'history'
              ? 'text-ios-accent'
              : 'text-[#8E8E93] hover:text-[#000000] dark:hover:text-[#FFFFFF]'
          }`}
        >
          <History
            className={`w-4 h-4 transition-transform ${
              activeTab === 'history' ? 'stroke-[2.5px] scale-110' : 'stroke-[1.8px]'
            }`}
          />
          <span className={`text-[10px] mt-0.5 tracking-tight ${activeTab === 'history' ? 'font-bold' : 'font-medium'}`}>
            Riwayat
          </span>
        </motion.button>

        {/* Tab 3: Center Elevated QR Button (iPhone Pay Style) */}
        <div className="flex-1 flex items-center justify-center">
          <motion.button
            whileTap={{ scale: 0.9, transition: { type: 'spring', stiffness: 500, damping: 25 } }}
            type="button"
            onClick={onOpenQrScan}
            aria-label="Pindai QRIS"
            className="w-11 h-11 rounded-full bg-[#000000] dark:bg-[#FFFFFF] text-[#FFFFFF] dark:text-[#000000] flex items-center justify-center shadow-lg shadow-black/25 group transition-transform ring-2 ring-black/5 dark:ring-white/10"
          >
            <QrCode className="w-5 h-5 stroke-[2.2px]" />
          </motion.button>
        </div>

        {/* Tab 4: Analitik */}
        <motion.button
          whileTap={iosQuickTap}
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 h-12 rounded-full flex flex-col items-center justify-center transition-colors ${
            activeTab === 'analytics'
              ? 'text-ios-accent'
              : 'text-[#8E8E93] hover:text-[#000000] dark:hover:text-[#FFFFFF]'
          }`}
        >
          <BarChart3
            className={`w-4 h-4 transition-transform ${
              activeTab === 'analytics' ? 'stroke-[2.5px] scale-110' : 'stroke-[1.8px]'
            }`}
          />
          <span className={`text-[10px] mt-0.5 tracking-tight ${activeTab === 'analytics' ? 'font-bold' : 'font-medium'}`}>
            Analitik
          </span>
        </motion.button>

        {/* Tab 5: Profil */}
        <motion.button
          whileTap={iosQuickTap}
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex-1 h-12 rounded-full flex flex-col items-center justify-center transition-colors ${
            activeTab === 'profile'
              ? 'text-ios-accent'
              : 'text-[#8E8E93] hover:text-[#000000] dark:hover:text-[#FFFFFF]'
          }`}
        >
          <User
            className={`w-4 h-4 transition-transform ${
              activeTab === 'profile' ? 'stroke-[2.5px] scale-110' : 'stroke-[1.8px]'
            }`}
          />
          <span className={`text-[10px] mt-0.5 tracking-tight ${activeTab === 'profile' ? 'font-bold' : 'font-medium'}`}>
            Saya
          </span>
        </motion.button>
      </nav>
    </div>
  );
};
