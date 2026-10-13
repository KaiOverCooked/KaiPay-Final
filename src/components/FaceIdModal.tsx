import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Check, AlertCircle, X } from 'lucide-react';
import { sounds } from '../utils/sound';
import { iosBackdropVariants, iosQuickTap } from '../utils/motion';

interface FaceIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  subtitle?: string;
}

export const FaceIdModal: React.FC<FaceIdModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Autentikasi Face ID',
  subtitle = 'Arahkan wajah Anda ke sensor kamera TrueDepth',
}) => {
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setPhase('idle');
      setProgress(0);
      return;
    }

    // Start Face ID process
    setPhase('scanning');
    setProgress(15);
    sounds.playCameraShutter();

    const pTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(pTimer);
          return 100;
        }
        return prev + 25;
      });
    }, 250);

    const finishTimer = setTimeout(() => {
      clearInterval(pTimer);
      setPhase('success');
      sounds.playFaceIdSuccess();

      const doneTimer = setTimeout(() => {
        onSuccess();
      }, 700);

      return () => clearTimeout(doneTimer);
    }, 1200);

    return () => {
      clearInterval(pTimer);
      clearTimeout(finishTimer);
    };
  }, [isOpen, onSuccess]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          variants={iosBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* 3D Face ID Glassy Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-sm rounded-[36px] bg-[#161618]/95 border border-white/20 p-7 text-white text-center shadow-2xl shadow-black/80 backdrop-blur-2xl overflow-hidden z-10"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#007AFF]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            aria-label="Batalkan Face ID"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Face ID Icon with 3D scanning mesh overlay */}
          <div className="relative mx-auto w-28 h-28 my-4 flex items-center justify-center">
            {/* Outer Apple Square-Rounded Ring with Corner Brackets */}
            <div className="relative w-28 h-28 rounded-[28px] border-2 border-white/30 flex items-center justify-center overflow-hidden">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-white" />
              <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-white" />
              <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-white" />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-white" />

              {/* Face Glyphs */}
              <AnimatePresence mode="wait">
                {phase === 'success' ? (
                  <motion.div
                    key="success-check"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="w-16 h-16 rounded-full bg-[#30D158] text-white flex items-center justify-center shadow-lg shadow-[#30D158]/40"
                  >
                    <Check className="w-10 h-10 stroke-[3.5]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="face-glyph"
                    className="relative flex flex-col items-center justify-center"
                  >
                    {/* Apple Classic Face ID Eyes and Smile */}
                    <div className="flex gap-4 mb-2">
                      <div className="w-2.5 h-4 bg-white rounded-full" />
                      <div className="w-2.5 h-4 bg-white rounded-full" />
                    </div>
                    {/* Nose line */}
                    <div className="w-1 h-3.5 bg-white/70 rounded-full mb-1" />
                    {/* Smile curve */}
                    <div className="w-7 h-3 border-b-2 border-white rounded-full" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Biometric Mesh Scanning Laser Beam (Scanning Phase) */}
              {phase === 'scanning' && (
                <motion.div
                  initial={{ top: '-10%' }}
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                  className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#0A84FF] to-transparent shadow-[0_0_12px_#0A84FF]"
                />
              )}
            </div>

            {/* Glowing Ring on Success */}
            {phase === 'success' && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.15, opacity: 1 }}
                className="absolute inset-0 rounded-[32px] border-2 border-[#30D158]/60 blur-[2px]"
              />
            )}
          </div>

          {/* Text Feedback */}
          <div className="space-y-1 my-2">
            <h3 className="text-lg font-bold tracking-tight text-white">
              {phase === 'success' ? 'Verifikasi Selesai' : title}
            </h3>
            <p className="text-xs text-zinc-400">
              {phase === 'success' ? 'Identitas biometrik terkonfirmasi.' : subtitle}
            </p>
          </div>

          {/* Progress Indicator */}
          {phase === 'scanning' && (
            <div className="mt-5 w-44 mx-auto h-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-[#0A84FF] rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          )}

          {/* Footer Lockup */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>Apple Secure Enclave Certified</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
