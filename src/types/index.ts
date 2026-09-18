export type StudyGroup = 'dikkat' | 'kas_gevseme';

export interface Participant {
  id: string; // e.g. "DE-01", "KG-01"
  name: string; // e.g. "Ahmet Yılmaz"
  token: string; // e.g. "de01-9a7f" for magic link
  group: StudyGroup;
  groupTitle: string;
  notes?: string;
  createdAt: string;
}

export interface SessionRecord {
  participantId: string;
  date: string; // YYYY-MM-DD
  session1Completed: boolean;
  session1CompletedAt?: string;
  session1Duration: number; // seconds
  session2Completed: boolean;
  session2CompletedAt?: string;
  session2Duration: number; // seconds
}

export interface AudioTrackInfo {
  group: StudyGroup;
  title: string;
  subtitle: string;
  description: string;
  targetDurationSeconds: number; // 12 minutes = 720 seconds
  audioSrc: string;
}
