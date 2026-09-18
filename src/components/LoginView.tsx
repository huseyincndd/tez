'use client';

import React, { useState } from 'react';
import { Participant } from '@/types';
import { findParticipantById, setStoredParticipant } from '@/lib/storage';
import {
  ArrowRight,
  ShieldCheck,
  Headphones,
  Info,
  Leaf,
  Sparkles,
  Sun,
  Moon,
  Compass,
  Activity,
  CheckCircle2,
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (participant: Participant) => void;
  onOpenAdmin: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onOpenAdmin,
  theme = 'light',
  onToggleTheme,
}) => {
  const [participantId, setParticipantId] = useState('');
  const [error, setError] = useState('');

  const isDark = theme === 'dark';

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    const trimmed = participantId.trim().toUpperCase();
    if (!trimmed) {
      setError('Lütfen araştırmacı tarafından verilen katılımcı kodunuzu giriniz.');
      return;
    }

    const found = findParticipantById(trimmed);
    if (!found) {
      setError(`"${trimmed}" kodlu katılımcı bulunamadı. Lütfen size verilen kodu kontrol ediniz (Örn: DE-01 veya KG-01).`);
      return;
    }

    setStoredParticipant(found);
    onLoginSuccess(found);
  };

  const handleQuickSelect = (id: string) => {
    setParticipantId(id);
    const found = findParticipantById(id);
    if (found) {
      setStoredParticipant(found);
      onLoginSuccess(found);
    }
  };

  return (
    <div
      className={`flex-1 flex flex-col justify-between p-6 sm:p-7 min-h-screen relative overflow-hidden transition-colors duration-500 ${
        isDark
          ? 'bg-gradient-to-b from-[#0a1711] via-[#0f241a] to-[#07130d] text-emerald-50'
          : 'bg-gradient-to-b from-[#f2f7f3] via-[#ffffff] to-[#eff6f1] text-slate-800'
      }`}
    >
      {/* Decorative ambient glowing orbs */}
      <div
        className={`absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none blur-3xl opacity-30 ${
          isDark ? 'bg-emerald-500/20' : 'bg-emerald-300/40'
        }`}
      />
      <div
        className={`absolute -bottom-24 -left-24 w-72 h-72 rounded-full pointer-events-none blur-3xl opacity-30 ${
          isDark ? 'bg-teal-500/20' : 'bg-teal-200/40'
        }`}
      />

      {/* Top Header Bar */}
      <div className="relative z-10 pt-2">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm border transition-transform hover:scale-105 ${
                isDark
                  ? 'bg-gradient-to-tr from-emerald-950 to-[#163828] border-emerald-700/60 text-emerald-300 shadow-emerald-950/40'
                  : 'bg-gradient-to-tr from-emerald-100 to-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-900/5'
              }`}
            >
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                    isDark
                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800/70'
                      : 'bg-emerald-100/80 text-emerald-900 border-emerald-200'
                  }`}
                >
                  Akademik Tez
                </span>
              </div>
              <h2 className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-emerald-200/80' : 'text-slate-600'}`}>
                Seans & Egzersiz Portalı
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl border transition-all shadow-xs ${
                  isDark
                    ? 'bg-emerald-950/70 hover:bg-emerald-900/90 text-amber-300 border-emerald-800/80'
                    : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200 shadow-2xs'
                }`}
                title={isDark ? 'Aydınlık Temaya Geç' : 'Karanlık Temaya Geç'}
              >
                {isDark ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-300" />
                    <span className="text-[11px]">Aydınlık</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-emerald-800" />
                    <span className="text-[11px]">Karanlık</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onOpenAdmin}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all shadow-2xs ${
                isDark
                  ? 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border-emerald-800/60'
                  : 'bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-950 border-emerald-200'
              }`}
            >
              Yönetici
            </button>
          </div>
        </div>

        {/* Hero Welcome Message */}
        <div className="mt-2 mb-8">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold mb-3.5 border shadow-2xs ${
              isDark
                ? 'bg-gradient-to-r from-emerald-950/80 to-[#132c20] border-emerald-700/60 text-emerald-200'
                : 'bg-gradient-to-r from-emerald-50 to-[#ebf6ed] border-emerald-200 text-emerald-900'
            }`}
          >
            <Leaf className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
            <span>Farkındalık & Gevşeme Protokolü</span>
          </div>

          <h1
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 leading-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Zihninize ve Bedeninize <br className="hidden xs:inline" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
              Alan Açın
            </span>
          </h1>

          <p className={`text-xs sm:text-[13px] leading-relaxed ${isDark ? 'text-emerald-200/75' : 'text-slate-600'}`}>
            Araştırma kapsamındaki günlük 12 dakikalık egzersiz oturumlarınıza erişmek için size iletilen katılımcı kodunuzu giriniz.
          </p>
        </div>

        {/* Input Form Card */}
        <div
          className={`p-5 rounded-3xl border shadow-sm backdrop-blur-xs transition-all ${
            isDark ? 'bg-[#0e2118]/80 border-emerald-800/60' : 'bg-white/90 border-emerald-100 shadow-emerald-950/5'
          }`}
        >
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                className={`block text-[11px] font-extrabold mb-1.5 uppercase tracking-wider ${
                  isDark ? 'text-emerald-300' : 'text-slate-700'
                }`}
              >
                Katılımcı Kodu (ID)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={participantId}
                  onChange={(e) => {
                    setParticipantId(e.target.value.toUpperCase());
                    setError('');
                  }}
                  placeholder="Örn: DE-01 veya KG-01"
                  className={`w-full rounded-2xl pl-4 pr-16 py-3.5 text-base font-bold outline-none transition-all shadow-2xs border ${
                    isDark
                      ? 'bg-[#12281e] border-emerald-700/60 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 text-white placeholder-emerald-500/30'
                      : 'bg-[#fcfdfc] border-emerald-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 placeholder-slate-400'
                  }`}
                />
                <span
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-extrabold px-2.5 py-1 rounded-xl border ${
                    isDark
                      ? 'bg-emerald-900/80 text-emerald-200 border-emerald-700/60'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                  }`}
                >
                  KOD
                </span>
              </div>
              {error && (
                <p
                  className={`mt-2 text-xs flex items-center gap-1.5 font-medium p-2.5 rounded-xl border animate-in fade-in duration-200 ${
                    isDark
                      ? 'bg-rose-950/60 border-rose-800/80 text-rose-300'
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}
                >
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all group"
            >
              <span>Oturuma Başla</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        </div>

        {/* Demo Fast Selector Cards */}
        <div
          className={`mt-6 p-4 rounded-3xl border shadow-xs ${
            isDark ? 'bg-[#0d1e16]/60 border-emerald-900/60' : 'bg-[#f8fbf9] border-emerald-100/90'
          }`}
        >
          <div
            className={`flex items-center justify-between mb-3 text-xs font-bold ${
              isDark ? 'text-emerald-200' : 'text-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className={`w-3.5 h-3.5 ${isDark ? 'text-amber-300' : 'text-emerald-600'}`} />
              <span>Önizleme & Hızlı Test Girişi:</span>
            </div>
            <span className={`text-[10px] font-medium ${isDark ? 'text-emerald-400/60' : 'text-slate-400'}`}>
              Örnek Katılımcılar
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickSelect('DE-01')}
              className={`p-3 rounded-2xl border text-left transition-all group shadow-2xs hover:scale-[1.02] active:scale-[0.98] ${
                isDark
                  ? 'bg-[#122b1f] hover:bg-[#163627] border-emerald-700/60 hover:border-emerald-500'
                  : 'bg-white hover:bg-[#f3f9f4] border-emerald-200/80 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-extrabold font-mono ${
                    isDark ? 'text-emerald-300' : 'text-emerald-900'
                  }`}
                >
                  DE-01
                </span>
                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                    isDark
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/40'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}
                >
                  Dikkat
                </span>
              </div>
              <span
                className={`text-[11px] font-bold block ${
                  isDark ? 'text-white' : 'text-slate-800'
                }`}
              >
                Dikkat Eğitimi
              </span>
              <span
                className={`text-[10px] block mt-0.5 truncate ${
                  isDark ? 'text-emerald-300/60' : 'text-slate-500'
                }`}
              >
                Odaklanma Seansı
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelect('KG-01')}
              className={`p-3 rounded-2xl border text-left transition-all group shadow-2xs hover:scale-[1.02] active:scale-[0.98] ${
                isDark
                  ? 'bg-[#1a1727] hover:bg-[#231f34] border-purple-800/60 hover:border-purple-600'
                  : 'bg-white hover:bg-[#f7f5fa] border-purple-200/80 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-extrabold font-mono ${
                    isDark ? 'text-purple-300' : 'text-purple-900'
                  }`}
                >
                  KG-01
                </span>
                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                    isDark
                      ? 'bg-purple-950 text-purple-300 border border-purple-700/40'
                      : 'bg-purple-100 text-purple-900'
                  }`}
                >
                  Gevşeme
                </span>
              </div>
              <span
                className={`text-[11px] font-bold block ${
                  isDark ? 'text-white' : 'text-slate-800'
                }`}
              >
                Kas Gevşeme
              </span>
              <span
                className={`text-[10px] block mt-0.5 truncate ${
                  isDark ? 'text-purple-300/60' : 'text-slate-500'
                }`}
              >
                Jacobson PMR
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Trust & Scientific Badge Footer */}
      <div
        className={`relative z-10 pt-6 pb-2 text-center text-[11px] flex items-center justify-center gap-2 ${
          isDark ? 'text-emerald-300/60' : 'text-slate-500'
        }`}
      >
        <ShieldCheck className={`w-4 h-4 shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
        <span>Tüm seans verileri etik tez protokolüne uygun olarak şifrelenir.</span>
      </div>
    </div>
  );
};
