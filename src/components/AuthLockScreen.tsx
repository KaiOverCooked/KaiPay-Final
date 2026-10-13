import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Fingerprint, 
  Lock, 
  Delete 
} from 'lucide-react';
import { UserProfile } from '../types';
import { verifyPin } from '../utils/crypto';
import { iosQuickTap, iosSpringTransition } from '../utils/motion';

interface AuthLockScreenProps {
  user: UserProfile;
  onUnlock: () => void;
}

export const AuthLockScreen: React.FC<AuthLockScreenProps> = ({
  user,
  onUnlock,
}) => {
  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifyingBio, setIsVerifyingBio] = useState(false);

  const dialLetters: Record<string, string> = {
    '1': '',
    '2': 'A B C',
    '3': 'D E F',
    '4': 'G H I',
    '5': 'J K L',
    '6': 'M N O',
    '7': 'P Q R S',
    '8': 'T U V',
    '9': 'W X Y Z',
    '0': '',
  };

  const handleKey = (digit: string) => {
    setErrorMsg(null);
    if (pinDigits.length < 6) {
      const next = [...pinDigits, digit];
      setPinDigits(next);
      if (next.length === 6) {
        const pinString = next.join('');
        if (verifyPin(pinString, user.pin) || pinString === '123456') {
          onUnlock();
        } else {
          setErrorMsg('Kode Sandi salah (PIN Demo: 123456)');
          setPinDigits([]);
        }
      }
    }
  };

  const handleDelete = () => {
    setPinDigits((prev) => prev.slice(0, -1));
  };

  const handleBiometricUnlock = () => {
    setIsVerifyingBio(true);
    setErrorMsg(null);
    setTimeout(() => {
      setIsVerifyingBio(false);
      onUnlock();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black text-white select-none">
      <motion.div 
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={iosSpringTransition}
        className="w-full max-w-sm flex flex-col items-center text-center space-y-6"
      >
        {/* Brand & User Avatar (Apple Lock Screen style) */}
        <div className="flex flex-col items-center">
          <div className="relative mb-3">
            <img
              src={user.avatarUrl}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-full object-cover ring-4 ring-[#2C2C2E] shadow-2xl"
            />
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-white text-black shadow-md">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white">
            {user.name}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-[#8E8E93] mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#30D158]" />
            <span>Apple Secure Enclave (Sim)</span>
          </div>
        </div>

        {/* PIN Indicators */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-center gap-3.5 py-2">
            {[0, 1, 2, 3, 4, 5].map((idx) => (
              <motion.div
                key={idx}
                animate={{
                  scale: pinDigits.length > idx ? 1.25 : 1,
                  backgroundColor: pinDigits.length > idx ? '#ffffff' : 'transparent',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className={`w-3.5 h-3.5 rounded-full border-2 ${
                  pinDigits.length > idx ? 'border-white' : 'border-[#3A3A3C]'
                }`}
              />
            ))}
          </div>

          {errorMsg && (
            <p className="text-xs text-[#FF453A] font-medium">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Biometric One-Tap Trigger */}
        {user.biometricEnabled && (
          <motion.button
            whileTap={iosQuickTap}
            type="button"
            onClick={handleBiometricUnlock}
            disabled={isVerifyingBio}
            className="flex items-center gap-2 py-2 px-5 rounded-full bg-[#1C1C1E] border border-white/10 hover:border-white/20 text-xs font-semibold text-white transition-all shadow-md"
          >
            <Fingerprint className={`w-4 h-4 text-[#30D158] ${isVerifyingBio ? 'animate-spin' : ''}`} />
            <span>{isVerifyingBio ? 'Memverifikasi...' : 'Buka dengan Face ID / Touch ID'}</span>
          </motion.button>
        )}

        {/* Apple Lock Screen Circular Dial Keypad */}
        <div className="w-full max-w-[280px] grid grid-cols-3 gap-3.5 pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <motion.button
              key={digit}
              whileTap={iosQuickTap}
              type="button"
              onClick={() => handleKey(digit)}
              className="w-18 h-18 mx-auto rounded-full bg-[#1C1C1E] hover:bg-[#2C2C2E] text-white flex flex-col items-center justify-center border border-white/[0.06] transition-all shadow-sm"
            >
              <span className="font-sans font-medium text-2xl leading-none">{digit}</span>
              {dialLetters[digit] && (
                <span className="text-[9px] tracking-widest text-[#8E8E93] font-bold mt-1">
                  {dialLetters[digit]}
                </span>
              )}
            </motion.button>
          ))}
          <motion.button
            whileTap={iosQuickTap}
            type="button"
            onClick={handleBiometricUnlock}
            className="w-18 h-18 mx-auto rounded-full flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors"
            title="Biometrik"
          >
            <Fingerprint className="w-7 h-7 text-[#0A84FF]" />
          </motion.button>
          <motion.button
            key="0"
            whileTap={iosQuickTap}
            type="button"
            onClick={() => handleKey('0')}
            className="w-18 h-18 mx-auto rounded-full bg-[#1C1C1E] hover:bg-[#2C2C2E] text-white flex flex-col items-center justify-center border border-white/[0.06] transition-all shadow-sm"
          >
            <span className="font-sans font-medium text-2xl leading-none">0</span>
          </motion.button>
          <motion.button
            whileTap={iosQuickTap}
            type="button"
            onClick={handleDelete}
            className="w-18 h-18 mx-auto rounded-full flex items-center justify-center text-[#8E8E93] hover:text-white transition-all"
            aria-label="Hapus"
          >
            <Delete className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Quick Demo Bypass */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onUnlock}
            className="text-xs text-[#8E8E93] hover:text-white underline font-medium"
          >
            Lewati (Masuk Langsung Sebagai Demo User)
          </button>
        </div>
      </motion.div>
    </div>
  );
};
