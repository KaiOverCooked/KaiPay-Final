import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Camera, 
  Bell, 
  Radio, 
  ShieldCheck, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  Settings2,
  Lock,
  Sparkles
} from 'lucide-react';
import { sounds } from '../utils/sound';
import { liveSync } from '../utils/sync';
import { iosBackdropVariants, iosSheetVariants, iosQuickTap } from '../utils/motion';

interface DevicePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DevicePermissionsModal: React.FC<DevicePermissionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [cameraStatus, setCameraStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>('default');
  const [nearbyStatus, setNearbyStatus] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Check existing notification permission
      setNotificationStatus(liveSync.getNotificationPermission());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Real Camera Permission Request
  const handleRequestCamera = async () => {
    sounds.playHapticClick();
    setStatusMessage('Meminta akses kamera fisik...');
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Release immediately after test
        stream.getTracks().forEach((t) => t.stop());
        setCameraStatus('granted');
        setStatusMessage('Izin kamera berhasil diberikan!');
        sounds.playApplePayChime();
      } else {
        setCameraStatus('granted');
        setStatusMessage('Kamera siap digunakan');
      }
    } catch (err) {
      console.error('Camera permission error:', err);
      setCameraStatus('denied');
      setStatusMessage('Akses kamera tidak diizinkan di peramban.');
    }
  };

  // Real Web Notification Permission Request
  const handleRequestNotification = async () => {
    sounds.playHapticClick();
    setStatusMessage('Meminta izin notifikasi peramban...');
    const result = await liveSync.requestNotificationPermission();
    setNotificationStatus(result);
    if (result === 'granted') {
      sounds.playApplePayChime();
      setStatusMessage('Notifikasi sistem diaktifkan!');
      liveSync.sendNativeNotification('KaiPay — Notifikasi Aktif', {
        body: 'Anda akan menerima pemberitahuan otomatis saat pembayaran QRIS selesai atau saat dana masuk.',
      });
    } else {
      setStatusMessage('Notifikasi sistem dinonaktifkan di peramban.');
    }
  };

  const handleToggleNearby = () => {
    sounds.playHapticClick();
    setNearbyStatus(!nearbyStatus);
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
          className="relative w-full max-w-sm bg-white dark:bg-[#1C1C1E] rounded-t-[34px] sm:rounded-[34px] shadow-2xl border border-[#E5E5EA] dark:border-[#2C2C2E] overflow-hidden flex flex-col z-10"
        >
          {/* iOS Grab Handle */}
          <div className="w-10 h-1.5 bg-[#8E8E93]/40 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5EA] dark:border-[#2C2C2E]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-ios-accent/15 text-ios-accent">
                <Settings2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#000000] dark:text-[#FFFFFF]">
                Izin Perangkat & Sensor (iOS)
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-[#8E8E93] hover:text-black dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-xs text-[#6C6C70] dark:text-[#8E8E93] leading-relaxed">
              KaiPay memerlukan izin sensor perangkat untuk pemindaian instan kode QRIS, notifikasi penerimaan saldo, dan penemuan rekan terdekat.
            </p>

            {/* Permission 1: Camera */}
            <div className="p-3.5 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl text-white shadow-sm ${
                  cameraStatus === 'granted' ? 'bg-[#34C759]' : 'bg-[#007AFF]'
                }`}>
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#000000] dark:text-white">
                    Kamera Pemindai QRIS
                  </h4>
                  <p className="text-[10px] text-[#8E8E93]">
                    {cameraStatus === 'granted'
                      ? 'Diizinkan (Aktif)'
                      : cameraStatus === 'denied'
                      ? 'Ditolak di Browser'
                      : 'Belum diizinkan'}
                  </p>
                </div>
              </div>

              {cameraStatus === 'granted' ? (
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-[#34C759] flex items-center justify-center">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              ) : (
                <motion.button
                  whileTap={iosQuickTap}
                  type="button"
                  onClick={handleRequestCamera}
                  className="px-3 py-1.5 rounded-full bg-ios-accent text-white text-[11px] font-bold shadow-sm"
                >
                  Izinkan
                </motion.button>
              )}
            </div>

            {/* Permission 2: Web Push Notifications */}
            <div className="p-3.5 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl text-white shadow-sm ${
                  notificationStatus === 'granted' ? 'bg-[#34C759]' : 'bg-[#FF9500]'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#000000] dark:text-white">
                    Notifikasi Sistem Asli
                  </h4>
                  <p className="text-[10px] text-[#8E8E93]">
                    {notificationStatus === 'granted'
                      ? 'Diizinkan (Aktif)'
                      : notificationStatus === 'denied'
                      ? 'Ditolak di Browser'
                      : 'Pemberitahuan transaksi masuk'}
                  </p>
                </div>
              </div>

              {notificationStatus === 'granted' ? (
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-[#34C759] flex items-center justify-center">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              ) : (
                <motion.button
                  whileTap={iosQuickTap}
                  type="button"
                  onClick={handleRequestNotification}
                  className="px-3 py-1.5 rounded-full bg-ios-accent text-white text-[11px] font-bold shadow-sm"
                >
                  Izinkan
                </motion.button>
              )}
            </div>

            {/* Permission 3: Nearby Devices / Local Network */}
            <div className="p-3.5 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#5856D6] text-white shadow-sm">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#000000] dark:text-white">
                    Perangkat Sekitar (Nearby)
                  </h4>
                  <p className="text-[10px] text-[#8E8E93]">
                    Deteksi kontak terdekat & AirDrop Pay
                  </p>
                </div>
              </div>

              {/* Apple Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={nearbyStatus}
                  onChange={handleToggleNearby}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#E5E5EA] dark:bg-[#39393D] peer-focus:outline-none rounded-full peer peer-checked:bg-[#34C759] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm" />
              </label>
            </div>

            {statusMessage && (
              <p className="text-xs text-center text-ios-accent font-medium py-1">
                {statusMessage}
              </p>
            )}

            <div className="pt-2">
              <motion.button
                whileTap={iosQuickTap}
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs transition-transform shadow-md"
              >
                Selesai
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
