import { Participant, AudioTrackInfo } from '@/types';

// 10 Dikkat Eğitimi + 10 Kas Gevşeme = 20 Gerçekçi Mock Katılımcı
export const INITIAL_MOCK_PARTICIPANTS: Participant[] = [
  // Dikkat Eğitimi Grubu (10 Kişi)
  { id: 'DE-01', name: 'Ahmet Yılmaz', token: 'de01-7x8q', group: 'dikkat', groupTitle: 'Dikkat Eğitimi Grubu', notes: 'Düzenli takip ediyor', createdAt: '2026-09-10' },
  { id: 'DE-02', name: 'Ayşe Kaya', token: 'de02-9m2p', group: 'dikkat', groupTitle: 'Dikkat Eğitimi Grubu', notes: 'Sabah saatlerini tercih ediyor', createdAt: '2026-09-10' },
  { id: 'DE-03', name: 'Mehmet Demir', token: 'de03-4k1v', group: 'dikkat', groupTitle: 'Dikkat Eğitimi Grubu', notes: '', createdAt: '2026-09-10' },
  { id: 'DE-04', name: 'Fatma Şahin', token: 'de04-8b6t', group: 'dikkat', groupTitle: 'Dikkat Eğitimi Grubu', notes: '', createdAt: '2026-09-11' },
  { id: 'DE-05', name: 'Mustafa Çelik', token: 'de05-3r9y', group: 'dikkat', groupTitle: 'Dikkat Eğitimi Grubu', notes: 'Gözlük kullanıyor', createdAt: '2026-09-11' },
  { id: 'DE-06', name: 'Zeynep Yıldız', token: 'de06-5f2z', group: 'dikkat', groupTitle: 'Dikkat Eğitimi Grubu', notes: '', createdAt: '2026-09-12' },
  { id: 'DE-07', name: 'Emre Öztürk', token: 'de07-1w4h', group: 'dikkat', groupTitle: 'Dikkat Eğitimi Grubu', notes: '', createdAt: '2026-09-12' },
  { id: 'DE-08', name: 'Elif Aydın', token: 'de08-6c8n', group: 'dikkat', groupTitle: 'Dikkat Eğitimi Grubu', notes: 'Yüksek motivasyonlu', createdAt: '2026-09-13' },
  { id: 'DE-09', name: 'Burak Arslan', token: 'de09-2v7j', group: 'dikkat', groupTitle: 'Dikkat Eğitimi Grubu', notes: '', createdAt: '2026-09-13' },
  { id: 'DE-10', name: 'Büşra Doğan', token: 'de10-9k3s', group: 'dikkat', groupTitle: 'Dikkat Eğitimi Grubu', notes: '', createdAt: '2026-09-14' },

  // Progresif Kas Gevşeme Grubu (10 Kişi)
  { id: 'KG-01', name: 'Canan Kılıç', token: 'kg01-8p4w', group: 'kas_gevseme', groupTitle: 'Progresif Kas Gevşeme Grubu', notes: 'Akşam saatlerinde dinliyor', createdAt: '2026-09-10' },
  { id: 'KG-02', name: 'Serkan Yavuz', token: 'kg02-3m7x', group: 'kas_gevseme', groupTitle: 'Progresif Kas Gevşeme Grubu', notes: '', createdAt: '2026-09-10' },
  { id: 'KG-03', name: 'Derya Koç', token: 'kg03-5t1b', group: 'kas_gevseme', groupTitle: 'Progresif Kas Gevşeme Grubu', notes: '', createdAt: '2026-09-10' },
  { id: 'KG-04', name: 'Onur Aslan', token: 'kg04-9y6d', group: 'kas_gevseme', groupTitle: 'Progresif Kas Gevşeme Grubu', notes: 'Boyun gerginliği var', createdAt: '2026-09-11' },
  { id: 'KG-05', name: 'Selin Polat', token: 'kg05-2z8r', group: 'kas_gevseme', groupTitle: 'Progresif Kas Gevşeme Grubu', notes: '', createdAt: '2026-09-11' },
  { id: 'KG-06', name: 'Tolga Çetin', token: 'kg06-7q3v', group: 'kas_gevseme', groupTitle: 'Progresif Kas Gevşeme Grubu', notes: '', createdAt: '2026-09-12' },
  { id: 'KG-07', name: 'Merve Güler', token: 'kg07-4n9g', group: 'kas_gevseme', groupTitle: 'Progresif Kas Gevşeme Grubu', notes: 'Yüz yüze oturuma katıldı', createdAt: '2026-09-12' },
  { id: 'KG-08', name: 'Hakan Taş', token: 'kg08-1k5f', group: 'kas_gevseme', groupTitle: 'Progresif Kas Gevşeme Grubu', notes: '', createdAt: '2026-09-13' },
  { id: 'KG-09', name: 'Gamze Kurt', token: 'kg09-6h2m', group: 'kas_gevseme', groupTitle: 'Progresif Kas Gevşeme Grubu', notes: '', createdAt: '2026-09-13' },
  { id: 'KG-10', name: 'Oğuzhan Şen', token: 'kg10-8j4p', group: 'kas_gevseme', groupTitle: 'Progresif Kas Gevşeme Grubu', notes: '', createdAt: '2026-09-14' },
];

export const AUDIO_TRACKS: Record<string, AudioTrackInfo> = {
  dikkat: {
    group: 'dikkat',
    title: 'Dikkat Eğitimi Egzersizi',
    subtitle: 'Odaklanma ve Farkındalık Seansı',
    description: 'Nefesinize ve beden duyumlarınıza odaklanarak dikkatinizi an be an yönlendirin.',
    targetDurationSeconds: 720, // 12 dakika
    audioSrc: '/audio/dikkat-egitimi.mp3',
  },
  kas_gevseme: {
    group: 'kas_gevseme',
    title: 'Progresif Kas Gevşeme Egzersizi',
    subtitle: 'Derin Fizyolojik Rahatlama Seansı',
    description: 'Kas gruplarınızı sırasıyla kasıp gevşeterek fiziksel ve zihinsel gerginliği serbest bırakın.',
    targetDurationSeconds: 720, // 12 dakika
    audioSrc: '/audio/kas-gevseme.mp3',
  },
};

export const getTodayKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatTurkishDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  });
};
