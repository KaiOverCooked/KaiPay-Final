import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  QrCode, 
  Flashlight, 
  Upload, 
  Download, 
  Check, 
  Copy, 
  Store, 
  ArrowRight,
  Camera,
  CameraOff,
  RefreshCw,
  Sparkles,
  AlertCircle,
  History,
  Trash2,
  Users
} from 'lucide-react';
import jsQR from 'jsqr';
import { UserProfile, QrisScanHistoryItem } from '../types';
import { formatCurrency } from '../utils/formatters';
import { parseQrData } from '../utils/qrParser';
import { generateQrisString, parseQrisString } from '../utils/qris';
import { liveSync } from '../utils/sync';
import { sounds } from '../utils/sound';
import confetti from 'canvas-confetti';
import { 
  iosSheetVariants, 
  iosBackdropVariants, 
  iosQuickTap, 
  iosSpringTransition 
} from '../utils/motion';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  initialTab?: 'scan' | 'generate' | 'history';
  onScannedQr: (data: { 
    name: string; 
    phone: string; 
    amount?: number; 
    note?: string;
    recipientId?: string;
    sessionId?: string;
    isQris?: boolean;
  }) => void;
  onOpenSplitBillFromQr?: (data: { name: string; phone: string; amount?: number; note?: string }) => void;
}

export const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  user,
  initialTab = 'scan',
  onScannedQr,
  onOpenSplitBillFromQr,
}) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'generate' | 'history'>(initialTab);
  const [zoomLevel, setZoomLevel] = useState<1 | 2>(1);
  const [qrisHistory, setQrisHistory] = useState<QrisScanHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('kaipay_qris_history');
      if (saved) {
        const parsed: QrisScanHistoryItem[] = JSON.parse(saved);
        const seen = new Set<string>();
        const deduped: QrisScanHistoryItem[] = [];
        parsed.forEach((item) => {
          if (item && item.id && !seen.has(item.id)) {
            seen.add(item.id);
            deduped.push(item);
          }
        });
        return deduped;
      }
    } catch {}
    return [
      {
        id: 'hist_1',
        merchantName: 'Kopi Kenangan Senopati',
        phoneOrNmid: 'QRIS-NMID-ID102948',
        amount: 38000,
        note: '1x Kopi Kenangan Mantan',
        timestamp: new Date().toISOString(),
        timeString: '13:45:10 WIB',
        dateString: '13',
        monthString: 'Oktober',
        yearString: '2026',
      },
      {
        id: 'hist_2',
        merchantName: 'Indomaret Point Tebet',
        phoneOrNmid: 'QRIS-NMID-ID991042',
        amount: 82500,
        note: 'Belanja Snack & Minuman',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        timeString: '19:20:00 WIB',
        dateString: '12',
        monthString: 'Oktober',
        yearString: '2026',
      }
    ];
  });
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraState, setCameraState] = useState<'idle' | 'requesting' | 'active' | 'denied' | 'unsupported'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [detectedBox, setDetectedBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  
  // Tab 2: Generator state
  const [requestedAmountStr, setRequestedAmountStr] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedRawQris, setCopiedRawQris] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [livePaymentReceived, setLivePaymentReceived] = useState<{ amount: number; senderName: string } | null>(null);

  // Subscribe to real-time incoming payments across browser tabs
  useEffect(() => {
    const unsub = liveSync.subscribe((msg) => {
      if (
        msg.type === 'QRIS_PAYMENT_COMPLETED' &&
        (msg.recipientId === user.id || msg.recipientPhone === user.phone)
      ) {
        sounds.playApplePayChime();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#34C759', '#30D158', '#FFD60A', '#007AFF'],
        });
        setLivePaymentReceived({
          amount: msg.amount,
          senderName: msg.senderName,
        });
      }
    });
    return () => unsub();
  }, [user.id, user.phone]);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrSvgRef = useRef<SVGSVGElement>(null);
  const isScanningRef = useRef(false);

  // Sample quick simulation presets
  const sampleMerchants = [
    { name: 'Kopi Kenangan Senopati', phone: 'QRIS-NMID-ID102948', amount: 38000, note: '1x Kopi Kenangan Mantan' },
    { name: 'Indomaret Point Tebet', phone: 'QRIS-NMID-ID991042', amount: 82500, note: 'Belanja Snack & Minuman' },
    { name: 'Budi Santoso', phone: '0813-8821-4491', amount: 50000, note: 'Bayar Tagihan Makan Siang' },
    { name: 'SPBU Shell Gatot Subroto', phone: 'QRIS-NMID-ID441290', amount: 150000, note: 'Bensin Shell V-Power' },
  ];

  // Affirmative scan beep sound
  const playScanBeep = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } catch {
      // Audio might fail in autoplay restriction; safe to ignore
    }

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 30, 50]);
    }
  }, []);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    isScanningRef.current = false;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setFlashlightOn(false);
  }, []);

  // Request & Start Camera
  const startCamera = useCallback(async (facing = cameraFacing) => {
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('unsupported');
      setErrorMessage('Perangkat Anda tidak mendukung akses kamera di browser ini.');
      return;
    }

    setCameraState('requesting');
    setErrorMessage('');
    setDetectedBox(null);

    try {
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // iOS Safari requires playsInline and play() after setting srcObject
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraState('active');
        isScanningRef.current = true;
      }
    } catch (err) {
      const error = err as Error;
      console.warn('Camera access denied or failed:', error);
      setCameraState('denied');
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setErrorMessage('Izin kamera ditolak. Berikan akses kamera di browser untuk memindai QRIS langsung.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setErrorMessage('Tidak ada kamera yang terdeteksi pada perangkat Anda.');
      } else {
        setErrorMessage('Tidak dapat mengakses kamera. Silakan periksa izin privasi perangkat.');
      }
    }
  }, [cameraFacing, stopCamera]);

  const toggleZoom = (level: 1 | 2) => {
    sounds.playCameraShutter();
    setZoomLevel(level);
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track) {
        try {
          const caps = (track.getCapabilities?.() as unknown as { zoom?: { min: number; max: number } }) || {};
          if (caps.zoom) {
            // Apply optical/hardware zoom if supported
            track.applyConstraints({
              // @ts-expect-error - advanced constraints
              advanced: [{ zoom: level }],
            });
          }
        } catch {
          // Software fallback used
        }
      }
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    sounds.playHapticClick();
    setQrisHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem('kaipay_qris_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Handle scanned result
  const handleQrDetected = useCallback((dataStr: string) => {
    if (!isScanningRef.current) return;
    isScanningRef.current = false;
    playScanBeep();

    // Try standard EMVCo/ASPI QRIS first, then fallback
    const qrisObj = parseQrisString(dataStr);
    const parsed = qrisObj
      ? {
          name: qrisObj.merchantName,
          phone: qrisObj.recipientPhone,
          amount: qrisObj.amount,
          note: qrisObj.isDynamic ? `QRIS ${qrisObj.merchantName}` : `Pembayaran QRIS`,
          recipientId: qrisObj.recipientId,
          sessionId: qrisObj.sessionId,
          isQris: true,
        }
      : parseQrData(dataStr);

    stopCamera();

    // Auto-save to QRIS Scan History
    const now = new Date();
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const newHistoryItem: QrisScanHistoryItem = {
      id: `qris_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      merchantName: parsed.name,
      phoneOrNmid: parsed.phone,
      amount: parsed.amount,
      note: parsed.note,
      timestamp: now.toISOString(),
      timeString: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WIB`,
      dateString: `${now.getDate()}`,
      monthString: months[now.getMonth()],
      yearString: `${now.getFullYear()}`,
      rawQr: dataStr,
    };

    setQrisHistory((prev) => {
      const next = [newHistoryItem, ...prev.filter((p) => p.phoneOrNmid !== parsed.phone || p.merchantName !== parsed.name)];
      try {
        localStorage.setItem('kaipay_qris_history', JSON.stringify(next));
      } catch {}
      return next;
    });

    // Small delay for tactile spring feedback
    setTimeout(() => {
      onScannedQr({
        name: parsed.name,
        phone: parsed.phone,
        amount: parsed.amount,
        note: parsed.note,
        recipientId: 'recipientId' in parsed ? parsed.recipientId : undefined,
        sessionId: 'sessionId' in parsed ? parsed.sessionId : undefined,
        isQris: true,
      });
    }, 280);
  }, [onScannedQr, playScanBeep, stopCamera]);

  // Frame Scanning Loop using jsQR
  useEffect(() => {
    if (cameraState !== 'active' || activeTab !== 'scan' || !isOpen) return;

    let isRunning = true;

    const scanFrame = () => {
      if (!isRunning || !isScanningRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState >= video.HAVE_CURRENT_DATA) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
        }

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx && canvas.width > 0 && canvas.height > 0) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            // Found a QR!
            const loc = code.location;
            const minX = Math.min(loc.topLeftCorner.x, loc.bottomLeftCorner.x);
            const maxX = Math.max(loc.topRightCorner.x, loc.bottomRightCorner.x);
            const minY = Math.min(loc.topLeftCorner.y, loc.topRightCorner.y);
            const maxY = Math.max(loc.bottomLeftCorner.y, loc.bottomRightCorner.y);

            setDetectedBox({
              x: (minX / canvas.width) * 100,
              y: (minY / canvas.height) * 100,
              width: ((maxX - minX) / canvas.width) * 100,
              height: ((maxY - minY) / canvas.height) * 100,
            });

            handleQrDetected(code.data);
            return;
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraState, activeTab, isOpen, handleQrDetected]);

  // Start / Stop camera when opening/closing or changing tabs
  useEffect(() => {
    if (isOpen && activeTab === 'scan') {
      startCamera(cameraFacing);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, cameraFacing, startCamera, stopCamera]);

  // Toggle Torch
  const toggleFlashlight = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const capabilities = track.getCapabilities?.() as { torch?: boolean } | undefined;
        if (capabilities?.torch) {
          await track.applyConstraints({
            advanced: [{ torch: !flashlightOn } as unknown as MediaTrackConstraintSet],
          });
        }
      } catch (e) {
        console.warn('Torch constraint not supported', e);
      }
    }
    setFlashlightOn(!flashlightOn);
  };

  // Flip Camera
  const handleFlipCamera = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  // Upload QR Image Scanner
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height);
          if (code && code.data) {
            handleQrDetected(code.data);
          } else {
            // Fallback: notify & simulate standard verified merchant
            setErrorMessage('Foto tidak memiliki kode QR yang jelas. Memproses simulasi QRIS...');
            setTimeout(() => {
              setErrorMessage('');
              handleQrDetected(`https://kaipay.me/pay/QRIS-991823?amt=65000&name=${encodeURIComponent('Merchant Galeri Foto')}&note=${encodeURIComponent('Pembayaran Foto QRIS')}`);
            }, 800);
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Reset file input value
    e.target.value = '';
  };

  // Copy QR Pay Link
  const handleCopyQrLink = () => {
    const amt = requestedAmountStr ? `&amt=${requestedAmountStr}` : '';
    const note = customNote ? `&note=${encodeURIComponent(customNote)}` : '';
    const text = `https://kaipay.me/pay/${user.phone}?name=${encodeURIComponent(user.name)}${amt}${note}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // Download QR Code as Image
  const handleDownloadQr = () => {
    const svg = qrSvgRef.current;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const URLObj = window.URL || window.webkitURL || window;
    const blobURL = URLObj.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 600, 600);
        ctx.drawImage(image, 50, 50, 500, 500);

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `KaiPay-QRIS-${user.phone}.png`;
        downloadLink.href = pngUrl;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 2500);
      }
    };
    image.src = blobURL;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            variants={iosBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            variants={iosSheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-[#E5E5EA] dark:border-[#2C2C2E] overflow-hidden flex flex-col max-h-[92vh] z-10"
          >
            {/* iOS Grab Handle */}
            <div className="w-10 h-1.5 bg-[#8E8E93]/40 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E5EA] dark:border-[#2C2C2E]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#34C759] animate-pulse" />
                <h3 className="text-base font-bold text-[#000000] dark:text-[#FFFFFF]">
                  {activeTab === 'scan' ? 'Pindai Kode QRIS' : 'Kode QR Saya'}
                </h3>
              </div>
              <motion.button
                whileTap={iosQuickTap}
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-[#8E8E93] hover:text-[#000000] dark:hover:text-[#FFFFFF] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* iOS Segmented Tab Selector */}
            <div className="p-4 pb-0">
              <div className="flex items-center gap-1 p-1 bg-[#767680]/12 dark:bg-[#767680]/24 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('scan');
                    sounds.playHapticClick();
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                    activeTab === 'scan'
                      ? 'bg-white dark:bg-[#636366] text-[#000000] dark:text-[#FFFFFF] shadow-sm'
                      : 'text-[#6C6C70] dark:text-[#8E8E93] hover:text-[#000000] dark:hover:text-[#FFFFFF]'
                  }`}
                >
                  Pindai QRIS
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('generate');
                    sounds.playHapticClick();
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                    activeTab === 'generate'
                      ? 'bg-white dark:bg-[#636366] text-[#000000] dark:text-[#FFFFFF] shadow-sm'
                      : 'text-[#6C6C70] dark:text-[#8E8E93] hover:text-[#000000] dark:hover:text-[#FFFFFF]'
                  }`}
                >
                  Minta Dana
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('history');
                    sounds.playHapticClick();
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1 ${
                    activeTab === 'history'
                      ? 'bg-white dark:bg-[#636366] text-[#000000] dark:text-[#FFFFFF] shadow-sm'
                      : 'text-[#6C6C70] dark:text-[#8E8E93] hover:text-[#000000] dark:hover:text-[#FFFFFF]'
                  }`}
                >
                  <span>Riwayat</span>
                  {qrisHistory.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#007AFF] text-white font-mono">
                      {qrisHistory.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* TAB 1: SCAN QR WITH LIVE CAMERA */}
            {activeTab === 'scan' && (
              <motion.div 
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={iosSpringTransition}
                className="p-5 overflow-y-auto flex-1 space-y-4"
              >
                {/* Real Live Camera Viewfinder Box */}
                <div className="relative aspect-square max-w-[280px] mx-auto rounded-[28px] bg-black overflow-hidden flex items-center justify-center border-2 border-[#2C2C2E] shadow-2xl">
                  {/* Real Video Element with Optical/Software Zoom */}
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    style={{
                      transform: zoomLevel === 2 ? 'scale(1.7)' : 'scale(1)',
                      transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                      cameraState === 'active' ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  {/* iOS Camera Lens Zoom Control Pill (1x & 2x) */}
                  {cameraState === 'active' && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center bg-black/60 backdrop-blur-md rounded-full p-0.5 border border-white/20">
                      <button
                        type="button"
                        onClick={() => toggleZoom(1)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold font-mono transition-all ${
                          zoomLevel === 1 ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        1x
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleZoom(2)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold font-mono transition-all ${
                          zoomLevel === 2 ? 'bg-[#FFCC00] text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        2x
                      </button>
                    </div>
                  )}

                  {/* Hidden Processing Canvas for jsQR */}
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Flashlight Screen Simulation Filter */}
                  {flashlightOn && (
                    <div className="absolute inset-0 bg-white/20 pointer-events-none z-10" />
                  )}

                  {/* CAMERA STATE 1: REQUESTING PERMISSION */}
                  {cameraState === 'requesting' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-20 bg-black/85">
                      <div className="w-10 h-10 border-3 border-white/20 border-t-[#007AFF] rounded-full animate-spin mb-3" />
                      <p className="text-xs font-semibold text-white">Meminta Izin Kamera...</p>
                      <span className="text-[11px] text-[#8E8E93] mt-1 max-w-[200px]">
                        Izinkan kamera pada dialog browser untuk memindai otomatis
                      </span>
                    </div>
                  )}

                  {/* CAMERA STATE 2: PERMISSION DENIED OR ERROR */}
                  {(cameraState === 'denied' || cameraState === 'unsupported') && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-20 bg-[#1C1C1E] text-white">
                      <div className="p-3 rounded-full bg-[#FF3B30]/15 text-[#FF3B30] mb-2.5">
                        <CameraOff className="w-6 h-6" />
                      </div>
                      <h4 className="text-xs font-bold text-white mb-1">
                        {cameraState === 'unsupported' ? 'Kamera Tidak Didukung' : 'Izin Kamera Diperlukan'}
                      </h4>
                      <p className="text-[11px] text-[#8E8E93] leading-tight mb-3 px-2">
                        {errorMessage || 'Arahkan izin peramban untuk membuka pemindai otomatis.'}
                      </p>
                      <motion.button
                        whileTap={iosQuickTap}
                        type="button"
                        onClick={() => startCamera(cameraFacing)}
                        className="py-1.5 px-3 rounded-full bg-[#007AFF] text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Minta Akses Ulang</span>
                      </motion.button>
                    </div>
                  )}

                  {/* Laser Scanning Line (Active when scanning) */}
                  {cameraState === 'active' && (
                    <motion.div 
                      animate={{ y: [-75, 75, -75] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                      className="absolute left-6 right-6 h-0.5 bg-[#34C759] shadow-[0_0_12px_#34C759] z-20 pointer-events-none" 
                    />
                  )}

                  {/* Detected QR Code Box Animation */}
                  {detectedBox && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute border-2 border-[#34C759] bg-[#34C759]/20 rounded-xl z-25 pointer-events-none transition-all"
                      style={{
                        left: `${detectedBox.x}%`,
                        top: `${detectedBox.y}%`,
                        width: `${detectedBox.width}%`,
                        height: `${detectedBox.height}%`,
                      }}
                    />
                  )}

                  {/* Viewfinder Target Frame (iOS Corner Reticles) */}
                  <div className="relative w-48 h-48 rounded-2xl flex flex-col items-center justify-center p-4 text-center z-15 pointer-events-none">
                    {/* Corner 1: Top-Left */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-3 border-l-3 border-white rounded-tl-xl shadow-sm" />
                    {/* Corner 2: Top-Right */}
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-3 border-r-3 border-white rounded-tr-xl shadow-sm" />
                    {/* Corner 3: Bottom-Left */}
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-3 border-l-3 border-white rounded-bl-xl shadow-sm" />
                    {/* Corner 4: Bottom-Right */}
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-3 border-r-3 border-white rounded-br-xl shadow-sm" />

                    {cameraState !== 'active' && cameraState !== 'requesting' && cameraState !== 'denied' && (
                      <>
                        <QrCode className="w-16 h-16 text-white/50 animate-pulse mb-2" />
                        <span className="text-[11px] text-[#8E8E93] font-medium">
                          Arahkan kamera ke kode QRIS
                        </span>
                      </>
                    )}
                  </div>

                  {/* Bottom Camera Floating Action Dock */}
                  <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3 z-30">
                    {/* Torch Toggle */}
                    <motion.button
                      whileTap={iosQuickTap}
                      type="button"
                      onClick={toggleFlashlight}
                      className={`p-2.5 rounded-full transition-colors ${
                        flashlightOn
                          ? 'bg-[#FFCC00] text-black shadow-lg shadow-[#FFCC00]/30'
                          : 'bg-[#2C2C2E]/85 text-white hover:bg-[#3A3A3C]'
                      }`}
                      title="Lampu Kilat / Senter"
                    >
                      <Flashlight className="w-4 h-4" />
                    </motion.button>

                    {/* Flip Camera */}
                    <motion.button
                      whileTap={iosQuickTap}
                      type="button"
                      onClick={handleFlipCamera}
                      className="p-2.5 rounded-full bg-[#2C2C2E]/85 text-white hover:bg-[#3A3A3C] transition-colors"
                      title="Balik Kamera Depan/Belakang"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </motion.button>

                    {/* Upload from Gallery */}
                    <motion.button
                      whileTap={iosQuickTap}
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 rounded-full bg-[#2C2C2E]/85 text-white hover:bg-[#3A3A3C] transition-colors"
                      title="Unggah Foto QR dari Galeri"
                    >
                      <Upload className="w-4 h-4" />
                    </motion.button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Sub-status Indicator */}
                <div className="flex items-center justify-center gap-2 text-center">
                  <div className={`w-2 h-2 rounded-full ${cameraState === 'active' ? 'bg-[#34C759]' : 'bg-[#FF9500]'}`} />
                  <span className="text-xs text-[#6C6C70] dark:text-[#8E8E93] font-medium">
                    {cameraState === 'active' 
                      ? 'Kamera aktif · Memindai QRIS otomatis' 
                      : cameraState === 'requesting'
                      ? 'Menghubungkan ke sensor kamera iPhone...'
                      : 'Kamera offline · Pilih opsi di bawah'}
                  </span>
                </div>

                {/* Test Simulation Fast Buttons */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider block">
                      Simulasi Scan Cepat (Merchant & Rekan)
                    </span>
                    <span className="text-[10px] text-[#007AFF] font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      1-Klik Uji Coba
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {sampleMerchants.map((m, idx) => (
                      <motion.button
                        key={idx}
                        whileTap={iosQuickTap}
                        type="button"
                        onClick={() => handleQrDetected(`https://kaipay.me/pay/${m.phone}?name=${encodeURIComponent(m.name)}&amt=${m.amount}&note=${encodeURIComponent(m.note)}`)}
                        className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 hover:bg-[#E5E5EA] dark:hover:bg-[#2C2C2E] border border-transparent transition-all text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-white dark:bg-[#3A3A3C] text-[#007AFF] shadow-sm">
                            <Store className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#000000] dark:text-[#FFFFFF]">
                              {m.name}
                            </h4>
                            <p className="text-[11px] font-mono text-[#8E8E93]">
                              {formatCurrency(m.amount, user.currency)} · {m.note}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#8E8E93]" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: MY QR CODE GENERATOR (Standard QRIS & Real-Time Sync) */}
            {activeTab === 'generate' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={iosSpringTransition}
                className="p-5 overflow-y-auto flex-1 space-y-4 text-center"
              >
                {/* Real-time Payment Received Alert */}
                {livePaymentReceived && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: -10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-left flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-[#34C759] tracking-wider block">
                          Pembayaran QRIS Diterima!
                        </span>
                        <p className="text-xs font-bold text-[#000000] dark:text-white">
                          +{formatCurrency(livePaymentReceived.amount, user.currency)} dari {livePaymentReceived.senderName}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLivePaymentReceived(null)}
                      className="p-1 text-[#8E8E93] hover:text-black dark:hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                {/* Live Sync Status Indicator */}
                <div className="flex items-center justify-center gap-2 py-1 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#34C759] text-[11px] font-medium mx-auto max-w-fit">
                  <span className="w-2 h-2 rounded-full bg-[#34C759] animate-ping" />
                  <span>Sistem QRIS Live Aktif (Siap Terima Pembayaran)</span>
                </div>

                <div className="max-w-[280px] mx-auto p-6 rounded-[28px] bg-white text-black shadow-xl border border-[#E5E5EA] flex flex-col items-center">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-sm font-bold tracking-tight">KaiPay</span>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-black text-white uppercase tracking-wider">
                      QRIS
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-black">{user.name}</h4>
                  <p className="text-[11px] font-mono text-[#6C6C70] mb-3">{user.phone}</p>

                  <div className="p-2 bg-white rounded-2xl ring-4 ring-black/5">
                    <svg
                      ref={qrSvgRef}
                      className="w-48 h-48"
                      viewBox="0 0 100 100"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect x="5" y="5" width="26" height="26" rx="3" stroke="#000000" strokeWidth="4" fill="none" />
                      <rect x="11" y="11" width="14" height="14" rx="2" fill="#000000" />

                      <rect x="69" y="5" width="26" height="26" rx="3" stroke="#000000" strokeWidth="4" fill="none" />
                      <rect x="75" y="11" width="14" height="14" rx="2" fill="#000000" />

                      <rect x="5" y="69" width="26" height="26" rx="3" stroke="#000000" strokeWidth="4" fill="none" />
                      <rect x="11" y="75" width="14" height="14" rx="2" fill="#000000" />

                      <rect x="36" y="8" width="6" height="6" fill="#000000" />
                      <rect x="46" y="8" width="6" height="6" fill="#000000" />
                      <rect x="56" y="8" width="6" height="6" fill="#000000" />
                      <rect x="36" y="18" width="6" height="6" fill="#000000" />
                      <rect x="56" y="18" width="6" height="6" fill="#000000" />
                      
                      <rect x="8" y="36" width="6" height="6" fill="#000000" />
                      <rect x="18" y="36" width="6" height="6" fill="#000000" />
                      <rect x="28" y="36" width="6" height="6" fill="#000000" />
                      <rect x="38" y="36" width="6" height="6" fill="#000000" />
                      <rect x="48" y="36" width="6" height="6" fill="#000000" />
                      <rect x="68" y="36" width="6" height="6" fill="#000000" />
                      <rect x="78" y="36" width="6" height="6" fill="#000000" />

                      <rect x="36" y="46" width="6" height="6" fill="#000000" />
                      <rect x="46" y="46" width="6" height="6" fill="#000000" />
                      <rect x="56" y="46" width="6" height="6" fill="#000000" />
                      <rect x="76" y="46" width="6" height="6" fill="#000000" />
                      <rect x="86" y="46" width="6" height="6" fill="#000000" />

                      <rect x="8" y="56" width="6" height="6" fill="#000000" />
                      <rect x="28" y="56" width="6" height="6" fill="#000000" />
                      <rect x="48" y="56" width="6" height="6" fill="#000000" />
                      <rect x="68" y="56" width="6" height="6" fill="#000000" />

                      <rect x="36" y="66" width="6" height="6" fill="#000000" />
                      <rect x="56" y="66" width="6" height="6" fill="#000000" />
                      <rect x="76" y="66" width="6" height="6" fill="#000000" />
                      <rect x="86" y="66" width="6" height="6" fill="#000000" />

                      <rect x="36" y="78" width="6" height="6" fill="#000000" />
                      <rect x="46" y="78" width="6" height="6" fill="#000000" />
                      <rect x="66" y="78" width="6" height="6" fill="#000000" />

                      <rect x="36" y="86" width="6" height="6" fill="#000000" />
                      <rect x="56" y="86" width="6" height="6" fill="#000000" />
                      <rect x="76" y="86" width="6" height="6" fill="#000000" />
                      <rect x="86" y="86" width="6" height="6" fill="#000000" />
                    </svg>
                  </div>

                  {requestedAmountStr && (
                    <div className="mt-3 p-2 rounded-xl bg-[#F2F2F7] w-full text-center">
                      <span className="text-[10px] text-[#6C6C70] uppercase tracking-wider block">
                        Permintaan Nominal
                      </span>
                      <span className="text-base font-bold font-mono text-black">
                        {formatCurrency(parseInt(requestedAmountStr, 10) || 0, user.currency)}
                      </span>
                    </div>
                  )}

                  <span className="text-[10px] text-[#8E8E93] mt-3 font-mono">
                    NMID: {user.qrisNmid || 'ID1020088910022'} · Standar ASPI Bank Indonesia
                  </span>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider block">
                    Atur Nominal Permintaan (Opsional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-sm font-bold text-[#8E8E93] font-mono">
                      Rp
                    </span>
                    <input
                      type="text"
                      value={requestedAmountStr}
                      onChange={(e) => setRequestedAmountStr(e.target.value.replace(/\D/g, ''))}
                      placeholder="Masukkan nominal bebas"
                      className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#767680]/12 dark:bg-[#767680]/24 border border-transparent text-xs font-mono font-medium text-[#000000] dark:text-[#FFFFFF] placeholder-[#8E8E93] focus:bg-white dark:focus:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-ios-accent transition-all"
                    />
                  </div>

                  {/* Quick Amount Chips */}
                  <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
                    {[25000, 50000, 100000, 250000].map((quickAmt) => (
                      <button
                        key={quickAmt}
                        type="button"
                        onClick={() => {
                          sounds.playHapticClick();
                          setRequestedAmountStr(quickAmt.toString());
                        }}
                        className="py-1 px-2.5 rounded-lg bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[11px] font-mono font-medium text-[#000000] dark:text-[#FFFFFF] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] transition-colors whitespace-nowrap"
                      >
                        +{formatCurrency(quickAmt, user.currency)}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Catatan permintaan (misal: Makan siang)"
                    className="w-full h-10 px-3.5 rounded-xl bg-[#767680]/12 dark:bg-[#767680]/24 border border-transparent text-xs font-medium text-[#000000] dark:text-[#FFFFFF] placeholder-[#8E8E93] focus:bg-white dark:focus:bg-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-ios-accent transition-all mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <motion.button
                    whileTap={iosQuickTap}
                    type="button"
                    onClick={() => {
                      const qrisStr = generateQrisString({
                        merchantName: user.name,
                        phone: user.phone,
                        userId: user.id,
                        amount: requestedAmountStr ? parseInt(requestedAmountStr, 10) : undefined,
                        nmid: user.qrisNmid,
                      });
                      navigator.clipboard.writeText(qrisStr);
                      setCopiedRawQris(true);
                      sounds.playHapticClick();
                      setTimeout(() => setCopiedRawQris(false), 2000);
                    }}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] dark:hover:bg-[#3A3A3C] text-[#000000] dark:text-[#FFFFFF] text-xs font-semibold transition-colors"
                  >
                    {copiedRawQris ? <Check className="w-4 h-4 text-[#34C759]" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedRawQris ? 'Tersalin!' : 'Salin String QRIS'}</span>
                  </motion.button>

                  <motion.button
                    whileTap={iosQuickTap}
                    type="button"
                    onClick={handleDownloadQr}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-ios-accent hover:bg-ios-accent/90 text-white text-xs font-semibold transition-colors shadow-sm"
                  >
                    {downloadSuccess ? <Check className="w-4 h-4 text-white" /> : <Download className="w-4 h-4" />}
                    <span>{downloadSuccess ? 'Tersimpan!' : 'Unduh QR'}</span>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* TAB 3: QRIS SCAN HISTORY */}
            {activeTab === 'history' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={iosSpringTransition}
                className="p-5 overflow-y-auto flex-1 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E5EA] dark:border-[#2C2C2E]">
                  <div>
                    <h4 className="text-xs font-bold text-[#000000] dark:text-[#FFFFFF]">
                      Riwayat Pemindaian QRIS
                    </h4>
                    <p className="text-[11px] text-[#8E8E93]">
                      Tersimpan otomatis dengan tanggal, waktu, bulan & tahun
                    </p>
                  </div>
                  {qrisHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playHapticClick();
                        setQrisHistory([]);
                        localStorage.removeItem('kaipay_qris_history');
                      }}
                      className="text-[11px] text-[#FF3B30] hover:underline"
                    >
                      Hapus Semua
                    </button>
                  )}
                </div>

                {qrisHistory.length === 0 ? (
                  <div className="py-12 text-center text-[#8E8E93]">
                    <History className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-medium">Belum ada riwayat pemindaian</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Pindai kode QRIS merchant untuk menyimpannya di sini.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {qrisHistory.map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        className="p-3.5 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E]/60 border border-black/5 dark:border-white/5 space-y-2.5 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2.5">
                            <div className="p-2 rounded-xl bg-white dark:bg-[#3A3A3C] text-[#007AFF] shadow-sm mt-0.5">
                              <Store className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-[#000000] dark:text-[#FFFFFF]">
                                {item.merchantName}
                              </h5>
                              <p className="text-[10px] text-[#8E8E93] font-mono mt-0.5">
                                {item.phoneOrNmid}
                              </p>
                              {/* Store, Date, Time, Month, Year */}
                              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#007AFF] font-medium">
                                <span>{item.dateString} {item.monthString} {item.yearString}</span>
                                <span>•</span>
                                <span className="font-mono text-[#8E8E93]">{item.timeString}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {item.amount && (
                              <span className="text-xs font-bold font-mono text-[#34C759]">
                                {formatCurrency(item.amount, user.currency)}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteHistoryItem(item.id)}
                              className="p-1 text-[#8E8E93] hover:text-[#FF3B30] transition-colors"
                              title="Hapus riwayat ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Action buttons on history item */}
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-black/5 dark:border-white/5">
                          <motion.button
                            whileTap={iosQuickTap}
                            type="button"
                            onClick={() => {
                              sounds.playHapticClick();
                              onScannedQr({
                                name: item.merchantName,
                                phone: item.phoneOrNmid,
                                amount: item.amount,
                                note: item.note,
                              });
                            }}
                            className="flex items-center justify-center gap-1 py-1.5 rounded-xl bg-[#007AFF] text-white text-[11px] font-semibold"
                          >
                            <span>Bayar Lagi</span>
                          </motion.button>

                          <motion.button
                            whileTap={iosQuickTap}
                            type="button"
                            onClick={() => {
                              sounds.playHapticClick();
                              if (onOpenSplitBillFromQr) {
                                onOpenSplitBillFromQr({
                                  name: item.merchantName,
                                  phone: item.phoneOrNmid,
                                  amount: item.amount,
                                  note: item.note,
                                });
                              } else {
                                onScannedQr({
                                  name: item.merchantName,
                                  phone: item.phoneOrNmid,
                                  amount: item.amount,
                                  note: item.note,
                                });
                              }
                            }}
                            className="flex items-center justify-center gap-1 py-1.5 rounded-xl bg-emerald-500/15 text-[#34C759] hover:bg-emerald-500/25 text-[11px] font-semibold transition-colors"
                          >
                            <Users className="w-3 h-3" />
                            <span>Split Bill</span>
                          </motion.button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
