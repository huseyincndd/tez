'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Participant, SessionRecord } from '@/types';
import {
  getStoredParticipant,
  setStoredParticipant,
  getTodaySessionForParticipant,
  findParticipantByToken,
} from '@/lib/storage';
import { LoginView } from '@/components/LoginView';
import { DashboardView } from '@/components/DashboardView';
import { AudioPlayerView } from '@/components/AudioPlayerView';

function ParticipantApp() {
  const searchParams = useSearchParams();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [currentView, setCurrentView] = useState<'login' | 'dashboard' | 'player'>('login');
  const [activeSessionNumber, setActiveSessionNumber] = useState<1 | 2>(1);
  const [todaySession, setTodaySession] = useState<SessionRecord | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const isInitializedRef = useRef(false);

  // Oturum, Telefon/Sistem Tema Tercihi ve Token Kontrolü (Sadece ilk yüklemede ve URL değişiminde)
  useEffect(() => {
    setIsMounted(true);

    // 1. Telefonun / sistemin tercihi kontrolü
    const savedTheme = localStorage.getItem('tez_theme_mode');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme);
    } else if (typeof window !== 'undefined' && window.matchMedia) {
      // Telefon karanlık moddaysa karanlık, aydınlıktaysa aydınlık başlat
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }

    // Telefonun modu dinamik olarak değişirse (kullanıcı elle bir tercih kilitlemediyse)
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        const manual = localStorage.getItem('tez_theme_mode');
        if (!manual) {
          setTheme(e.matches ? 'dark' : 'light');
        }
      };
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    }

    // Sadece ilk açılışta veya Magic Link URL tokenı varsa oturumu yükle (seans oynatıcıdayken dashboard'a geri atmasını önler)
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;

      // 2. URL'de ?token=... varsa doğrudan katılımcıyı bul ve giriş yap (Magic Link)
      const tokenParam = searchParams.get('token');
      if (tokenParam) {
        const found = findParticipantByToken(tokenParam);
        if (found) {
          setStoredParticipant(found);
          setParticipant(found);
          setTodaySession(getTodaySessionForParticipant(found.id));
          setCurrentView('dashboard');
          return;
        }
      }

      // 3. Hafızada (localStorage) kayıtlı oturum varsa yükle
      const stored = getStoredParticipant();
      if (stored) {
        setParticipant(stored);
        setTodaySession(getTodaySessionForParticipant(stored.id));
        setCurrentView('dashboard');
      }
    }
  }, [searchParams]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('tez_theme_mode', next);
      return next;
    });
  };

  const handleLoginSuccess = (p: Participant) => {
    setParticipant(p);
    setTodaySession(getTodaySessionForParticipant(p.id));
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setStoredParticipant(null);
    setParticipant(null);
    setTodaySession(null);
    setCurrentView('login');
  };

  const handleStartSession = (sessionNum: 1 | 2) => {
    setActiveSessionNumber(sessionNum);
    setCurrentView('player');
  };

  const handleSessionComplete = () => {
    if (participant) {
      setTodaySession(getTodaySessionForParticipant(participant.id));
    }
    setCurrentView('dashboard');
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#f4f7f4] flex items-center justify-center text-emerald-800">
        <div className="w-9 h-9 rounded-full border-2 border-emerald-600/30 border-t-emerald-600 animate-spin" />
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <main
      className={`min-h-screen flex flex-col items-center justify-center p-0 sm:p-5 md:p-8 transition-colors duration-500 relative overflow-hidden ${
        isDark
          ? 'bg-gradient-to-br from-[#050e09] via-[#091811] to-[#040a07]'
          : 'bg-gradient-to-br from-[#eaf3ec] via-[#f5f8f5] to-[#e4eee5]'
      }`}
    >
      {/* Desktop decorative ambient aura */}
      <div className="hidden sm:block absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="hidden sm:block absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      {/* Mobil Uygulama Çerçevesi (Masaüstünde şık akıllı telefon görünümü) */}
      <div
        className={`mobile-container w-full sm:rounded-[44px] sm:overflow-hidden transition-all duration-500 relative ${
          isDark
            ? 'sm:border sm:border-emerald-800/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] bg-[#091510] sm:ring-8 sm:ring-black/20'
            : 'sm:border sm:border-[#d2e2d4] shadow-[0_25px_60px_-15px_rgba(20,50,35,0.15)] bg-white sm:ring-8 sm:ring-emerald-900/5'
        }`}
      >
        {currentView === 'login' && (
          <LoginView
            onLoginSuccess={handleLoginSuccess}
            theme={theme}
            onToggleTheme={toggleTheme}
            onOpenAdmin={() => {
              window.location.href = '/admin';
            }}
          />
        )}

        {currentView === 'dashboard' && participant && todaySession && (
          <DashboardView
            participant={participant}
            todaySession={todaySession}
            theme={theme}
            onToggleTheme={toggleTheme}
            onStartSession={handleStartSession}
            onLogout={handleLogout}
            onOpenAdmin={() => {
              window.location.href = '/admin';
            }}
          />
        )}

        {currentView === 'player' && participant && (
          <AudioPlayerView
            participant={participant}
            sessionNumber={activeSessionNumber}
            theme={theme}
            onToggleTheme={toggleTheme}
            onExit={() => setCurrentView('dashboard')}
            onComplete={handleSessionComplete}
          />
        )}
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f4f7f4] flex items-center justify-center text-emerald-800">
          <div className="w-9 h-9 rounded-full border-2 border-emerald-600/30 border-t-emerald-600 animate-spin" />
        </div>
      }
    >
      <ParticipantApp />
    </Suspense>
  );
}
