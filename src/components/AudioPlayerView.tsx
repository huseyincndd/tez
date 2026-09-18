'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Participant, AudioTrackInfo } from '@/types';
import { AUDIO_TRACKS } from '@/lib/mockData';
import { saveSessionProgress } from '@/lib/storage';
import { ambientSound } from '@/lib/soundGenerator';
import {
  Play,
  Pause,
  ArrowLeft,
  SunMedium,
  Clock,
  Sparkles,
  Leaf,
  Sun,
  Moon,
  LogOut,
  HeartHandshake,
} from 'lucide-react';

interface AudioPlayerViewProps {
  participant: Participant;
  sessionNumber: 1 | 2;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onExit: () => void;
  onComplete: () => void;
}

export const AudioPlayerView: React.FC<AudioPlayerViewProps> = ({
  participant,
  sessionNumber,
  theme = 'light',
  onToggleTheme,
  onExit,
  onComplete,
}) => {
  const trackInfo: AudioTrackInfo = AUDIO_TRACKS[participant.group];
  const TARGET_DURATION = trackInfo.targetDurationSeconds; // 720 sn (12 dk)

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isDark = theme === 'dark';

  // Tarayıcı sekme kapatma engeli
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isPlaying && currentSeconds > 0 && currentSeconds < TARGET_DURATION) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isPlaying, currentSeconds, TARGET_DURATION]);

  // Screen Wake Lock API (Ekranın açık kalması)
  useEffect(() => {
    async function requestWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          setWakeLockActive(true);
        }
      } catch {
        setWakeLockActive(false);
      }
    }

    if (isPlaying) {
      requestWakeLock();
    } else {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
        setWakeLockActive(false);
      }
    }

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [isPlaying]);

  // Audio timer loop
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentSeconds((prev) => {
          const next = prev + 1;
          if (next >= TARGET_DURATION) {
            handleFinished();
            return TARGET_DURATION;
          }
          return next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, TARGET_DURATION]);

  // Ses oynat/durdur
  const togglePlay = () => {
    if (isPlaying) {
      ambientSound.pause();
      setIsPlaying(false);
    } else {
      ambientSound.play();
      setIsPlaying(true);
    }
  };

  const handleFinished = () => {
    setIsPlaying(false);
    ambientSound.stop();
    setIsFinished(true);
    saveSessionProgress(participant.id, sessionNumber, TARGET_DURATION, true);
  };

  const handleRequestExit = () => {
    if (currentSeconds > 0 && !isFinished) {
      if (isPlaying) {
        ambientSound.pause();
        setIsPlaying(false);
      }
      setShowExitConfirm(true);
    } else {
      ambientSound.stop();
      onExit();
    }
  };

  const handleConfirmExit = () => {
    ambientSound.stop();
    setShowExitConfirm(false);
    // Kısmi dinlenen süreyi veri tabanına kaydet
    if (currentSeconds > 0) {
      saveSessionProgress(participant.id, sessionNumber, currentSeconds, false);
    }
    onExit();
  };

  const handleResumeExercise = () => {
    setShowExitConfirm(false);
    ambientSound.play();
    setIsPlaying(true);
  };

  // Demo hızlı bitirme (müşteri ve geliştirici testi için)
  const handleFastForwardDemo = () => {
    setCurrentSeconds(TARGET_DURATION - 2);
  };

  // Zaman formatlama (MM:SS)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, Math.round((currentSeconds / TARGET_DURATION) * 100));

  return (
    <div
      className={`flex-1 flex flex-col justify-between p-6 min-h-screen relative overflow-hidden transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-b from-[#12281e] via-[#1a382c] to-[#0f2219] text-emerald-50'
          : 'bg-gradient-to-b from-[#eaf4ec] via-[#f3f9f4] to-[#e4efe6] text-slate-800'
      }`}
    >
      {/* Background Zen Botanical Glow */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none transition-all duration-1000 ${
          isDark ? 'bg-emerald-500/15' : 'bg-emerald-400/20'
        } ${isPlaying ? 'animate-breathing-orb' : 'opacity-25'}`}
      />

      {/* Top Header Bar */}
      <div className="relative z-10 pt-4 flex items-center justify-between">
        <button
          onClick={handleRequestExit}
          className={`p-2.5 rounded-2xl border transition-all active:scale-95 shadow-xs flex items-center gap-1.5 ${
            isDark
              ? 'bg-[#1e4032]/80 hover:bg-[#285240] border-emerald-600/30 text-emerald-200 hover:text-white'
              : 'bg-white hover:bg-emerald-50 border-emerald-200 text-slate-700 hover:text-emerald-950'
          }`}
          title="Çıkış / Geri Dön"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Leaf className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
            <span
              className={`text-[11px] font-bold uppercase tracking-wider block ${
                isDark ? 'text-emerald-300' : 'text-emerald-800'
              }`}
            >
              {sessionNumber}. Oturum Seansı
            </span>
          </div>
          <span className={`text-xs font-medium ${isDark ? 'text-emerald-200/80' : 'text-slate-600'}`}>
            Katılımcı {participant.id}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-xl border transition-all shadow-xs flex items-center justify-center ${
                isDark
                  ? 'bg-[#1e4032]/80 hover:bg-[#285240] text-amber-300 border-emerald-600/30'
                  : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200'
              }`}
              title={isDark ? 'Aydınlık Temaya Geç' : 'Karanlık Temaya Geç'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-emerald-800" />}
            </button>
          )}

          <div
            className={`flex items-center gap-1.5 border px-2.5 py-1.5 rounded-xl text-[11px] ${
              isDark
                ? 'bg-[#1e4032]/80 border-emerald-600/30 text-emerald-200'
                : 'bg-white border-emerald-200 text-slate-700'
            }`}
          >
            <SunMedium className={`w-3.5 h-3.5 ${wakeLockActive ? 'text-amber-400' : 'text-slate-400'}`} />
            <span className="hidden xs:inline">Ekran Açık</span>
          </div>
        </div>
      </div>

      {/* Center Meditation Visual & Title */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-6 text-center">
        {/* Breathing Circle Visual */}
        <div className="relative w-56 h-56 flex items-center justify-center mb-6">
          <div
            className={`absolute inset-0 rounded-full border transition-all duration-700 ${
              isDark ? 'border-emerald-400/20' : 'border-emerald-500/25'
            } ${isPlaying ? 'scale-110 opacity-100' : 'scale-100 opacity-40'}`}
          />
          <div
            className={`absolute inset-3 rounded-full border transition-all duration-700 ${
              isDark ? 'border-teal-400/30' : 'border-emerald-600/30'
            } ${isPlaying ? 'scale-105 opacity-80' : 'scale-95 opacity-30'}`}
          />
          <div
            className={`w-44 h-44 rounded-full backdrop-blur-md border flex flex-col items-center justify-center shadow-2xl transition-all duration-1000 ${
              isDark
                ? 'bg-gradient-to-tr from-emerald-800/40 via-teal-800/50 to-emerald-900/60 border-emerald-400/20'
                : 'bg-gradient-to-tr from-white/90 via-emerald-50/90 to-teal-50/90 border-emerald-200/80 shadow-emerald-950/5'
            } ${isPlaying ? (isDark ? 'scale-105 shadow-emerald-500/20' : 'scale-105 shadow-emerald-600/15') : 'scale-100'}`}
          >
            {/* Audio Waveform Bars */}
            <div className="flex items-center gap-1.5 h-12 mb-2">
              {[40, 70, 100, 60, 85, 45, 90, 65, 35].map((height, idx) => (
                <div
                  key={idx}
                  style={{
                    height: isPlaying ? `${Math.max(12, (height * ((currentSeconds % 4) + 1)) / 4)}px` : '8px',
                    transition: 'height 0.3s ease',
                  }}
                  className={`w-1 rounded-full ${
                    isPlaying
                      ? isDark
                        ? 'bg-gradient-to-t from-emerald-400 to-teal-200'
                        : 'bg-gradient-to-t from-emerald-600 to-teal-500'
                      : isDark
                      ? 'bg-emerald-800'
                      : 'bg-emerald-200'
                  }`}
                />
              ))}
            </div>
            <span className={`text-2xl font-bold tracking-tight font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {formatTime(currentSeconds)}
            </span>
            <span className={`text-[11px] font-medium ${isDark ? 'text-emerald-300/80' : 'text-slate-500'}`}>
              / {formatTime(TARGET_DURATION)}
            </span>
          </div>
        </div>

        {/* Title & Group Description */}
        <div className="max-w-xs">
          <h2 className={`text-xl font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {trackInfo.title}
          </h2>
          <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
            {trackInfo.subtitle}
          </p>
          <p className={`text-xs leading-relaxed px-2 ${isDark ? 'text-emerald-100/70' : 'text-slate-600'}`}>
            {trackInfo.description}
          </p>
        </div>
      </div>

      {/* Bottom Controls Area (NO VOLUME MUTE BUTTON) */}
      <div className="relative z-10 pb-6 space-y-4">
        {/* Progress Bar (READ-ONLY / NO SEEKING) */}
        <div className="space-y-1.5">
          <div className={`flex items-center justify-between text-xs font-medium ${isDark ? 'text-emerald-200' : 'text-slate-600'}`}>
            <span className="flex items-center gap-1">
              <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
              İlerleme: %{progressPercent}
            </span>
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                isDark
                  ? 'text-amber-300 bg-amber-400/15 border-amber-400/30'
                  : 'text-amber-800 bg-amber-50 border-amber-200'
              }`}
            >
              İleri Sarma Kilitli
            </span>
          </div>

          {/* Strict read-only progress track */}
          <div
            className={`w-full h-2.5 rounded-full overflow-hidden p-0.5 border cursor-not-allowed ${
              isDark ? 'bg-[#173326] border-emerald-700/50' : 'bg-emerald-100 border-emerald-200'
            }`}
          >
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full transition-all duration-300 shadow-sm"
            />
          </div>
        </div>

        {/* Big Play / Pause Button & Test Shortcut */}
        <div className="flex items-center justify-center gap-8 pt-2">
          {/* Big Play / Pause Button */}
          <button
            onClick={togglePlay}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 shadow-2xl ${
              isPlaying
                ? isDark
                  ? 'bg-[#183629] border-2 border-emerald-400 text-emerald-300 shadow-emerald-500/20'
                  : 'bg-white border-2 border-emerald-600 text-emerald-700 shadow-emerald-600/15'
                : 'bg-gradient-to-tr from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-emerald-950/20 font-bold'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current translate-x-0.5" />
            )}
          </button>

          {/* Demo button to quickly simulate completion */}
          <button
            onClick={handleFastForwardDemo}
            className={`p-3 rounded-2xl border text-xs flex flex-col items-center transition-all ${
              isDark
                ? 'bg-[#1e4032]/80 hover:bg-[#285240] text-emerald-200 hover:text-amber-300 border-emerald-600/30'
                : 'bg-white hover:bg-emerald-50 text-slate-600 hover:text-amber-600 border-emerald-200'
            }`}
            title="Test: Son 2 saniyeye atla"
          >
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-[9px] mt-0.5 font-bold">Hızlı Test</span>
          </button>
        </div>

        {/* Egzersizden Ayrılma / Bilgi Çubuğu */}
        <div className="flex items-center justify-between pt-1">
          <p className={`text-[11px] font-medium ${isDark ? 'text-emerald-300/70' : 'text-slate-500'}`}>
            {isPlaying
              ? '🌿 Egzersiz aktif. Lütfen sakin pozisyonda kalın.'
              : 'Başlamak için oynat butonuna dokunun.'}
          </p>

          {currentSeconds > 0 && !isFinished && (
            <button
              onClick={handleRequestExit}
              className={`text-[11px] font-semibold flex items-center gap-1 transition-all ${
                isDark ? 'text-emerald-400 hover:text-emerald-200' : 'text-emerald-800 hover:text-emerald-950'
              } underline underline-offset-2`}
            >
              <LogOut className="w-3 h-3" />
              <span>Erken Ayrıl</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= ŞIK VE UYGUN ÇIKIŞ ONAY MODALI ================= */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`border rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4.5 ${
              isDark ? 'bg-[#142d22] border-emerald-600/50 text-emerald-50' : 'bg-white border-emerald-200/90 text-slate-800'
            }`}
          >
            <div
              className={`w-14 h-14 rounded-3xl mx-auto flex items-center justify-center shadow-xs border ${
                isDark
                  ? 'bg-amber-400/15 border-amber-400/30 text-amber-300'
                  : 'bg-amber-50 border-amber-200 text-amber-600'
              }`}
            >
              <HeartHandshake className="w-7 h-7" />
            </div>

            <div>
              <h3 className={`text-lg font-extrabold tracking-tight mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Egzersizi Sonlandırmak İstiyor musunuz?
              </h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-emerald-200/80' : 'text-slate-600'}`}>
                Protokolün hedeflenen nörolojik ve bedensel faydayı sağlayabilmesi için 12 dakikalık seansın kesintisiz tamamlanması önerilir.
              </p>
            </div>

            {/* İlerleme Önizleme Kartı */}
            <div
              className={`p-3 rounded-2xl border text-left space-y-1.5 ${
                isDark ? 'bg-[#0d2118] border-emerald-800/60' : 'bg-emerald-50/70 border-emerald-200/70'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className={isDark ? 'text-emerald-300' : 'text-emerald-900'}>
                  Şu Ana Kadar Dinlenen:
                </span>
                <span className="font-mono text-xs text-amber-500 font-extrabold">
                  {formatTime(currentSeconds)} / 12:00 (%{progressPercent})
                </span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-emerald-950' : 'bg-emerald-200/80'}`}>
                <div
                  style={{ width: `${progressPercent}%` }}
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full"
                />
              </div>
              <span className={`text-[10px] block ${isDark ? 'text-emerald-400/60' : 'text-slate-500'}`}>
                Şimdi ayrılırsanız bu süre sisteme <strong>kısmi dinleme</strong> olarak kaydedilir.
              </span>
            </div>

            {/* Butonlar */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleResumeExercise}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white text-xs font-extrabold shadow-md shadow-emerald-950/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>🌿 Egzersize Devam Et</span>
              </button>
              <button
                onClick={handleConfirmExit}
                className={`w-full py-3 px-4 rounded-2xl text-xs font-semibold transition-all border ${
                  isDark
                    ? 'bg-[#1b3d2f] hover:bg-rose-950/60 text-emerald-200 hover:text-rose-200 border-emerald-700/60 hover:border-rose-700'
                    : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border-slate-200 hover:border-rose-200'
                }`}
              >
                Şimdi Çık ve Süreyi Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finished Celebration Modal */}
      {isFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div
            className={`border rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 ${
              isDark ? 'bg-[#183629] border-emerald-400/50 text-emerald-50' : 'bg-white border-emerald-300 text-slate-800'
            }`}
          >
            <div className="w-14 h-14 rounded-3xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
              <Leaf className="w-8 h-8" />
            </div>

            <div>
              <h3 className={`text-xl font-extrabold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Tebrikler! Seans Tamamlandı
              </h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-emerald-200/80' : 'text-slate-600'}`}>
                Bugünkü {sessionNumber}. oturumunuz başarıyla tamamlandı ve tez protokolüne kaydedildi.
              </p>
            </div>

            <button
              onClick={() => {
                ambientSound.stop();
                onComplete();
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white text-xs font-extrabold shadow-lg shadow-emerald-950/20 transition-all active:scale-[0.98]"
            >
              Panoya Dön
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
