import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Camera, 
  ShieldCheck, 
  Fingerprint, 
  Lock, 
  Coins, 
  RotateCcw, 
  Check, 
  Smartphone, 
  Sparkles, 
  Layers, 
  Terminal, 
  Download, 
  Copy, 
  ExternalLink,
  MessageSquare,
  Award,
  Radio,
  Bell,
  Users,
  Store,
  ChevronRight
} from 'lucide-react';
import { UserProfile, CurrencyCode, CURRENCY_RATES } from '../types';
import { generateQuickPinHash } from '../utils/crypto';
import { iosQuickTap } from '../utils/motion';
import { sounds } from '../utils/sound';
import { USER_PERSONAL, USER_MERCHANT } from '../utils/storage';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onResetData: () => void;
  onOpenDevicePermissions?: () => void;
  onOpenOtpVerification?: () => void;
  onOpenLicenseModal?: () => void;
  onSwitchAccount?: (targetAccountId: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateUser,
  onResetData,
  onOpenDevicePermissions,
  onOpenOtpVerification,
  onOpenLicenseModal,
  onSwitchAccount,
}) => {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email);
  const [isSaved, setIsSaved] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [copiedGradleCommand, setCopiedGradleCommand] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  ];

  const iosAccents = [
    { id: 'blue', label: 'Apple Blue', hex: '#007AFF' },
    { id: 'monochrome', label: 'Titanium Hitam', hex: '#1C1C1E' },
    { id: 'green', label: 'Apple Green', hex: '#34C759' },
    { id: 'purple', label: 'Apple Indigo', hex: '#5856D6' },
    { id: 'orange', label: 'Action Orange', hex: '#FF9500' },
  ] as const;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ name, phone, email });
    sounds.playApplePayChime();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUpdateUser({ avatarUrl: reader.result });
          sounds.playHapticClick();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePin = () => {
    if (newPin.length === 6) {
      onUpdateUser({ pin: generateQuickPinHash(newPin) });
      sounds.playApplePayChime();
      setIsChangingPin(false);
      setNewPin('');
    }
  };

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedGradleCommand(true);
    sounds.playHapticClick();
    setTimeout(() => setCopiedGradleCommand(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* iOS Settings Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#000000] dark:text-[#FFFFFF]">
          Pengaturan Akun & Tampilan
        </h2>
        <p className="text-xs text-[#6C6C70] dark:text-[#8E8E93] mt-0.5">
          Kelola profil personal, tema Apple iOS, aksen warna, konfigurasi build APK Android, dan keamanan
        </p>
      </div>

      {/* iOS Display & Appearance Picker (Tampilan & Kecerahan ala iPhone) */}
      <div className="p-6 rounded-[26px] bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-ios-accent" />
            <h3 className="text-sm font-bold text-[#000000] dark:text-[#FFFFFF]">
              Tampilan & Tema iPhone
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-ios-accent bg-ios-accent-subtle px-2.5 py-0.5 rounded-full">
            iOS Experience
          </span>
        </div>

        {/* 3 Apple Theme Options: Light, Dark, Monochrome */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Light Mode Mockup */}
          <motion.div
            whileTap={iosQuickTap}
            onClick={() => {
              sounds.playHapticClick();
              onUpdateUser({ theme: 'light' });
            }}
            className={`cursor-pointer rounded-2xl p-3 flex flex-col items-center border-2 transition-all ${
              user.theme === 'light'
                ? 'border-ios-accent bg-ios-accent-subtle shadow-md'
                : 'border-transparent bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="w-full aspect-[9/13] max-w-[120px] rounded-2xl bg-[#F2F2F7] border border-[#D1D1D6] p-2 flex flex-col justify-between shadow-inner relative overflow-hidden select-none">
              <div className="w-10 h-2 bg-black rounded-full mx-auto mb-1" />
              <div className="space-y-1.5 w-full">
                <div className="h-5 rounded-lg bg-white border border-[#E5E5EA] p-1 flex items-center justify-between">
                  <div className="w-6 h-1 bg-[#1C1C1E] rounded-full" />
                  <div className="w-2.5 h-2.5 rounded-full bg-ios-accent" />
                </div>
                <div className="h-8 rounded-lg bg-white border border-[#E5E5EA] p-1.5 flex flex-col justify-center">
                  <div className="w-10 h-1.5 bg-[#000000] rounded-full" />
                  <div className="w-5 h-1 bg-[#8E8E93] rounded-full mt-1" />
                </div>
              </div>
              <div className="w-8 h-0.5 bg-black/40 rounded-full mx-auto mt-1" />
            </div>

            <div className="mt-2.5 flex items-center gap-1.5">
              <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                user.theme === 'light'
                  ? 'border-ios-accent bg-ios-accent text-white'
                  : 'border-[#8E8E93] bg-transparent'
              }`}>
                {user.theme === 'light' && <Check className="w-2 h-2 stroke-[3]" />}
              </div>
              <span className="text-xs font-bold text-[#000000] dark:text-[#FFFFFF]">
                Terang (Light)
              </span>
            </div>
            <span className="text-[10px] text-[#6C6C70] dark:text-[#8E8E93] mt-0.5">
              Porcelain & Glass
            </span>
          </motion.div>

          {/* 2. Dark Mode Mockup */}
          <motion.div
            whileTap={iosQuickTap}
            onClick={() => {
              sounds.playHapticClick();
              onUpdateUser({ theme: 'dark' });
            }}
            className={`cursor-pointer rounded-2xl p-3 flex flex-col items-center border-2 transition-all ${
              user.theme === 'dark'
                ? 'border-ios-accent bg-ios-accent-subtle shadow-md'
                : 'border-transparent bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="w-full aspect-[9/13] max-w-[120px] rounded-2xl bg-[#000000] border border-[#3A3A3C] p-2 flex flex-col justify-between shadow-inner relative overflow-hidden select-none">
              <div className="w-10 h-2 bg-[#1C1C1E] border border-white/10 rounded-full mx-auto mb-1" />
              <div className="space-y-1.5 w-full">
                <div className="h-5 rounded-lg bg-[#1C1C1E] border border-white/10 p-1 flex items-center justify-between">
                  <div className="w-6 h-1 bg-white rounded-full" />
                  <div className="w-2.5 h-2.5 rounded-full bg-ios-accent" />
                </div>
                <div className="h-8 rounded-lg bg-[#1C1C1E] border border-white/10 p-1.5 flex flex-col justify-center">
                  <div className="w-10 h-1.5 bg-white rounded-full" />
                  <div className="w-5 h-1 bg-[#8E8E93] rounded-full mt-1" />
                </div>
              </div>
              <div className="w-8 h-0.5 bg-white/40 rounded-full mx-auto mt-1" />
            </div>

            <div className="mt-2.5 flex items-center gap-1.5">
              <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                user.theme === 'dark'
                  ? 'border-ios-accent bg-ios-accent text-white'
                  : 'border-[#8E8E93] bg-transparent'
              }`}>
                {user.theme === 'dark' && <Check className="w-2 h-2 stroke-[3]" />}
              </div>
              <span className="text-xs font-bold text-[#000000] dark:text-[#FFFFFF]">
                Gelap (Dark OLED)
              </span>
            </div>
            <span className="text-[10px] text-[#6C6C70] dark:text-[#8E8E93] mt-0.5">
              True Black & Slate
            </span>
          </motion.div>

          {/* 3. Monochrome Mode Mockup (Hitam Putih Murni) */}
          <motion.div
            whileTap={iosQuickTap}
            onClick={() => {
              sounds.playHapticClick();
              onUpdateUser({ theme: 'monochrome', accentColor: 'monochrome' });
            }}
            className={`cursor-pointer rounded-2xl p-3 flex flex-col items-center border-2 transition-all ${
              user.theme === 'monochrome'
                ? 'border-white dark:border-white bg-black/10 dark:bg-white/10 shadow-md ring-1 ring-white/20'
                : 'border-transparent bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="w-full aspect-[9/13] max-w-[120px] rounded-2xl bg-black border border-white/25 p-2 flex flex-col justify-between shadow-inner relative overflow-hidden select-none">
              <div className="w-10 h-2 bg-zinc-900 border border-white/20 rounded-full mx-auto mb-1" />
              <div className="space-y-1.5 w-full">
                <div className="h-5 rounded-lg bg-zinc-900 border border-white/20 p-1 flex items-center justify-between">
                  <div className="w-6 h-1 bg-white rounded-full" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                </div>
                <div className="h-8 rounded-lg bg-zinc-900 border border-white/20 p-1.5 flex flex-col justify-center">
                  <div className="w-10 h-1.5 bg-white rounded-full" />
                  <div className="w-5 h-1 bg-zinc-400 rounded-full mt-1" />
                </div>
              </div>
              <div className="w-8 h-0.5 bg-white rounded-full mx-auto mt-1" />
            </div>

            <div className="mt-2.5 flex items-center gap-1.5">
              <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                user.theme === 'monochrome'
                  ? 'border-white bg-white text-black'
                  : 'border-[#8E8E93] bg-transparent'
              }`}>
                {user.theme === 'monochrome' && <Check className="w-2 h-2 stroke-[3]" />}
              </div>
              <span className="text-xs font-bold text-[#000000] dark:text-[#FFFFFF]">
                Hitam-Putih
              </span>
            </div>
            <span className="text-[10px] text-[#6C6C70] dark:text-[#8E8E93] mt-0.5">
              Pure Titanium B&W
            </span>
          </motion.div>
        </div>

        {/* Apple Accent Tint Selector (Aksen Warna Aktif) */}
        <div className="pt-4 border-t border-[#E5E5EA] dark:border-[#2C2C2E]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-bold text-[#000000] dark:text-[#FFFFFF] block">
                Aksen Warna Khas Apple
              </span>
              <span className="text-[11px] text-[#6C6C70] dark:text-[#8E8E93]">
                Mengubah warna tombol, chip aktif, ikon, dan sorotan antarmuka
              </span>
            </div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-ios-accent font-bold">
              {user.accentColor || 'blue'}
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {iosAccents.map((acc) => {
              const isActive = (user.accentColor || 'blue') === acc.id;
              return (
                <motion.button
                  key={acc.id}
                  whileTap={iosQuickTap}
                  type="button"
                  onClick={() => {
                    sounds.playHapticClick();
                    onUpdateUser({ accentColor: acc.id });
                  }}
                  className="flex flex-col items-center gap-1.5 group shrink-0"
                  title={acc.label}
                >
                  <div
                    style={{ backgroundColor: acc.hex }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all group-hover:scale-110 ${
                      isActive 
                        ? 'ring-2 ring-offset-2 ring-ios-accent dark:ring-offset-black scale-105' 
                        : 'border border-black/10 dark:border-white/10'
                    }`}
                  >
                    {isActive && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </div>
                  <span className={`text-[10px] ${isActive ? 'font-bold text-ios-accent' : 'text-[#8E8E93]'}`}>
                    {acc.label.split(' ')[0]}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Profile Card & Avatar */}
      <div className="p-6 rounded-[26px] bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Avatar with Crop Trigger */}
          <div className="relative group">
            <img
              src={user.avatarUrl}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-full object-cover ring-4 ring-[#E5E5EA] dark:ring-[#2C2C2E] shadow-md"
            />
            <motion.button
              whileTap={iosQuickTap}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-ios-accent text-white shadow-lg hover:scale-110 transition-transform ring-2 ring-white dark:ring-black"
              title="Unggah Foto Profil"
            >
              <Camera className="w-4 h-4" />
            </motion.button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarFile}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h3 className="text-lg font-bold text-[#000000] dark:text-[#FFFFFF]">
                {user.name}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#34C759]/15 text-[#34C759] border border-[#34C759]/20">
                Verified Apple ID
              </span>
            </div>
            <p className="text-xs font-mono text-[#6C6C70] dark:text-[#8E8E93] mt-0.5">{user.phone}</p>
            <p className="text-xs text-[#8E8E93]">{user.email}</p>

            {/* Quick Preset Avatars */}
            <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">
              <span className="text-[11px] text-[#8E8E93]">Pilih Avatar:</span>
              {presetAvatars.map((url, i) => (
                <motion.button
                  key={i}
                  whileTap={iosQuickTap}
                  type="button"
                  onClick={() => {
                    sounds.playHapticClick();
                    onUpdateUser({ avatarUrl: url });
                  }}
                  className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-[#D1D1D6] dark:ring-[#3A3A3C] hover:ring-ios-accent transition-all"
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-3 pt-3 border-t border-[#E5E5EA] dark:border-[#2C2C2E]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-transparent text-xs font-medium text-[#000000] dark:text-[#FFFFFF] focus:bg-white dark:focus:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-ios-accent transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1">
                Nomor Telepon
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-transparent text-xs font-mono font-medium text-[#000000] dark:text-[#FFFFFF] focus:bg-white dark:focus:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-ios-accent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1">
              Alamat Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-transparent text-xs font-medium text-[#000000] dark:text-[#FFFFFF] focus:bg-white dark:focus:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-ios-accent transition-all"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <motion.button
              whileTap={iosQuickTap}
              type="submit"
              className="py-2.5 px-5 rounded-full bg-ios-accent hover:bg-ios-accent/90 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <span>Simpan Perubahan</span>
              )}
            </motion.button>
          </div>
        </form>
      </div>

      {/* Android Gradle & APK Build Card (Fitur yang diminta user) */}
      <div className="p-6 rounded-[26px] bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-[#34C759]">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#000000] dark:text-[#FFFFFF]">
                Gradle Wrapper & Build APK Android
              </h3>
              <p className="text-[11px] text-[#6C6C70] dark:text-[#8E8E93]">
                Konfigurasi Gradle v8.2 & GitHub Action siap pasang ke APK
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-[#34C759] border border-emerald-500/20">
            Gradle Ready
          </span>
        </div>

        <div className="space-y-3">
          {/* Status Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 flex items-center gap-2.5">
              <Check className="w-4 h-4 text-[#34C759] shrink-0" />
              <div>
                <span className="font-semibold text-[#000000] dark:text-white block">Gradlew Wrapper</span>
                <span className="text-[10px] text-[#8E8E93]">./gradlew & gradlew.bat (Gradle 8.2)</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 flex items-center gap-2.5">
              <Check className="w-4 h-4 text-[#34C759] shrink-0" />
              <div>
                <span className="font-semibold text-[#000000] dark:text-white block">GitHub Actions Workflow</span>
                <span className="text-[10px] text-[#8E8E93]">.github/workflows/build-apk.yml</span>
              </div>
            </div>
          </div>

          {/* Quick Command Snippet */}
          <div className="p-3.5 rounded-2xl bg-black text-white font-mono text-xs flex items-center justify-between border border-white/10">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-[#34C759]">$</span>
              <span className="text-zinc-300">./gradlew assembleDebug</span>
            </div>

            <motion.button
              whileTap={iosQuickTap}
              type="button"
              onClick={() => copyCommand('./gradlew assembleDebug')}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white shrink-0 ml-2"
              title="Salin Perintah"
            >
              {copiedGradleCommand ? (
                <Check className="w-3.5 h-3.5 text-[#34C759]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </motion.button>
          </div>

          <p className="text-[11px] text-[#8E8E93] leading-relaxed">
            Untuk membangun APK di Android Studio atau GitHub, jalankan perintah di atas. Workflow GitHub Actions akan secara otomatis mengkompilasi file <code className="text-ios-accent">app-debug.apk</code> yang dapat diunduh langsung dari tab Actions pada repositori GitHub Anda.
          </p>
        </div>
      </div>

      {/* Simulasi Dua Pengguna & Uji Real-Time 2 Tab Browser */}
      <div className="p-6 rounded-[26px] bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-ios-accent/15 text-ios-accent">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#000000] dark:text-[#FFFFFF]">
                Uji Transaksi Nyata 2 Tab & Ganti Akun
              </h3>
              <p className="text-[11px] text-[#6C6C70] dark:text-[#8E8E93]">
                Sinkronisasi saldo otomatis antar tab peramban via BroadcastChannel
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-ios-accent/15 text-ios-accent border border-ios-accent/20">
            Live Sync
          </span>
        </div>

        <div className="space-y-3">
          {/* Active Account Switcher */}
          <div className="p-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full animate-pulse ${user.isMerchant ? 'bg-emerald-500' : 'bg-ios-accent'}`} />
                <span className="text-xs font-bold text-[#000000] dark:text-white">
                  Profil Aktif: {user.name} ({user.isMerchant ? 'Merchant QRIS' : 'Pengirim Pribadi'})
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-ios-accent">
                {user.phone}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <motion.button
                whileTap={iosQuickTap}
                type="button"
                onClick={() => {
                  sounds.playHapticClick();
                  if (onSwitchAccount) {
                    onSwitchAccount(USER_PERSONAL.id);
                  }
                }}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  !user.isMerchant
                    ? 'border-ios-accent bg-ios-accent-subtle shadow-sm ring-1 ring-ios-accent'
                    : 'border-transparent bg-white dark:bg-[#1C1C1E] opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-ios-accent text-white flex items-center justify-center font-bold text-xs">
                    KA
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#000000] dark:text-white">Kaelen Adiputra</h5>
                    <p className="text-[10px] text-[#8E8E93]">Pengirim Dana (User)</p>
                  </div>
                </div>
                {!user.isMerchant && <Check className="w-4 h-4 text-ios-accent stroke-[3]" />}
              </motion.button>

              <motion.button
                whileTap={iosQuickTap}
                type="button"
                onClick={() => {
                  sounds.playHapticClick();
                  if (onSwitchAccount) {
                    onSwitchAccount(USER_MERCHANT.id);
                  }
                }}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  user.isMerchant
                    ? 'border-[#34C759] bg-[#34C759]/10 shadow-sm ring-1 ring-[#34C759]'
                    : 'border-transparent bg-white dark:bg-[#1C1C1E] opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#34C759] text-white flex items-center justify-center font-bold text-xs">
                    KK
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#000000] dark:text-white">Kopi Kenangan</h5>
                    <p className="text-[10px] text-[#8E8E93]">Merchant Penerima QRIS</p>
                  </div>
                </div>
                {user.isMerchant && <Check className="w-4 h-4 text-[#34C759] stroke-[3]" />}
              </motion.button>
            </div>

            {/* Open Second Tab Button */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2 items-center justify-between">
              <p className="text-[11px] text-[#6C6C70] dark:text-[#8E8E93]">
                Buka tab baru untuk melihat saldo berpindah secara langsung saat scan barcode.
              </p>
              <motion.button
                whileTap={iosQuickTap}
                type="button"
                onClick={() => {
                  sounds.playHapticClick();
                  const targetRole = user.isMerchant ? 'personal' : 'merchant';
                  const url = `${window.location.origin}${window.location.pathname}?account=${targetRole}`;
                  window.open(url, '_blank');
                }}
                className="w-full sm:w-auto py-2 px-3.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:opacity-90 shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Tab 2 ({user.isMerchant ? 'Pengirim' : 'Merchant'})</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Verifikasi WhatsApp OTP, Sensor Perangkat & Lisensi Publik */}
      <div className="p-6 rounded-[26px] bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#34C759]/15 text-[#34C759]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#000000] dark:text-[#FFFFFF]">
                Verifikasi & Izin Sistem Publik (Go Public)
              </h3>
              <p className="text-[11px] text-[#6C6C70] dark:text-[#8E8E93]">
                Autentikasi OTP WhatsApp, hak akses kamera/sensor, dan sertifikasi Play Store
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#34C759]/15 text-[#34C759] border border-[#34C759]/20">
            Official
          </span>
        </div>

        <div className="space-y-2.5">
          {/* Action 1: WhatsApp OTP */}
          <motion.div
            whileTap={iosQuickTap}
            onClick={() => {
              sounds.playHapticClick();
              if (onOpenOtpVerification) onOpenOtpVerification();
            }}
            className="p-3.5 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#25D366] text-white shadow-sm">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#000000] dark:text-white flex items-center gap-1.5">
                  <span>Verifikasi Nomor WhatsApp</span>
                  <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-md bg-[#25D366]/20 text-[#25D366] font-bold">
                    OTP Terakreditasi
                  </span>
                </h4>
                <p className="text-[10px] text-[#8E8E93]">
                  Simulasi banner notifikasi WhatsApp asli untuk verifikasi nomor telepon
                </p>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-[#8E8E93]" />
          </motion.div>

          {/* Action 2: Device Permissions */}
          <motion.div
            whileTap={iosQuickTap}
            onClick={() => {
              sounds.playHapticClick();
              if (onOpenDevicePermissions) onOpenDevicePermissions();
            }}
            className="p-3.5 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-ios-accent text-white shadow-sm">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#000000] dark:text-white">
                  Izin Kamera, Notifikasi & Perangkat Sekitar
                </h4>
                <p className="text-[10px] text-[#8E8E93]">
                  Hak akses sensor kamera fisik, push notification browser, dan Nearby discovery
                </p>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-[#8E8E93]" />
          </motion.div>

          {/* Action 3: License & Play Store Signed Certificate */}
          <motion.div
            whileTap={iosQuickTap}
            onClick={() => {
              sounds.playHapticClick();
              if (onOpenLicenseModal) onOpenLicenseModal();
            }}
            className="p-3.5 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-white shadow-sm">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#000000] dark:text-white">
                  Sertifikat Lisensi & Tanda Tangan Play Store
                </h4>
                <p className="text-[10px] text-[#8E8E93]">
                  Digital Signature RSA-2048 SHA-256, Lisensi Bank Indonesia & status rilis publik
                </p>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-[#8E8E93]" />
          </motion.div>
        </div>
      </div>

      {/* Currency Selector (iOS Inset Grouped) */}
      <div className="p-6 rounded-[26px] bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#000000] dark:text-[#FFFFFF]">
          Standar Nilai & Mata Uang
        </h3>

        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#3A3A3C] text-ios-accent shadow-sm">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#000000] dark:text-[#FFFFFF]">Standar Mata Uang</p>
              <p className="text-[11px] text-[#6C6C70] dark:text-[#8E8E93]">
                Konversi otomatis nilai saldo & laporan
              </p>
            </div>
          </div>

          <select
            value={user.currency}
            onChange={(e) => {
              sounds.playHapticClick();
              onUpdateUser({ currency: e.target.value as CurrencyCode });
            }}
            className="h-9 px-3 rounded-xl bg-white dark:bg-[#1C1C1E] text-xs font-bold font-mono text-[#000000] dark:text-[#FFFFFF] border border-[#E5E5EA] dark:border-[#3A3A3C] shadow-sm focus:ring-2 focus:ring-ios-accent outline-none"
          >
            {(Object.keys(CURRENCY_RATES) as CurrencyCode[]).map((code) => (
              <option key={code} value={code}>
                {code} ({CURRENCY_RATES[code].symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Security & Authentication (iOS Grouped Inset) */}
      <div className="p-6 rounded-[26px] bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#000000] dark:text-[#FFFFFF]">
          Keamanan Akun & Biometrik (Apple Secure Enclave)
        </h3>

        <div className="space-y-3">
          {/* Biometrics Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-transparent">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#3A3A3C] text-[#34C759] shadow-sm">
                <Fingerprint className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#000000] dark:text-[#FFFFFF]">Autentikasi Biometrik</p>
                <p className="text-[11px] text-[#6C6C70] dark:text-[#8E8E93]">
                  Gunakan Touch ID atau Face ID saat konfirmasi transfer
                </p>
              </div>
            </div>

            {/* Apple iOS Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={user.biometricEnabled}
                onChange={(e) => {
                  sounds.playHapticClick();
                  onUpdateUser({ biometricEnabled: e.target.checked });
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#E5E5EA] dark:bg-[#39393D] peer-focus:outline-none rounded-full peer peer-checked:bg-[#34C759] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm" />
            </label>
          </div>

          {/* 2FA Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-transparent">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#3A3A3C] text-ios-accent shadow-sm">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#000000] dark:text-[#FFFFFF]">Verifikasi Dua Langkah (2FA)</p>
                <p className="text-[11px] text-[#6C6C70] dark:text-[#8E8E93]">
                  Konfirmasi tambahan untuk keamanan perangkat baru
                </p>
              </div>
            </div>

            {/* Apple iOS Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={user.twoFactorEnabled}
                onChange={(e) => {
                  sounds.playHapticClick();
                  onUpdateUser({ twoFactorEnabled: e.target.checked });
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#E5E5EA] dark:bg-[#39393D] peer-focus:outline-none rounded-full peer peer-checked:bg-[#34C759] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm" />
            </label>
          </div>

          {/* Change PIN */}
          <div className="p-3.5 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#3A3A3C] text-[#FF9500] shadow-sm">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#000000] dark:text-[#FFFFFF]">Ganti PIN Transaksi</p>
                  <p className="text-[11px] text-[#6C6C70] dark:text-[#8E8E93]">
                    PIN 6 angka rahasia untuk otorisasi dana
                  </p>
                </div>
              </div>

              <motion.button
                whileTap={iosQuickTap}
                type="button"
                onClick={() => {
                  sounds.playHapticClick();
                  setIsChangingPin(!isChangingPin);
                }}
                className="text-xs font-semibold text-ios-accent hover:underline"
              >
                {isChangingPin ? 'Batal' : 'Ubah PIN'}
              </motion.button>
            </div>

            {isChangingPin && (
              <div className="mt-3 pt-3 border-t border-[#E5E5EA] dark:border-[#38383A] flex items-center gap-2">
                <input
                  type="password"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="PIN Baru 6 Digit"
                  className="w-36 h-9 px-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#3A3A3C] text-xs font-mono font-medium focus:ring-2 focus:ring-ios-accent outline-none text-[#000000] dark:text-white"
                />
                <motion.button
                  whileTap={iosQuickTap}
                  type="button"
                  disabled={newPin.length !== 6}
                  onClick={handleSavePin}
                  className="h-9 px-4 rounded-xl bg-ios-accent text-white text-xs font-bold disabled:opacity-40"
                >
                  Simpan PIN
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reset State Button */}
      <div className="pt-2 flex justify-center">
        <motion.button
          whileTap={iosQuickTap}
          type="button"
          onClick={() => {
            if (confirm('Apakah Anda yakin ingin mengatur ulang data simulasi KaiPay ke pengaturan awal?')) {
              sounds.playHapticClick();
              onResetData();
            }
          }}
          className="flex items-center gap-2 text-xs font-medium text-[#FF3B30] hover:text-[#D70015] transition-colors p-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Seluruh Data Simulasi ke Default</span>
        </motion.button>
      </div>
    </div>
  );
};
