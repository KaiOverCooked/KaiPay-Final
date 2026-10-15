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
  Layers,
  Hand,
  ChevronLeft,
  ChevronRight,
  CreditCard
} from 'lucide-react';
import { UserProfile } from '../types';
import { formatCurrency } from '../utils/formatters';
import { sounds } from '../utils/sound';
import { iosBackdropVariants, iosQuickTap, iosSpringTransition } from '../utils/motion';

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
  const [viewMode, setViewMode] = useState<'single' | 'stacked'>('single');

  // Gesture Touch/Mouse Multi-Direction 3D Drag State (Gyro fully removed)
  const [rotation, setRotation] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPointerDown, setIsPointerDown] = useState(false);
  const pointerStartRef = useRef<{ x: number; y: number; rotX: number; rotY: number }>({ x: 0, y: 0, rotX: 0, rotY: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Available finishes for horizontal swipe cycling
  const finishes: CardFinish[] = ['space-black', 'titanium-white', 'gold-edition'];

  // Reset rotation when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setRotation({ x: 0, y: 0 });
      setIsFlipped(false);
      setIsPointerDown(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Touch & Pointer Drag Handlers (Multi-directional 3D rotate with finger & mouse)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsPointerDown(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: rotation.x,
      rotY: rotation.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDown) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;

    // Smooth rotational scaling with Apple spring clamping (up to ±35 deg)
    const nextRotY = Math.max(Math.min(pointerStartRef.current.rotY + dx * 0.22, 36), -36);
    const nextRotX = Math.max(Math.min(pointerStartRef.current.rotX - dy * 0.22, 34), -34);

    setRotation({ x: nextRotX, y: nextRotY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDown) return;
    setIsPointerDown(false);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}

    const dx = e.clientX - pointerStartRef.current.x;
    // Free horizontal swipe threshold to switch card finish
    if (Math.abs(dx) > 110) {
      sounds.playHapticClick();
      const currentIndex = finishes.indexOf(finish);
      if (dx < 0) {
        // Swiped Left -> Next Card
        const nextIdx = (currentIndex + 1) % finishes.length;
        setFinish(finishes[nextIdx]);
      } else {
        // Swiped Right -> Previous Card
        const prevIdx = (currentIndex - 1 + finishes.length) % finishes.length;
        setFinish(finishes[prevIdx]);
      }
    }

    // Smooth Apple spring snapback to resting pose
    setRotation({ x: 0, y: 0 });
  };

  const handleFlipCard = () => {
    sounds.playHapticClick();
    setIsFlipped(!isFlipped);
  };

  const handleToggleReveal = () => {
    if (!showFullNumber) {
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
    sounds.playApplePayChime();
    setTimeout(() => setCopied(false), 2000);
  };

  // Apple Titanium Finishes & Right-Sided Directional Specular Light
  const finishStyles = {
    'space-black': {
      cardBg: 'bg-gradient-to-br from-[#1C1C1E] via-[#242427] to-[#121214]',
      border: 'border-white/[0.18]',
      rimBorder: 'border-r-white/50',
      textPrimary: 'text-white',
      textSecondary: 'text-zinc-400',
      chipGradient: 'from-[#E5C158] via-[#FDF2C8] to-[#99772B]',
      specular: 'from-transparent via-white/[0.22] to-white/[0.06]',
      rightLightGlow: 'bg-gradient-to-l from-white/[0.30] via-white/[0.10] to-transparent',
      rightRimGlow: 'shadow-[inset_-10px_0_24px_rgba(255,255,255,0.18)]',
      label: 'Space Black Titanium',
    },
    'titanium-white': {
      cardBg: 'bg-gradient-to-br from-[#F8F8FA] via-[#EAEAEE] to-[#D6D6DC]',
      border: 'border-black/[0.15]',
      rimBorder: 'border-r-white/80',
      textPrimary: 'text-zinc-950',
      textSecondary: 'text-zinc-600',
      chipGradient: 'from-[#C0C0C8] via-[#FFFFFF] to-[#8E8E93]',
      specular: 'from-transparent via-white/[0.7] to-white/[0.2]',
      rightLightGlow: 'bg-gradient-to-l from-white/[0.75] via-white/[0.25] to-transparent',
      rightRimGlow: 'shadow-[inset_-10px_0_24px_rgba(255,255,255,0.45)]',
      label: 'Natural Titanium',
    },
    'gold-edition': {
      cardBg: 'bg-gradient-to-br from-[#3A2F1F] via-[#4D3F2A] to-[#241D13]',
      border: 'border-[#E5C158]/[0.45]',
      rimBorder: 'border-r-[#FFEAA7]/70',
      textPrimary: 'text-[#FDF2C8]',
      textSecondary: 'text-[#CDB07B]',
      chipGradient: 'from-[#FFEAA7] via-[#FFF6D6] to-[#C99E32]',
      specular: 'from-transparent via-[#FFEAA7]/[0.4] to-transparent',
      rightLightGlow: 'bg-gradient-to-l from-[#FFEAA7]/[0.45] via-[#E5C158]/[0.16] to-transparent',
      rightRimGlow: 'shadow-[inset_-10px_0_24px_rgba(255,234,167,0.25)]',
      label: 'Gold Titanium Edition',
    },
  }[finish];

  // Calculated 3D angles
  const finalRotX = rotation.x;
  const finalRotY = rotation.y + (isFlipped ? 180 : 0);

  // Dynamic light translation based on hand drag
  const lightShiftX = (rotation.y / 36) * 45;
  const lightShiftY = -(rotation.x / 34) * 35;

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
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={iosSpringTransition}
          className="relative w-full max-w-md bg-[#161618] border border-white/12 rounded-[36px] p-6 text-white shadow-2xl shadow-black/95 z-10 overflow-hidden flex flex-col items-center"
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
              aria-label="Tutup pratinjau kartu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Selector & Finish Bar */}
          <div className="w-full flex items-center justify-between my-3 gap-2">
            {/* Finishes Pills */}
            <div className="flex gap-1.5">
              {finishes.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    setFinish(f);
                    sounds.playHapticClick();
                  }}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                    finish === f
                      ? 'bg-white text-black font-bold shadow-md'
                      : 'bg-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  {f === 'space-black' ? 'Space Black' : f === 'titanium-white' ? 'Titanium' : 'Gold'}
                </button>
              ))}
            </div>

            {/* Toggle Stack / Single View */}
            <button
              type="button"
              onClick={() => {
                setViewMode(viewMode === 'single' ? 'stacked' : 'single');
                sounds.playHapticClick();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-xs text-zinc-300 hover:text-white transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-ios-accent" />
              <span>{viewMode === 'single' ? 'Tumpukan' : 'Fokus 3D'}</span>
            </button>
          </div>

          {/* 3D INTERACTIVE VIEWPORT */}
          <div 
            className="w-full py-6 flex items-center justify-center [perspective:1400px] touch-none"
          >
            {/* STACKED WALLET CASCADE MODE (Ala Apple Wallet) */}
            {viewMode === 'stacked' ? (
              <div className="relative w-full aspect-[1.586/1] max-w-[340px] h-[220px]">
                {/* Card 1: Apple Cash Behind */}
                <motion.div
                  initial={{ y: 20, scale: 0.9, opacity: 0.7 }}
                  animate={{ y: 0, scale: 0.92, opacity: 0.85 }}
                  className="absolute inset-x-0 top-0 h-[190px] rounded-[24px] bg-gradient-to-br from-[#2C2C2E] to-[#1C1C1E] border border-white/20 p-5 shadow-lg select-none cursor-pointer"
                  onClick={() => {
                    setFinish('space-black');
                    setViewMode('single');
                    sounds.playHapticClick();
                  }}
                >
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-300">
                    <span>Kai Cash</span>
                    <span className="font-mono">{formatCurrency(balance, user.currency)}</span>
                  </div>
                </motion.div>

                {/* Card 2: Titanium Gold Mid */}
                <motion.div
                  initial={{ y: 35, scale: 0.94 }}
                  animate={{ y: 15, scale: 0.96 }}
                  className="absolute inset-x-0 top-0 h-[190px] rounded-[24px] bg-gradient-to-br from-[#3E3220] to-[#251D12] border border-[#E5C158]/35 p-5 shadow-xl select-none cursor-pointer"
                  onClick={() => {
                    setFinish('gold-edition');
                    setViewMode('single');
                    sounds.playHapticClick();
                  }}
                >
                  <div className="flex justify-between items-center text-xs font-bold text-[#FDF2C8]">
                    <span>Kai Gold Reserve</span>
                    <span className="font-mono">•••• 8842</span>
                  </div>
                </motion.div>

                {/* Card 3: Active Card Front */}
                <motion.div
                  layoutId="active-card"
                  onClick={() => setViewMode('single')}
                  className={`absolute inset-x-0 top-6 h-[190px] rounded-[24px] p-5 shadow-2xl border cursor-pointer select-none ${finishStyles.cardBg} ${finishStyles.border}`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-base font-black ${finishStyles.textPrimary}`}>Kai Card</span>
                    <Wifi className={`w-4 h-4 rotate-90 ${finishStyles.textSecondary}`} />
                  </div>
                  <div className="mt-8">
                    <p className={`text-xs font-mono tracking-widest ${finishStyles.textSecondary}`}>
                      •••• •••• •••• 8842
                    </p>
                    <p className={`text-xs font-bold mt-1 ${finishStyles.textPrimary}`}>
                      {user.name}
                    </p>
                  </div>
                </motion.div>
              </div>
            ) : (
              /* SINGLE 3D INTERACTIVE CARD WITH HAND GESTURE & RIGHT-SIDE SPECULAR REFLECTION */
              <motion.div
                ref={cardRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                animate={{
                  rotateX: finalRotX,
                  rotateY: finalRotY,
                  scale: isPointerDown ? 1.05 : 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: isPointerDown ? 500 : 300,
                  damping: isPointerDown ? 30 : 25,
                }}
                style={{
                  transformStyle: 'preserve-3d',
                }}
                className={`relative w-full aspect-[1.586/1] max-w-[340px] rounded-[26px] p-6 shadow-2xl border transition-colors cursor-grab active:cursor-grabbing ${finishStyles.cardBg} ${finishStyles.border} ${finishStyles.rightRimGlow} shadow-black/85`}
              >
                {/* 1. RIGHT-SIDE DIRECTIONAL AMBIENT LIGHT SOURCE (User Requirement) */}
                <div 
                  className={`absolute -right-3 top-0 bottom-0 w-44 pointer-events-none rounded-r-[26px] blur-xl opacity-85 ${finishStyles.rightLightGlow}`}
                  style={{
                    transform: `translate(${lightShiftX}px, ${lightShiftY}px)`,
                  }}
                />

                {/* 2. DYNAMIC SPECULAR REFLECTION SHEEN GLIDING WITH TOUCH DRAG */}
                <div
                  className={`absolute inset-0 rounded-[26px] pointer-events-none bg-gradient-to-tr ${finishStyles.specular} mix-blend-overlay transition-opacity`}
                  style={{
                    opacity: isPointerDown ? 0.95 : 0.75,
                    transform: `translate(${lightShiftX * 1.6}px, ${lightShiftY * 1.6}px)`,
                  }}
                />

                {/* 3. CARD RIM EDGE LIGHT (Right edge specular bevel reflection) */}
                <div className={`absolute top-0 right-0 bottom-0 w-2 rounded-r-[26px] ${finishStyles.rimBorder} pointer-events-none`} />

                {/* CARD FRONT SIDE */}
                <div 
                  className={`absolute inset-0 p-6 flex flex-col justify-between [backface-visibility:hidden] ${
                    isFlipped ? 'pointer-events-none opacity-0' : 'opacity-100'
                  }`}
                  style={{ transform: 'translateZ(24px)' }}
                >
                  {/* Front Top: Wordmark & Chip */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xl font-black tracking-tight ${finishStyles.textPrimary}`}>
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

                  {/* EMV Metallic Microchip with 3D Depth */}
                  <div 
                    style={{ transform: 'translateZ(30px)' }}
                    className={`w-12 h-9 rounded-lg bg-gradient-to-tr ${finishStyles.chipGradient} border border-black/35 shadow-inner flex items-center justify-center overflow-hidden my-auto shadow-md`}
                  >
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
                  style={{ transform: 'rotateY(180deg) translateZ(24px)' }}
                >
                  {/* Magnetic Stripe */}
                  <div className="absolute top-6 inset-x-0 h-10 bg-black shadow-inner border-y border-white/10" />

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
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      100% Titanium Alloy
                    </span>
                    <span className="font-mono">Exp: 08/30</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Interactive Hint with Hand & Directional Indicators */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 text-center my-1.5 px-2">
            <Hand className="w-3.5 h-3.5 text-ios-accent animate-pulse" />
            <span>Geser kartu ke segala arah dengan jari/mouse untuk pantulan cahaya kanan. Usap horizontal untuk ganti edisi.</span>
          </div>

          {/* Action Buttons Row */}
          <div className="w-full grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10">
            <motion.button
              whileTap={iosQuickTap}
              type="button"
              onClick={handleFlipCard}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isFlipped ? 'Sisi Depan' : 'Putar 3D'}</span>
            </motion.button>

            <motion.button
              whileTap={iosQuickTap}
              type="button"
              onClick={handleToggleReveal}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
            >
              {showFullNumber ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showFullNumber ? 'Tutup' : 'Face ID'}</span>
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
