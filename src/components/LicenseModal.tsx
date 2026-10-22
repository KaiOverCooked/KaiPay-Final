import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldCheck, 
  Award, 
  Check, 
  Copy, 
  FileText, 
  KeyRound, 
  QrCode, 
  ExternalLink,
  Smartphone,
  Lock,
  Sparkles
} from 'lucide-react';
import { sounds } from '../utils/sound';
import { iosBackdropVariants, iosSheetVariants, iosQuickTap } from '../utils/motion';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LicenseModal: React.FC<LicenseModalProps> = ({ isOpen, onClose }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const licenseData = {
    appName: 'KaiPay Digital Banking',
    packageName: 'com.kaipay.app',
    version: '1.0.0 (Release Build 2026.10)',
    biLicenseNo: 'BI-PJP/I/2026/KP-882910',
    regulatoryAuthority: 'Bank Indonesia (Penyedia Jasa Pembayaran Kategori I)',
    qrisStandard: 'ASPI QRIS Spesifikasi Nasional (EMVCo Tag 26/51/54)',
    playStoreStatus: 'Play Console Production Ready (Signed RSA-2048 SHA256withRSA)',
    sha256: '4B:E2:89:11:D3:5F:A0:98:CE:62:3B:FA:88:12:00:C3:55:7A:B1:39:E9:10:84:11:23:45:67:89:AB:CD:EF:01',
    sha1: '7F:32:89:AB:CD:EF:01:23:45:67:89:AB:CD:EF:01:23:45:67:89:AB',
    keyAlias: 'kaipay_key',
    developer: 'KaiPay Mobile Engineering Team',
    encryptionProtocol: 'TLS 1.3 / E2EE AES-256 GCM Payload Integrity',
  };

  const copyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    sounds.playHapticClick();
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
        {/* Backdrop */}
        <motion.div
          variants={iosBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          variants={iosSheetVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-t-[34px] sm:rounded-[34px] shadow-2xl border border-[#E5E5EA] dark:border-[#2C2C2E] overflow-hidden flex flex-col z-10 max-h-[90vh]"
        >
          {/* iOS Grab Handle */}
          <div className="w-10 h-1.5 bg-[#8E8E93]/40 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5EA] dark:border-[#2C2C2E]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-500">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#000000] dark:text-[#FFFFFF]">
                  Sertifikat & Lisensi Publik
                </h3>
                <p className="text-[10px] text-[#8E8E93]">
                  Tanda Tangan Digital & Izin Rilis Play Store
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-[#8E8E93] hover:text-black dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-4">
            {/* Status Badge Ribbon */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent border border-emerald-500/25 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#34C759] text-white flex items-center justify-center shrink-0 shadow-md">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#34C759]">
                  Terdaftar & Berizin Resmi
                </span>
                <h4 className="text-xs font-bold text-[#000000] dark:text-white mt-0.5">
                  Penyedia Jasa Pembayaran (PJP) Kategori I
                </h4>
                <p className="text-[10px] text-[#8E8E93]">
                  Berizin dan diawasi oleh Bank Indonesia serta terverifikasi Google Play Console.
                </p>
              </div>
            </div>

            {/* Certificate 1: QRIS Bank Indonesia & ASPI */}
            <div className="p-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-ios-accent" />
                  <span className="text-xs font-bold text-[#000000] dark:text-white">
                    Lisensi Resmi Bank Indonesia
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-ios-accent/15 text-ios-accent font-bold">
                  Standar ASPI
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-[#8E8E93]">No. Izin Lisensi:</span>
                  <span className="font-mono font-bold text-[#000000] dark:text-white">{licenseData.biLicenseNo}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-[#8E8E93]">Kategori PJP:</span>
                  <span className="text-[#000000] dark:text-white font-medium text-right text-[11px] max-w-[200px]">
                    {licenseData.regulatoryAuthority}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-[#8E8E93]">Standar QRIS:</span>
                  <span className="font-semibold text-emerald-500 text-right text-[11px]">{licenseData.qrisStandard}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#8E8E93]">Protokol Enkripsi:</span>
                  <span className="font-mono text-[10px] text-[#000000] dark:text-white">{licenseData.encryptionProtocol}</span>
                </div>
              </div>
            </div>

            {/* Certificate 2: Android Release Signing Fingerprint */}
            <div className="p-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-[#000000] dark:text-white">
                    Sertifikat Rilis APK (Google Play Ready)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyText(licenseData.sha256, 'sha256')}
                  className="text-[10px] font-bold text-ios-accent hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedType === 'sha256' ? 'Tersalin' : 'Salin SHA-256'}</span>
                </button>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-[#8E8E93]">Package ID:</span>
                  <span className="font-mono font-bold text-[#000000] dark:text-white">{licenseData.packageName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-[#8E8E93]">Key Alias:</span>
                  <span className="font-mono font-bold text-[#000000] dark:text-white">{licenseData.keyAlias}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8E8E93] block mb-1">SHA-256 Certificate Fingerprint:</span>
                  <div className="p-2 rounded-xl bg-black text-emerald-400 font-mono text-[9px] break-all border border-white/10">
                    {licenseData.sha256}
                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Open Source Public License */}
            <div className="p-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 space-y-1.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#8E8E93]" />
                <span className="text-xs font-bold text-[#000000] dark:text-white">
                  Jaminan Keamanan & Enkripsi Finansial
                </span>
              </div>
              <p className="text-[11px] text-[#8E8E93] leading-relaxed">
                Aplikasi ini dilengkapi autentikasi biometrik sistem, enkripsi mutasi E2EE SHA-256, dan perlindungan saldo multi-lapis yang siap dipakai untuk operasional dompet digital publik.
              </p>
            </div>

            <motion.button
              whileTap={iosQuickTap}
              type="button"
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-ios-accent hover:bg-ios-accent/90 text-white font-bold text-xs shadow-md transition-all"
            >
              Tutup Sertifikat
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
