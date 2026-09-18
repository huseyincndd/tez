'use client';

import React from 'react';
import { Participant, SessionRecord } from '@/types';
import { AUDIO_TRACKS, formatTurkishDate } from '@/lib/mockData';
import {
  LogOut,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  SlidersHorizontal,
  Headphones,
  Leaf,
  Sun,
  Moon,
  Flame,
  Award,
  Volume2,
  ShieldCheck,
} from 'lucide-react';

interface DashboardViewProps {
  participant: Participant;
  todaySession: SessionRecord;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onStartSession: (sessionNumber: 1 | 2) => void;
  onLogout: () => void;
  onOpenAdmin: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  participant,
  todaySession,
  theme = 'light',
  onToggleTheme,
  onStartSession,
  onLogout,
  onOpenAdmin,
}) => {
  const trackInfo = AUDIO_TRACKS[participant.group];
  const completedCount =
    (todaySession.session1Completed ? 1 : 0) + (todaySession.session2Completed ? 1 : 0);

  const isAttention = participant.group === 'dikkat';
  const isDark = theme === 'dark';

  return (
    <div
      className={`flex-1 flex flex-col justify-between min-h-screen pb-8 transition-colors duration-500 ${
        isDark ? 'bg-[#091510] text-emerald-50' : 'bg-[#f8fbf8] text-slate-800'
      }`}
    >
      {/* Top Natural Header & Navigation Bar */}
      <div
        className={`p-5 sm:p-6 pb-5 border-b transition-colors duration-500 ${
          isDark
            ? 'bg-gradient-to-b from-[#0f241a] via-[#0c1e15] to-[#091510] border-emerald-900/60 shadow-xs'
            : 'bg-gradient-to-b from-[#eef6f0] via-[#f7faf8] to-[#f8fbf8] border-emerald-100/90 shadow-2xs'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar badge */}
            <div className="relative">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center border font-extrabold text-xs shadow-xs transition-transform hover:scale-105 ${
                  isDark
                    ? isAttention
                      ? 'bg-gradient-to-tr from-emerald-950 to-emerald-900 border-emerald-700 text-emerald-200'
                      : 'bg-gradient-to-tr from-purple-950 to-purple-900 border-purple-700 text-purple-200'
                    : isAttention
                    ? 'bg-gradient-to-tr from-emerald-100 to-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-gradient-to-tr from-purple-100 to-purple-50 border-purple-300 text-purple-900'
                }`}
              >
                {participant.id}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0f241a]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-sm sm:text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {participant.name || `Katılımcı ${participant.id}`}
                </h1>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                    isDark
                      ? isAttention
                        ? 'bg-emerald-950/90 border-emerald-700 text-emerald-300'
                        : 'bg-purple-950/90 border-purple-700 text-purple-300'
                      : isAttention
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                      : 'bg-purple-100 border-purple-300 text-purple-900'
                  }`}
                >
                  {isAttention ? 'Dikkat Eğitimi' : 'Kas Gevşeme'}
                </span>
              </div>
              <p className={`text-[11px] font-semibold mt-0.5 ${isDark ? 'text-emerald-300/70' : 'text-slate-500'}`}>
                {formatTurkishDate(todaySession.date)} • Kod: <strong className="font-mono">{participant.id}</strong>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className={`p-2 rounded-xl border transition-all shadow-xs flex items-center justify-center hover:scale-105 active:scale-95 ${
                  isDark
                    ? 'bg-[#142d20] hover:bg-[#1a382a] text-amber-300 border-emerald-800/80'
                    : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200 shadow-2xs'
                }`}
                title={isDark ? 'Aydınlık Temaya Geç' : 'Karanlık Temaya Geç'}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-emerald-800" />}
              </button>
            )}

            <button
              onClick={onOpenAdmin}
              className={`p-2 rounded-xl border transition-all shadow-xs hover:scale-105 active:scale-95 ${
                isDark
                  ? 'bg-[#142d20] hover:bg-[#1a382a] text-emerald-300 border-emerald-800/80'
                  : 'bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-950 border-emerald-200 shadow-2xs'
              }`}
              title="Yönetici Paneli"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            <button
              onClick={onLogout}
              className={`p-2 rounded-xl border transition-all shadow-xs hover:scale-105 active:scale-95 ${
                isDark
                  ? 'bg-[#142d20] hover:bg-rose-950/60 text-emerald-300 hover:text-rose-300 border-emerald-800/80 hover:border-rose-800'
                  : 'bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-emerald-200 hover:border-rose-200 shadow-2xs'
              }`}
              title="Çıkış Yap"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Daily Zen Progress Hub (Hero Card) */}
        <div
          className={`mt-3 p-4 sm:p-5 rounded-3xl border shadow-sm relative overflow-hidden transition-all ${
            isDark
              ? 'bg-gradient-to-br from-[#122c1f] via-[#0d2117] to-[#122c1f] border-emerald-700/60'
              : 'bg-gradient-to-br from-[#ebf5ed] via-[#f5faf6] to-[#ebf5ed] border-emerald-200/90 shadow-emerald-950/5'
          }`}
        >
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                  isDark ? 'bg-emerald-950 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                <Leaf className="w-4 h-4" />
              </div>
              <span className={`text-xs sm:text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Günün Seans Durumu
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs font-extrabold font-mono px-2.5 py-1 rounded-xl border shadow-2xs ${
                  completedCount === 2
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : isDark
                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700/80'
                    : 'bg-white text-emerald-900 border-emerald-200'
                }`}
              >
                {completedCount} / 2 Tamamlandı
              </span>
            </div>
          </div>

          {/* Dual Segmented Progress Bar */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div
              className={`h-2 rounded-full overflow-hidden transition-all ${
                todaySession.session1Completed
                  ? 'bg-emerald-500'
                  : isDark
                  ? 'bg-emerald-950/90'
                  : 'bg-emerald-200/70'
              }`}
            />
            <div
              className={`h-2 rounded-full overflow-hidden transition-all ${
                todaySession.session2Completed
                  ? 'bg-emerald-500'
                  : isDark
                  ? 'bg-emerald-950/90'
                  : 'bg-emerald-200/70'
              }`}
            />
          </div>

          <p className={`text-xs leading-relaxed font-medium ${isDark ? 'text-emerald-200/80' : 'text-slate-700'}`}>
            {completedCount === 0 &&
              'Bugünün ilk 12 dakikalık seansını başlatarak zihninize ve bedeninize sakin bir mola verin.'}
            {completedCount === 1 &&
              '🌿 1. Oturum başarıyla tamamlandı! 2. Oturumu gün içerisinde kendinize uygun bir vakitte uygulayabilirsiniz.'}
            {completedCount === 2 &&
              '✨ Harika! Bugünkü her iki seansı da tamamladınız. Zihinsel odak ve bedensel gevşeme hedefinize ulaştınız.'}
          </p>
        </div>
      </div>

      {/* Main Exercises Section */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-emerald-600'}`} />
            <h2 className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-emerald-200' : 'text-slate-800'}`}>
              Günün Egzersizleri
            </h2>
          </div>
          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              isDark
                ? 'text-emerald-300 bg-emerald-950/80 border-emerald-800/60'
                : 'text-emerald-900 bg-emerald-50 border border-emerald-200'
            }`}
          >
            12 dk / seans
          </span>
        </div>

        {/* ================= SESSION 1 CARD ================= */}
        <div
          className={`p-5 rounded-3xl border transition-all duration-300 shadow-sm hover:shadow-md ${
            todaySession.session1Completed
              ? isDark
                ? 'bg-[#122c1f]/90 border-emerald-700/70'
                : 'bg-[#f0f8f2] border-emerald-300'
              : isDark
              ? 'bg-[#0e2218]/90 border-emerald-800/60 hover:border-emerald-600'
              : 'bg-white border-emerald-100 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs transition-transform hover:scale-105 ${
                  todaySession.session1Completed
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : isDark
                    ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
                    : 'bg-emerald-100 border-emerald-200 text-emerald-800'
                }`}
              >
                {todaySession.session1Completed ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Headphones className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider ${
                      isDark ? 'text-emerald-400' : 'text-emerald-700'
                    }`}
                  >
                    1. Oturum
                  </span>
                  {todaySession.session1Completed && (
                    <span className="text-[9px] font-extrabold bg-emerald-600 text-white px-1.5 py-0.2 rounded-md">
                      TAMAMLANDI
                    </span>
                  )}
                </div>
                <h3 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {trackInfo.title}
                </h3>
              </div>
            </div>

            <div
              className={`flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-xl border shadow-2xs ${
                isDark
                  ? 'text-emerald-300 bg-emerald-950/80 border-emerald-800/60'
                  : 'text-emerald-900 bg-emerald-50 border border-emerald-200'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
              <span>12:00</span>
            </div>
          </div>

          <p className={`text-xs mb-4 leading-relaxed ${isDark ? 'text-emerald-200/70' : 'text-slate-600'}`}>
            {trackInfo.description}
          </p>

          {todaySession.session1Completed ? (
            <div
              className={`flex items-center justify-between p-3.5 rounded-2xl border shadow-2xs ${
                isDark
                  ? 'bg-[#163626] border-emerald-700/60 text-white'
                  : 'bg-white border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold">
                <CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span>Oturum Kaydedildi ({todaySession.session1CompletedAt || 'Bugün'})</span>
              </div>
              <button
                onClick={() => onStartSession(1)}
                className={`text-xs font-bold underline underline-offset-2 transition-colors ${
                  isDark ? 'text-emerald-300 hover:text-white' : 'text-emerald-800 hover:text-emerald-950'
                }`}
              >
                Tekrar Dinle
              </button>
            </div>
          ) : (
            <button
              onClick={() => onStartSession(1)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-950/20 active:scale-[0.98] transition-all group"
            >
              <Play className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />
              <span>1. Egzersizi Başlat (12 dk)</span>
            </button>
          )}
        </div>

        {/* ================= SESSION 2 CARD ================= */}
        <div
          className={`p-5 rounded-3xl border transition-all duration-300 shadow-sm hover:shadow-md ${
            todaySession.session2Completed
              ? isDark
                ? 'bg-[#122c1f]/90 border-emerald-700/70'
                : 'bg-[#f0f8f2] border-emerald-300'
              : isDark
              ? 'bg-[#0e2218]/90 border-emerald-800/60 hover:border-emerald-600'
              : 'bg-white border-emerald-100 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs transition-transform hover:scale-105 ${
                  todaySession.session2Completed
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : isDark
                    ? 'bg-teal-950 border-teal-800 text-teal-300'
                    : 'bg-teal-100 border-teal-200 text-teal-800'
                }`}
              >
                {todaySession.session2Completed ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Headphones className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider ${
                      isDark ? 'text-teal-400' : 'text-teal-800'
                    }`}
                  >
                    2. Oturum
                  </span>
                  {todaySession.session2Completed && (
                    <span className="text-[9px] font-extrabold bg-emerald-600 text-white px-1.5 py-0.2 rounded-md">
                      TAMAMLANDI
                    </span>
                  )}
                </div>
                <h3 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {trackInfo.title}
                </h3>
              </div>
            </div>

            <div
              className={`flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-xl border shadow-2xs ${
                isDark
                  ? 'text-teal-300 bg-teal-950/80 border-teal-800/60'
                  : 'text-teal-900 bg-teal-50 border border-teal-200'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-teal-400' : 'text-teal-700'}`} />
              <span>12:00</span>
            </div>
          </div>

          <p className={`text-xs mb-4 leading-relaxed ${isDark ? 'text-emerald-200/70' : 'text-slate-600'}`}>
            Günün ikinci oturumu. Kaslarınızı rahatlatıp gevşetin veya dikkatinizi toplayarak seansı tamamlayın.
          </p>

          {todaySession.session2Completed ? (
            <div
              className={`flex items-center justify-between p-3.5 rounded-2xl border shadow-2xs ${
                isDark
                  ? 'bg-[#163626] border-emerald-700/60 text-white'
                  : 'bg-white border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold">
                <CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span>Oturum Kaydedildi ({todaySession.session2CompletedAt || 'Bugün'})</span>
              </div>
              <button
                onClick={() => onStartSession(2)}
                className={`text-xs font-bold underline underline-offset-2 transition-colors ${
                  isDark ? 'text-emerald-300 hover:text-white' : 'text-emerald-800 hover:text-emerald-950'
                }`}
              >
                Tekrar Dinle
              </button>
            </div>
          ) : (
            <button
              onClick={() => onStartSession(2)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-800 via-emerald-800 to-emerald-700 hover:from-teal-700 hover:to-emerald-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-950/20 active:scale-[0.98] transition-all group"
            >
              <Play className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />
              <span>2. Egzersizi Başlat (12 dk)</span>
            </button>
          )}
        </div>

        {/* ================= WEEKLY HABIT CALENDAR ================= */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border shadow-xs transition-all ${
            isDark ? 'bg-[#0d2217]/80 border-emerald-800/60' : 'bg-white border-emerald-100'
          }`}
        >
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  isDark ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-100 text-amber-700'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
              </div>
              <span className={`text-xs font-extrabold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Haftalık Seans Zinciri
              </span>
            </div>

            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                isDark
                  ? 'text-emerald-300 bg-emerald-950/80 border-emerald-800/60'
                  : 'text-emerald-900 bg-emerald-50 border border-emerald-200'
              }`}
            >
              Son 7 Gün
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, i) => {
              const isToday = i === 2; // Çarşamba sample
              const isDone = i <= 2 && completedCount > 0;
              return (
                <div key={day} className="flex flex-col items-center gap-1.5">
                  <span className={`text-[10px] font-extrabold ${isDark ? 'text-emerald-300/70' : 'text-slate-500'}`}>
                    {day}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold transition-all shadow-2xs ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-emerald-950/20'
                        : isToday
                        ? isDark
                          ? 'bg-emerald-900/80 text-emerald-200 border-2 border-emerald-400 ring-2 ring-emerald-500/20'
                          : 'bg-emerald-100 text-emerald-900 border-2 border-emerald-500 ring-2 ring-emerald-500/20'
                        : isDark
                        ? 'bg-[#132c20] text-emerald-700/50 border border-emerald-900/60'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isDone ? '✓' : '•'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= MINDFUL CLINICAL TIPS ================= */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div
            className={`p-3 rounded-2xl border text-center transition-all ${
              isDark ? 'bg-[#0c1e15]/70 border-emerald-900/50' : 'bg-white/90 border-emerald-100 shadow-2xs'
            }`}
          >
            <Headphones className={`w-4 h-4 mx-auto mb-1.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
            <span className={`text-[10px] font-extrabold block ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Kulaklık
            </span>
            <span className={`text-[9px] block mt-0.5 ${isDark ? 'text-emerald-300/60' : 'text-slate-500'}`}>
              Stereo önerilir
            </span>
          </div>

          <div
            className={`p-3 rounded-2xl border text-center transition-all ${
              isDark ? 'bg-[#0c1e15]/70 border-emerald-900/50' : 'bg-white/90 border-emerald-100 shadow-2xs'
            }`}
          >
            <Clock className={`w-4 h-4 mx-auto mb-1.5 ${isDark ? 'text-teal-400' : 'text-teal-700'}`} />
            <span className={`text-[10px] font-extrabold block ${isDark ? 'text-white' : 'text-slate-800'}`}>
              12 Dakika
            </span>
            <span className={`text-[9px] block mt-0.5 ${isDark ? 'text-emerald-300/60' : 'text-slate-500'}`}>
              Kesintisiz seans
            </span>
          </div>

          <div
            className={`p-3 rounded-2xl border text-center transition-all ${
              isDark ? 'bg-[#0c1e15]/70 border-emerald-900/50' : 'bg-white/90 border-emerald-100 shadow-2xs'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 mx-auto mb-1.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
            <span className={`text-[10px] font-extrabold block ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Protokol
            </span>
            <span className={`text-[9px] block mt-0.5 ${isDark ? 'text-emerald-300/60' : 'text-slate-500'}`}>
              Klinik takip
            </span>
          </div>
        </div>
      </div>

      {/* Footer Support Info */}
      <div className="px-5 sm:px-6 pt-2 text-center">
        <p className={`text-[11px] font-semibold leading-relaxed ${isDark ? 'text-emerald-300/50' : 'text-slate-400'}`}>
          Sorularınız için tez danışmanınızla iletişime geçebilirsiniz. Seanslar her gece 00:00’da sıfırlanır.
        </p>
      </div>
    </div>
  );
};
