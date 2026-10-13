import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Copy, 
  Check, 
  Wifi, 
  Sparkles,
  Lock,
  Layers
} from 'lucide-react';
import { UserProfile } from '../types';
import { formatCurrency } from '../utils/formatters';
import { sounds } from '../utils/sound';
import { iosBackdropVariants, iosQuickTap } from '../utils/motion';

interface VirtualCard3DProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  balance: number;
  onRequestFaceId: (onSuccess: () => void) => void;
}

type CardFinish = 'space-black' | 'titanium-white' | 'gold-edition';

export const VirtualCard3D: React.FC<VirtualCard3DProps> = ({
  isOpen,
  onClose,
  user,
  balance,
  onRequestFaceId,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [finish, setFinish] = useState<CardFinish>('space-black');
  const [showFullNumber, setShowFullNumber] = useState(false);
  const [copied, setCopied] = useState(false);

  // 3D Tilt coordinates (-1 to 1)
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Gyroscope listener for mobile devices
  useEffect(() => {
    if (!isOpen) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        // gamma is left-to-right (-90 to 90)
        // beta is front-to-back (-180 to 180)
        const x = Math.min(Math.max(e.gamma / 30, -1), 1);
        const y = Math.min(Math.max((e.beta - 45) / 30, -1), 1);
        setTilt({ x, y });
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleFlipCard = () => {
    sounds.playHapticClick();
    setIsFlipped(!isFlipped);
  };

  const handleToggleReveal = () => {
    if (!showFullNumber) {
      // Trigger Face ID before revealing sensitive card number
      onRequestFaceId(() => {
        setShowFullNumber(true);
      });
    } else {
      setShowFullNumber(false);
      sounds.playHapticClick();
    }
  };

  const handleCopyCardNumber = () => {
    navigator.clipboard.writeText('4532 8901 2345 8842');
    setCopied(true);
    sounds.playHapticClick();
    setTimeout(() => setCopied(false), 2000);
  };

  // Card themes
  const finishStyles = {
    'space-black': {
      cardBg: 'bg-gradient-to-br from-[#1C1C1E] via-[#2A2A2E] to-[#121214]',
      border: 'border-white/[0.16]',
      textPrimary: 'text-white',
      textSecondary: 'text-zinc-400',
      sheen: 'from-white/[0.22] via-emerald-400/[0.12] to-transparent',
      label: 'Space Black Titanium',
    },
    'titanium-white': {
      cardBg: 'bg-gradient-to-br from-[#E5E5EA] via-[#F2F2F7] to-[#D1D1D6]',
      border: 'border-black/[0.12]',
      textPrimary: 'text-zinc-900',
      textSecondary: 'text-zinc-600',
      sheen: 'from-white/[0.45] via-sky-300/[0.2] to-transparent',
      label: 'Natural Titanium',
    },
    'gold-edition': {
      cardBg: 'bg-gradient-to-br from-[#2D2418] via-[#4A3B24] to-[#1E1810]',
      border: 'border-[#E5C158]/[0.35]',
      textPrimary: 'text-[#F9E7B3]',
      textSecondary: 'text-[#C5A869]',
      sheen: 'from-[#FDF2C8]/[0.3] via-[#E5C158]/[0.15] to-transparent',
      label: 'Gold Titanium Edition',
    },
  }[finish];

  // Calculated 3D Rotation angles
  const rotateX = -tilt.y * 14;
  const rotateY = tilt.x * 16 + (isFlipped ? 180 : 0);
  const sheenTranslateX = tilt.x * 50;
  const sheenTranslateY = tilt.y * 50;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        {/* Backdrop */}
        <motion.div
          variants={iosBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-[#161618] border border-white/10 rounded-[36px] p-6 text-white shadow-2xl shadow-black/90 z-10 overflow-hidden flex flex-col items-center"
        >
          {/* Header */}
          <div className="w-full flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">
                Kai Card Titanium 3D
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                Apple Pay Integrated
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Finish Switcher */}
          <div className="flex gap-2 my-4">
            {(['space-black', 'titanium-white', 'gold-edition'] as CardFinish[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setFinish(f);
                  sounds.playHapticClick();
                }}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                  finish === f
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'bg-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                {f === 'space-black' ? 'Space Black' : f === 'titanium-white' ? 'Titanium' : 'Gold'}
              </button>
            ))}
          </div>

          {/* 3D Interactive Card Viewport */}
          <div 
            className="w-full py-4 flex items-center justify-center [perspective:1000px]"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div
              ref={cardRef}
              animate={{
                rotateX,
                rotateY,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 24,
              }}
              style={{
                transformStyle: 'preserve-3d',
              }}
              className={`relative w-full aspect-[1.586/1] max-w-[340px] rounded-[24px] p-6 shadow-2xl border transition-colors cursor-grab active:cursor-grabbing ${finishStyles.cardBg} ${finishStyles.border}`}
            >
              {/* Dynamic Holographic Iridescent Sheen Layer */}
              <div
                className={`absolute inset-0 rounded-[24px] pointer-events-none bg-gradient-to-tr ${finishStyles.sheen} mix-blend-overlay opacity-80 transition-opacity`}
                style={{
                  transform: `translate(${sheenTranslateX}px, ${sheenTranslateY}px)`,
                }}
              />

              {/* CARD FRONT SIDE */}
              <div 
                className={`absolute inset-0 p-6 flex flex-col justify-between [backface-visibility:hidden] ${
                  isFlipped ? 'pointer-events-none opacity-0' : 'opacity-100'
                }`}
              >
                {/* Front Top: Wordmark & Chip */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-lg font-black tracking-tight ${finishStyles.textPrimary}`}>
                      Kai
                    </span>
                    <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md bg-white text-black tracking-wider">
                      Card
                    </span>
                  </div>

                  {/* Contactless Wave */}
                  <div className={`p-1.5 rounded-full ${finishStyles.textSecondary}`}>
                    <Wifi className="w-5 h-5 rotate-90" />
                  </div>
                </div>

                {/* EMV Metallic Microchip */}
                <div className="w-11 h-9 rounded-lg bg-gradient-to-tr from-[#E5C158] via-[#F3E0A2] to-[#B38F39] border border-black/30 shadow-inner flex items-center justify-center overflow-hidden my-auto">
                  <div className="w-full h-full border-t border-b border-black/20 flex divide-x divide-black/20">
                    <div className="flex-1" />
                    <div className="flex-1" />
                    <div className="flex-1" />
                  </div>
                </div>

                {/* Front Bottom: Cardholder & Number */}
                <div className="flex items-end justify-between pt-2">
                  <div>
                    <p className={`text-[10px] uppercase tracking-wider font-bold ${finishStyles.textSecondary}`}>
                      Cardholder
                    </p>
                    <p className={`text-sm font-bold tracking-wide truncate max-w-[180px] ${finishStyles.textPrimary}`}>
                      {user.name}
                    </p>
                    <p className={`text-xs font-mono tracking-widest mt-1 ${finishStyles.textSecondary}`}>
                      {showFullNumber ? '4532 8901 2345 8842' : '•••• •••• •••• 8842'}
                    </p>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-[#EB001B]/90" />
                      <div className="w-6 h-6 rounded-full bg-[#F79E1B]/90" />
                    </div>
                    <span className={`text-[9px] font-bold tracking-tight uppercase mt-1 ${finishStyles.textSecondary}`}>
                      Mastercard
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD BACK SIDE (180deg) */}
              <div 
                className={`absolute inset-0 p-6 flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] ${
                  isFlipped ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
              >
                {/* Magnetic Stripe */}
                <div className="absolute top-6 inset-x-0 h-10 bg-black/90 shadow-inner" />

                {/* CVV & Signature Area */}
                <div className="mt-14 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400">
                    <span>Authorized Signature</span>
                    <span>Security CVV</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-7 bg-white/20 rounded font-serif italic text-xs text-white px-3 flex items-center">
                      {user.name}
                    </div>
                    <div className="w-12 h-7 bg-white/30 rounded font-mono font-bold text-xs text-white flex items-center justify-center">
                      {showFullNumber ? '829' : '•••'}
                    </div>
                  </div>
                </div>

                {/* Back Footer */}
                <div className="flex items-center justify-between pt-4 text-[9px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    100% Titanium Alloy
                  </span>
                  <span className="font-mono">Exp: 08/30</span>
                </div>
              </div>
            </motion.div>
          </div>

          <p className="text-[11px] text-zinc-400 text-center my-2">
            Goyangkan perangkat atau gerakkan kursor untuk melihat pantulan kilau giroskop 3D.
          </p>

          {/* Action Buttons Row */}
          <div className="w-full grid grid-cols-3 gap-2 mt-2">
            <motion.button
              whileTap={iosQuickTap}
              type="button"
              onClick={handleFlipCard}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isFlipped ? 'Lihat Depan' : 'Balik 3D'}</span>
            </motion.button>

            <motion.button
              whileTap={iosQuickTap}
              type="button"
              onClick={handleToggleReveal}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
            >
              {showFullNumber ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showFullNumber ? 'Sembunyikan' : 'Face ID'}</span>
            </motion.button>

            <motion.button
              whileTap={iosQuickTap}
              type="button"
              onClick={handleCopyCardNumber}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin No'}</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
