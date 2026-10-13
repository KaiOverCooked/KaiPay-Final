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
  Sparkles
} from 'lucide-react';
import { UserProfile, CurrencyCode, CURRENCY_RATES } from '../types';
import { generateQuickPinHash } from '../utils/crypto';
import { iosQuickTap } from '../utils/motion';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onResetData: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateUser,
  onResetData,
}) => {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email);
  const [isSaved, setIsSaved] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  ];

  const iosAccents = [
    { id: 'blue', label: 'Apple Blue', hex: '#007AFF' },
    { id: 'monochrome', label: 'Titanium', hex: '#1C1C1E' },
    { id: 'green', label: 'Apple Green', hex: '#34C759' },
    { id: 'purple', label: 'Apple Indigo', hex: '#5856D6' },
    { id: 'orange', label: 'Action Orange', hex: '#FF9500' },
  ] as const;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ name, phone, email });
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
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePin = () => {
    if (newPin.length === 6) {
      onUpdateUser({ pin: generateQuickPinHash(newPin) });
      setIsChangingPin(false);
      setNewPin('');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* iOS Settings Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#000000] dark:text-[#FFFFFF]">
          Pengaturan Akun & Tampilan
        </h2>
        <p className="text-xs text-[#6C6C70] dark:text-[#8E8E93] mt-0.5">
          Kelola profil personal, estetika tampilan khas iPhone (iOS), keamanan biometrik, dan mata uang
        </p>
      </div>

      {/* iOS Display & Appearance Picker (Tampilan & Kecerahan ala iPhone) */}
      <div className="p-6 rounded-[26px] bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#007AFF]" />
            <h3 className="text-sm font-bold text-[#000000] dark:text-[#FFFFFF]">
              Tampilan & Kecerahan iPhone
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-[#007AFF] bg-[#007AFF]/10 px-2 py-0.5 rounded-full">
            iOS Experience
          </span>
        </div>

        {/* Side-by-Side iPhone Theme Mockups */}
        <div className="grid grid-cols-2 gap-4">
          {/* Light Mode Mockup */}
          <motion.div
            whileTap={iosQuickTap}
            onClick={() => onUpdateUser({ theme: 'light' })}
            className={`cursor-pointer rounded-2xl p-3 flex flex-col items-center border-2 transition-all ${
              user.theme === 'light'
                ? 'border-[#007AFF] bg-[#007AFF]/5 dark:bg-[#007AFF]/10 shadow-md'
                : 'border-transparent bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 opacity-80 hover:opacity-100'
            }`}
          >
            {/* Miniature iPhone Bezel Preview */}
            <div className="w-full aspect-[9/14] max-w-[140px] rounded-2xl bg-[#F2F2F7] border border-[#D1D1D6] p-2 flex flex-col justify-between shadow-inner relative overflow-hidden select-none">
              {/* Dynamic Island / Notch */}
              <div className="w-12 h-2.5 bg-black rounded-full mx-auto mb-1.5" />
              {/* Mini Content */}
              <div className="space-y-1.5 w-full">
                <div className="h-6 rounded-lg bg-white border border-[#E5E5EA] p-1 flex items-center justify-between">
                  <div className="w-8 h-1.5 bg-[#1C1C1E] rounded-full" />
                  <div className="w-3 h-3 rounded-full bg-[#007AFF]" />
                </div>
                <div className="h-10 rounded-lg bg-white border border-[#E5E5EA] p-1.5 flex flex-col justify-center">
                  <div className="w-12 h-2 bg-[#000000] rounded-full" />
                  <div className="w-6 h-1.5 bg-[#8E8E93] rounded-full mt-1" />
                </div>
                <div className="h-4 rounded-md bg-[#007AFF] flex items-center justify-center">
                  <div className="w-8 h-1 bg-white rounded-full" />
                </div>
              </div>
              {/* Mini Home Indicator */}
              <div className="w-10 h-0.5 bg-black/40 rounded-full mx-auto mt-1" />
            </div>

            <div className="mt-3 flex items-center gap-1.5">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                user.theme === 'light'
                  ? 'border-[#007AFF] bg-[#007AFF] text-white'
                  : 'border-[#8E8E93] bg-transparent'
              }`}>
                {user.theme === 'light' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
              <span className="text-xs font-bold text-[#000000] dark:text-[#FFFFFF]">
                Terang (Light iOS)
              </span>
            </div>
            <span className="text-[10px] text-[#6C6C70] dark:text-[#8E8E93] mt-0.5">
              Porcelain & Glass
            </span>
          </motion.div>

          {/* Dark Mode Mockup */}
          <motion.div
            whileTap={iosQuickTap}
            onClick={() => onUpdateUser({ theme: 'dark' })}
            className={`cursor-pointer rounded-2xl p-3 flex flex-col items-center border-2 transition-all ${
              user.theme === 'dark'
                ? 'border-[#007AFF] bg-[#007AFF]/5 dark:bg-[#007AFF]/10 shadow-md'
                : 'border-transparent bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 opacity-80 hover:opacity-100'
            }`}
          >
            {/* Miniature iPhone Bezel Preview */}
            <div className="w-full aspect-[9/14] max-w-[140px] rounded-2xl bg-[#000000] border border-[#3A3A3C] p-2 flex flex-col justify-between shadow-inner relative overflow-hidden select-none">
              {/* Dynamic Island / Notch */}
              <div className="w-12 h-2.5 bg-[#1C1C1E] border border-white/10 rounded-full mx-auto mb-1.5" />
              {/* Mini Content */}
              <div className="space-y-1.5 w-full">
                <div className="h-6 rounded-lg bg-[#1C1C1E] border border-white/10 p-1 flex items-center justify-between">
                  <div className="w-8 h-1.5 bg-white rounded-full" />
                  <div className="w-3 h-3 rounded-full bg-[#0A84FF]" />
                </div>
                <div className="h-10 rounded-lg bg-[#1C1C1E] border border-white/10 p-1.5 flex flex-col justify-center">
                  <div className="w-12 h-2 bg-white rounded-full" />
                  <div className="w-6 h-1.5 bg-[#8E8E93] rounded-full mt-1" />
                </div>
                <div className="h-4 rounded-md bg-[#0A84FF] flex items-center justify-center">
                  <div className="w-8 h-1 bg-white rounded-full" />
                </div>
              </div>
              {/* Mini Home Indicator */}
              <div className="w-10 h-0.5 bg-white/40 rounded-full mx-auto mt-1" />
            </div>

            <div className="mt-3 flex items-center gap-1.5">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                user.theme === 'dark'
                  ? 'border-[#007AFF] bg-[#007AFF] text-white'
                  : 'border-[#8E8E93] bg-transparent'
              }`}>
                {user.theme === 'dark' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
              <span className="text-xs font-bold text-[#000000] dark:text-[#FFFFFF]">
                Gelap (OLED iPhone)
              </span>
            </div>
            <span className="text-[10px] text-[#6C6C70] dark:text-[#8E8E93] mt-0.5">
              True Black & Slate
            </span>
          </motion.div>
        </div>

        {/* Apple Accent Tint Selector */}
        <div className="pt-3 border-t border-[#E5E5EA] dark:border-[#2C2C2E]">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-[#000000] dark:text-[#FFFFFF]">
              Aksen Warna Khas Apple
            </span>
            <span className="text-[11px] text-[#6C6C70] dark:text-[#8E8E93]">
              Warna tombol & elemen aktif
            </span>
          </div>

          <div className="flex items-center gap-3">
            {iosAccents.map((acc) => {
              const isActive = (user.accentColor || 'blue') === acc.id;
              return (
                <motion.button
                  key={acc.id}
                  whileTap={iosQuickTap}
                  type="button"
                  onClick={() => onUpdateUser({ accentColor: acc.id })}
                  className="flex flex-col items-center gap-1 group"
                  title={acc.label}
                >
                  <div
                    style={{ backgroundColor: acc.hex }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${
                      isActive ? 'ring-2 ring-offset-2 ring-[#007AFF] dark:ring-offset-black' : ''
                    }`}
                  >
                    {isActive && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </div>
                  <span className={`text-[10px] ${isActive ? 'font-bold text-[#000000] dark:text-white' : 'text-[#8E8E93]'}`}>
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
              className="absolute bottom-0 right-0 p-2 rounded-full bg-[#007AFF] text-white shadow-lg hover:scale-110 transition-transform ring-2 ring-white dark:ring-black"
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
                  onClick={() => onUpdateUser({ avatarUrl: url })}
                  className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-[#D1D1D6] dark:ring-[#3A3A3C] hover:ring-[#007AFF] transition-all"
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
                className="w-full h-11 px-3.5 rounded-xl bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-transparent text-xs font-medium text-[#000000] dark:text-[#FFFFFF] focus:bg-white dark:focus:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
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
                className="w-full h-11 px-3.5 rounded-xl bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-transparent text-xs font-mono font-medium text-[#000000] dark:text-[#FFFFFF] focus:bg-white dark:focus:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
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
              className="w-full h-11 px-3.5 rounded-xl bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-transparent text-xs font-medium text-[#000000] dark:text-[#FFFFFF] focus:bg-white dark:focus:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <motion.button
              whileTap={iosQuickTap}
              type="submit"
              className="py-2.5 px-5 rounded-full bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
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

      {/* Currency Selector (iOS Inset Grouped) */}
      <div className="p-6 rounded-[26px] bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#000000] dark:text-[#FFFFFF]">
          Standar Nilai & Mata Uang
        </h3>

        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#3A3A3C] text-[#007AFF] shadow-sm">
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
            onChange={(e) => onUpdateUser({ currency: e.target.value as CurrencyCode })}
            className="h-9 px-3 rounded-xl bg-white dark:bg-[#1C1C1E] text-xs font-bold font-mono text-[#000000] dark:text-[#FFFFFF] border border-[#E5E5EA] dark:border-[#3A3A3C] shadow-sm"
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
                onChange={(e) => onUpdateUser({ biometricEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#E5E5EA] dark:bg-[#39393D] peer-focus:outline-none rounded-full peer peer-checked:bg-[#34C759] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm" />
            </label>
          </div>

          {/* 2FA Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-transparent">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#3A3A3C] text-[#007AFF] shadow-sm">
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
                onChange={(e) => onUpdateUser({ twoFactorEnabled: e.target.checked })}
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
                onClick={() => setIsChangingPin(!isChangingPin)}
                className="text-xs font-semibold text-[#007AFF] hover:underline"
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
                  className="w-36 h-9 px-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#3A3A3C] text-xs font-mono font-medium focus:ring-2 focus:ring-[#007AFF] outline-none"
                />
                <motion.button
                  whileTap={iosQuickTap}
                  type="button"
                  disabled={newPin.length !== 6}
                  onClick={handleSavePin}
                  className="h-9 px-4 rounded-xl bg-[#007AFF] text-white text-xs font-bold disabled:opacity-40"
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
