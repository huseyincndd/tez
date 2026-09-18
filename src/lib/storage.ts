import { Participant, SessionRecord } from '@/types';
import { INITIAL_MOCK_PARTICIPANTS, getTodayKey } from './mockData';

const PARTICIPANTS_STORAGE_KEY = 'tez_participants_list_v2';
const CURRENT_USER_KEY = 'tez_current_participant';
const SESSIONS_STORAGE_KEY = 'tez_session_records_v2';
const ADMIN_AUTH_KEY = 'tez_admin_authenticated';
const MOCK_SEEDED_VERSION_KEY = 'tez_rich_mock_version_v4';

// ================= ADMIN AUTH =================
export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
}

export function setAdminLoggedIn(val: boolean): void {
  if (typeof window === 'undefined') return;
  if (val) {
    sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
  } else {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
  }
}

// ================= PARTICIPANT CRUD =================
export function getParticipants(): Participant[] {
  if (typeof window === 'undefined') return INITIAL_MOCK_PARTICIPANTS;
  const raw = localStorage.getItem(PARTICIPANTS_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(PARTICIPANTS_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_PARTICIPANTS));
    return INITIAL_MOCK_PARTICIPANTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_MOCK_PARTICIPANTS;
  }
}

export function saveParticipants(list: Participant[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PARTICIPANTS_STORAGE_KEY, JSON.stringify(list));
}

export function addParticipant(data: {
  id: string;
  name: string;
  group: 'dikkat' | 'kas_gevseme';
  notes?: string;
}): Participant {
  const participants = getParticipants();
  const cleanId = data.id.trim().toUpperCase();

  // Benzersiz token üret: örn "de11-4x9y"
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const token = `${cleanId.toLowerCase().replace(/[^a-z0-9]/g, '')}-${randomSuffix}`;

  const newP: Participant = {
    id: cleanId,
    name: data.name.trim(),
    group: data.group,
    groupTitle: data.group === 'dikkat' ? 'Dikkat Eğitimi Grubu' : 'Progresif Kas Gevşeme Grubu',
    token,
    notes: data.notes?.trim() || '',
    createdAt: getTodayKey(),
  };

  participants.unshift(newP);
  saveParticipants(participants);
  return newP;
}

export function updateParticipant(
  id: string,
  updates: Partial<Pick<Participant, 'name' | 'group' | 'notes'>>
): Participant | null {
  const participants = getParticipants();
  const index = participants.findIndex((p) => p.id.toUpperCase() === id.toUpperCase());
  if (index === -1) return null;

  const current = participants[index];
  const updated: Participant = {
    ...current,
    ...updates,
    groupTitle:
      (updates.group || current.group) === 'dikkat'
        ? 'Dikkat Eğitimi Grubu'
        : 'Progresif Kas Gevşeme Grubu',
  };

  participants[index] = updated;
  saveParticipants(participants);
  return updated;
}

export function deleteParticipant(id: string): void {
  const participants = getParticipants().filter((p) => p.id.toUpperCase() !== id.toUpperCase());
  saveParticipants(participants);
}

export function findParticipantByToken(token: string): Participant | undefined {
  const participants = getParticipants();
  return participants.find((p) => p.token.toLowerCase() === token.trim().toLowerCase());
}

export function findParticipantById(id: string): Participant | undefined {
  const participants = getParticipants();
  return participants.find((p) => p.id.toUpperCase() === id.trim().toUpperCase());
}

// ================= SESSION STATE (LOGGED IN PARTICIPANT) =================
export function getStoredParticipant(): Participant | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredParticipant(p: Participant | null): void {
  if (typeof window === 'undefined') return;
  if (!p) {
    localStorage.removeItem(CURRENT_USER_KEY);
  } else {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(p));
  }
}

// Helper to get yesterday date formatted as YYYY-MM-DD
function getYesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ================= SESSIONS & TRACKING DATA =================
export function getAllSessions(): Record<string, SessionRecord> {
  if (typeof window === 'undefined') return seedInitialSessions();
  const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
  let sessions: Record<string, SessionRecord>;
  if (!raw) {
    sessions = seedInitialSessions();
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    localStorage.setItem(MOCK_SEEDED_VERSION_KEY, 'v4');
  } else {
    try {
      sessions = JSON.parse(raw);
    } catch {
      sessions = {};
    }
  }

  // Bugün ve Dün için zengin mock verilerin varlığını kontrol et ve güncelle
  const currentVersion = localStorage.getItem(MOCK_SEEDED_VERSION_KEY);
  if (currentVersion !== 'v4') {
    const seedData = seedInitialSessions();
    sessions = { ...seedData, ...sessions }; // Kullanıcının yeni oturumlarını ezmeden mockları zenginleştir
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    localStorage.setItem(MOCK_SEEDED_VERSION_KEY, 'v4');
  } else {
    // Tarih değiştiğinde bugünün ve dünün mocklarının daima hazır bulunmasını sağla
    const today = getTodayKey();
    const yesterday = getYesterdayKey();
    let hasChanges = false;

    const seedData = seedInitialSessions();
    for (const [key, record] of Object.entries(seedData)) {
      if (!sessions[key] || (key.includes(today) && !sessions[key].session1Completed && sessions[key].session1Duration === 0)) {
        sessions[key] = record;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    }
  }

  return sessions;
}

export function getSession(participantId: string, dateStr: string): SessionRecord {
  const all = getAllSessions();
  const key = `${participantId}_${dateStr}`;
  if (all[key]) return all[key];
  return {
    participantId,
    date: dateStr,
    session1Completed: false,
    session1Duration: 0,
    session2Completed: false,
    session2Duration: 0,
  };
}

export function getTodaySessionForParticipant(participantId: string): SessionRecord {
  return getSession(participantId, getTodayKey());
}

export function saveSessionProgress(
  participantId: string,
  sessionNumber: 1 | 2,
  durationSeconds: number,
  isCompleted: boolean,
  targetDate?: string
): SessionRecord {
  const dateStr = targetDate || getTodayKey();
  const all = getAllSessions();
  const key = `${participantId}_${dateStr}`;
  const current = getSession(participantId, dateStr);

  const nowTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  if (sessionNumber === 1) {
    current.session1Duration = Math.max(current.session1Duration, durationSeconds);
    if (isCompleted) {
      current.session1Completed = true;
      current.session1CompletedAt = nowTime;
    }
  } else {
    current.session2Duration = Math.max(current.session2Duration, durationSeconds);
    if (isCompleted) {
      current.session2Completed = true;
      current.session2CompletedAt = nowTime;
    }
  }

  all[key] = current;
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(all));
  }
  return current;
}

// Gerçekçi, zengin geçmiş (Dün) ve bugün oturum kayıtları
function seedInitialSessions(): Record<string, SessionRecord> {
  const today = getTodayKey();
  const yesterday = getYesterdayKey();

  const records: Record<string, SessionRecord> = {
    // ==========================================
    // 1. DÜNKÜ SEANSLAR (Geniş Uyum & Kısmi Veriler)
    // ==========================================
    // DE-01: Tam Uyum (2/2)
    [`DE-01_${yesterday}`]: {
      participantId: 'DE-01',
      date: yesterday,
      session1Completed: true,
      session1CompletedAt: '09:12',
      session1Duration: 720,
      session2Completed: true,
      session2CompletedAt: '18:40',
      session2Duration: 720,
    },
    // DE-02: Tam Uyum (2/2)
    [`DE-02_${yesterday}`]: {
      participantId: 'DE-02',
      date: yesterday,
      session1Completed: true,
      session1CompletedAt: '10:05',
      session1Duration: 720,
      session2Completed: true,
      session2CompletedAt: '19:15',
      session2Duration: 720,
    },
    // DE-03: 1. Oturum Tam, 2. Oturum Kısmi (%63 - 450 sn)
    [`DE-03_${yesterday}`]: {
      participantId: 'DE-03',
      date: yesterday,
      session1Completed: true,
      session1CompletedAt: '09:40',
      session1Duration: 720,
      session2Completed: false,
      session2CompletedAt: '18:00',
      session2Duration: 450,
    },
    // DE-04: Tam Uyum (2/2)
    [`DE-04_${yesterday}`]: {
      participantId: 'DE-04',
      date: yesterday,
      session1Completed: true,
      session1CompletedAt: '11:20',
      session1Duration: 720,
      session2Completed: true,
      session2CompletedAt: '21:05',
      session2Duration: 720,
    },
    // DE-05: Sadece 1. Oturum Tam (1/2)
    [`DE-05_${yesterday}`]: {
      participantId: 'DE-05',
      date: yesterday,
      session1Completed: true,
      session1CompletedAt: '08:30',
      session1Duration: 720,
      session2Completed: false,
      session2Duration: 0,
    },
    // DE-07: Tam Uyum (2/2)
    [`DE-07_${yesterday}`]: {
      participantId: 'DE-07',
      date: yesterday,
      session1Completed: true,
      session1CompletedAt: '10:15',
      session1Duration: 720,
      session2Completed: true,
      session2CompletedAt: '17:50',
      session2Duration: 720,
    },
    // DE-08: Tam Uyum (2/2)
    [`DE-08_${yesterday}`]: {
      participantId: 'DE-08',
      date: yesterday,
      session1Completed: true,
      session1CompletedAt: '09:00',
      session1Duration: 720,
      session2Completed: true,
      session2CompletedAt: '16:30',
      session2Duration: 720,
    },
    // DE-09: 1. Oturum Kısmi (%50 - 360 sn)
    [`DE-09_${yesterday}`]: {
      participantId: 'DE-09',
      date: yesterday,
      session1Completed: false,
      session1CompletedAt: '14:10',
      session1Duration: 360,
      session2Completed: false,
      session2Duration: 0,
    },
    // KG-01: Tam Uyum (2/2)
    [`KG-01_${yesterday}`]: {
      participantId: 'KG-01',
      date: yesterday,
      session1Completed: true,
      session1CompletedAt: '08:45',
      session1Duration: 720,
      session2Completed: true,
      session2CompletedAt: '20:15',
      session2Duration: 720,
    },
    // KG-02: Tam Uyum (2/2)
    [`KG-02_${yesterday}`]: {
      participantId: 'KG-02',
      date: yesterday,
      session1Completed: true,
      session1CompletedAt: '11:20',
      session1Duration: 720,
      session2Completed: true,
      session2CompletedAt: '17:30',
      session2Duration: 720,
    },
    // KG-03: Tam Uyum (2/2)
    [`KG-03_${yesterday}`]: {
      participantId: 'KG-03',
      date: yesterday,
      session1Completed: true,
      session1CompletedAt: '09:50',
      session1Duration: 720,
      session2Completed: true,
      session2CompletedAt: '19:40',
      session2Duration: 720,
    },
    // KG-04: Sadece 1. Oturum Tam (1/2)
    [`KG-04_${yesterday}`]: {
      participantId: 'KG-04',
      date: yesterday,
      session1Completed: true,
      session1CompletedAt: '10:10',
      session1Duration: 720,
      session2Completed: false,
      session2Duration: 0,
    },
    // KG-05: Tam Uyum (2/2)
    [`KG-05_${yesterday}`]: {
      participantId: 'KG-05',
      date: yesterday,
      session1Completed: true,
      session1CompletedAt: '08:20',
      session1Duration: 720,
      session2Completed: true,
      session2CompletedAt: '18:10',
      session2Duration: 720,
    },
    // KG-06: 1. Oturum Kısmi (%42 - 300 sn)
    [`KG-06_${yesterday}`]: {
      participantId: 'KG-06',
      date: yesterday,
      session1Completed: false,
      session1CompletedAt: '15:25',
      session1Duration: 300,
      session2Completed: false,
      session2Duration: 0,
    },
    // KG-07: Tam Uyum (2/2)
    [`KG-07_${yesterday}`]: {
      participantId: 'KG-07',
      date: yesterday,
      session1Completed: true,
      session1CompletedAt: '09:30',
      session1Duration: 720,
      session2Completed: true,
      session2CompletedAt: '20:00',
      session2Duration: 720,
    },
    // KG-08: Tam Uyum (2/2)
    [`KG-08_${yesterday}`]: {
      participantId: 'KG-08',
      date: yesterday,
      session1Completed: true,
      session1CompletedAt: '10:00',
      session1Duration: 720,
      session2Completed: true,
      session2CompletedAt: '19:10',
      session2Duration: 720,
    },

    // ==========================================
    // 2. BUGÜNKÜ SEANSLAR (Günün Akışı & Gerçekçi Durumlar)
    // ==========================================
    // DE-01: Sabah & Akşam her ikisini de bitirdi (Tam Uyum 2/2)
    [`DE-01_${today}`]: {
      participantId: 'DE-01',
      date: today,
      session1Completed: true,
      session1CompletedAt: '09:15',
      session1Duration: 720,
      session2Completed: true,
      session2CompletedAt: '16:30',
      session2Duration: 720,
    },
    // DE-02: 1. Oturum tamamlandı (Sabah), 2. Oturum henüz yapılmadı
    [`DE-02_${today}`]: {
      participantId: 'DE-02',
      date: today,
      session1Completed: true,
      session1CompletedAt: '10:45',
      session1Duration: 720,
      session2Completed: false,
      session2Duration: 0,
    },
    // DE-03: 1. Oturum tamamlandı
    [`DE-03_${today}`]: {
      participantId: 'DE-03',
      date: today,
      session1Completed: true,
      session1CompletedAt: '11:10',
      session1Duration: 720,
      session2Completed: false,
      session2Duration: 0,
    },
    // DE-04: Sadece 3 dakika dinlenip çıkıldı (%25 kısmi uyarı testi)
    [`DE-04_${today}`]: {
      participantId: 'DE-04',
      date: today,
      session1Completed: false,
      session1CompletedAt: '13:20',
      session1Duration: 180, // 3 dk / 12 dk = %25
      session2Completed: false,
      session2Duration: 0,
    },
    // DE-06: 8.5 dakika dinlenip çıkıldı (%71 - 510 sn)
    [`DE-06_${today}`]: {
      participantId: 'DE-06',
      date: today,
      session1Completed: false,
      session1CompletedAt: '12:05',
      session1Duration: 510,
      session2Completed: false,
      session2Duration: 0,
    },
    // DE-07: Her iki oturumu tamamladı (Tam Uyum 2/2)
    [`DE-07_${today}`]: {
      participantId: 'DE-07',
      date: today,
      session1Completed: true,
      session1CompletedAt: '08:30',
      session1Duration: 720,
      session2Completed: true,
      session2CompletedAt: '15:45',
      session2Duration: 720,
    },
    // DE-08: 1. Oturumu tamamladı
    [`DE-08_${today}`]: {
      participantId: 'DE-08',
      date: today,
      session1Completed: true,
      session1CompletedAt: '09:00',
      session1Duration: 720,
      session2Completed: false,
      session2Duration: 0,
    },
    // KG-01: Her iki oturumu tamamladı (Tam Uyum 2/2)
    [`KG-01_${today}`]: {
      participantId: 'KG-01',
      date: today,
      session1Completed: true,
      session1CompletedAt: '08:15',
      session1Duration: 720,
      session2Completed: true,
      session2CompletedAt: '16:00',
      session2Duration: 720,
    },
    // KG-02: 1. Oturumu tamamladı
    [`KG-02_${today}`]: {
      participantId: 'KG-02',
      date: today,
      session1Completed: true,
      session1CompletedAt: '10:20',
      session1Duration: 720,
      session2Completed: false,
      session2Duration: 0,
    },
    // KG-03: Her iki oturumu tamamladı (Tam Uyum 2/2)
    [`KG-03_${today}`]: {
      participantId: 'KG-03',
      date: today,
      session1Completed: true,
      session1CompletedAt: '09:40',
      session1Duration: 720,
      session2Completed: true,
      session2CompletedAt: '17:15',
      session2Duration: 720,
    },
    // KG-04: 6 dakika dinlendi (%50 - 360 sn)
    [`KG-04_${today}`]: {
      participantId: 'KG-04',
      date: today,
      session1Completed: false,
      session1CompletedAt: '11:50',
      session1Duration: 360,
      session2Completed: false,
      session2Duration: 0,
    },
    // KG-05: 1. Oturumu tamamladı
    [`KG-05_${today}`]: {
      participantId: 'KG-05',
      date: today,
      session1Completed: true,
      session1CompletedAt: '08:50',
      session1Duration: 720,
      session2Completed: false,
      session2Duration: 0,
    },
    // KG-07: Her iki oturumu tamamladı (Tam Uyum 2/2)
    [`KG-07_${today}`]: {
      participantId: 'KG-07',
      date: today,
      session1Completed: true,
      session1CompletedAt: '11:00',
      session1Duration: 720,
      session2Completed: true,
      session2CompletedAt: '18:20',
      session2Duration: 720,
    },
  };

  return records;
}
