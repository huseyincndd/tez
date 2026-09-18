'use client';

import React, { useState, useEffect } from 'react';
import { Participant } from '@/types';
import { getTodayKey, formatTurkishDate } from '@/lib/mockData';
import {
  getParticipants,
  addParticipant,
  updateParticipant,
  deleteParticipant,
  getSession,
  getAllSessions,
  isAdminLoggedIn,
  setAdminLoggedIn,
} from '@/lib/storage';
import {
  Lock,
  LogOut,
  Plus,
  Search,
  Filter,
  Check,
  Edit2,
  Trash2,
  Calendar,
  FileSpreadsheet,
  Users,
  CheckCircle2,
  XCircle,
  Link2,
  ArrowRight,
  ShieldCheck,
  Info,
  Clock,
  ExternalLink,
  Leaf,
  FileText,
  Printer,
  Download,
} from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // Tab & Date State
  const [activeTab, setActiveTab] = useState<'sessions' | 'participants'>('sessions');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayKey());
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<'all' | 'dikkat' | 'kas_gevseme'>('all');

  // Copy Link Feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    group: 'dikkat' as 'dikkat' | 'kas_gevseme',
    notes: '',
  });

  useEffect(() => {
    setIsMounted(true);
    if (isAdminLoggedIn()) {
      setIsAuthenticated(true);
      setParticipants(getParticipants());
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '1234') {
      setAdminLoggedIn(true);
      setIsAuthenticated(true);
      setPasswordError('');
      setParticipants(getParticipants());
    } else {
      setPasswordError('Hatalı yönetici şifresi! Lütfen tekrar deneyiniz.');
    }
  };

  const handleLogout = () => {
    setAdminLoggedIn(false);
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  const refreshParticipants = () => {
    setParticipants(getParticipants());
  };

  // Güvenilir Pano Kopyalama (Clipboard API + Fallback)
  const handleCopyLink = (participant: Participant) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const magicLink = `${baseUrl}/?token=${participant.token}`;

    const onSuccess = () => {
      setCopiedId(participant.id);
      setTimeout(() => setCopiedId(null), 2500);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(magicLink)
        .then(onSuccess)
        .catch(() => fallbackCopy(magicLink, onSuccess));
    } else {
      fallbackCopy(magicLink, onSuccess);
    }
  };

  const fallbackCopy = (text: string, cb: () => void) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      cb();
    } catch (err) {
      console.error('Kopyalama hatası:', err);
    }
    document.body.removeChild(textArea);
  };

  // Add Participant
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id.trim() || !formData.name.trim()) return;

    addParticipant({
      id: formData.id,
      name: formData.name,
      group: formData.group,
      notes: formData.notes,
    });

    setIsAddModalOpen(false);
    setFormData({ id: '', name: '', group: 'dikkat', notes: '' });
    refreshParticipants();
  };

  // Edit Participant
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParticipant) return;

    updateParticipant(editingParticipant.id, {
      name: editingParticipant.name,
      group: editingParticipant.group,
      notes: editingParticipant.notes,
    });

    setEditingParticipant(null);
    refreshParticipants();
  };

  // Delete Participant
  const handleDelete = (id: string, name: string) => {
    if (confirm(`"${name}" (${id}) isimli katılımcıyı silmek istediğinize emin misiniz?`)) {
      deleteParticipant(id);
      refreshParticipants();
    }
  };

  // Quick Date Selectors
  const setDateOffset = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setSelectedDate(dateStr);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ================= 1. DÜZENLİ, BİÇİMLENDİRİLMİŞ VE ANLAŞILIR EXCEL ÇIKTISI (.xls) =================
  const handleExportExcel = (mode: 'selectedDate' | 'allDates') => {
    const allSessions = getAllSessions();
    const isSingleDate = mode === 'selectedDate';
    const reportDateStr = isSingleDate ? formatTurkishDate(selectedDate) : 'Tüm Kayıtlı Tarihler';
    const nowStr = new Date().toLocaleString('tr-TR');

    let tableRowsHtml = '';
    let rowIndex = 1;

    const formatSecsReadable = (secs: number) => {
      if (!secs || secs === 0) return '-';
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return `${m} dk ${s > 0 ? s + ' sn' : ''}`;
    };

    if (isSingleDate) {
      participants.forEach((p) => {
        const s = getSession(p.id, selectedDate);
        const totalSec = s.session1Duration + s.session2Duration;
        const isComplete = s.session1Completed && s.session2Completed;
        const isPartial =
          !isComplete &&
          (s.session1Completed || s.session2Completed || s.session1Duration > 0 || s.session2Duration > 0);

        const p1Status = s.session1Completed
          ? 'Tamamlandı (%100)'
          : s.session1Duration > 0
          ? `Kısmi (%${Math.round((s.session1Duration / 720) * 100)})`
          : 'Yapılmadı (%0)';

        const p2Status = s.session2Completed
          ? 'Tamamlandı (%100)'
          : s.session2Duration > 0
          ? `Kısmi (%${Math.round((s.session2Duration / 720) * 100)})`
          : 'Yapılmadı (%0)';

        const dailyResult = isComplete
          ? 'TAM UYUM (2/2)'
          : isPartial
          ? 'KISMİ UYUM (1/2)'
          : 'YAPILMADI (0/2)';

        const statusClass = isComplete ? 'status-tam' : isPartial ? 'status-kismi' : 'status-yok';
        const zebraClass = rowIndex % 2 === 0 ? 'zebra' : '';

        tableRowsHtml += `
          <tr class="${zebraClass}">
            <td style="text-align:center;">${rowIndex++}</td>
            <td style="font-weight:bold;text-align:center;mso-number-format:'\\@';">${p.id}</td>
            <td style="font-weight:bold;">${p.name}</td>
            <td style="text-align:center;">${p.group === 'dikkat' ? 'Dikkat Eğitimi' : 'Kas Gevşeme'}</td>
            <td style="text-align:center;">${selectedDate}</td>
            <td style="text-align:center;">${p1Status}</td>
            <td style="text-align:center;">${formatSecsReadable(s.session1Duration)}</td>
            <td style="text-align:center;">${s.session1CompletedAt || '-'}</td>
            <td style="text-align:center;">${p2Status}</td>
            <td style="text-align:center;">${formatSecsReadable(s.session2Duration)}</td>
            <td style="text-align:center;">${s.session2CompletedAt || '-'}</td>
            <td style="font-weight:bold;text-align:center;">${formatSecsReadable(totalSec)}</td>
            <td class="${statusClass}">${dailyResult}</td>
            <td>${p.notes || '-'}</td>
          </tr>
        `;
      });
    } else {
      const keys = Object.keys(allSessions);
      if (keys.length === 0) {
        alert('Henüz kayıtlı seans verisi bulunmamaktadır.');
        return;
      }
      keys.forEach((key) => {
        const s = allSessions[key];
        const p = participants.find((item) => item.id === s.participantId);
        const totalSec = s.session1Duration + s.session2Duration;
        const isComplete = s.session1Completed && s.session2Completed;
        const isPartial =
          !isComplete &&
          (s.session1Completed || s.session2Completed || s.session1Duration > 0 || s.session2Duration > 0);

        const p1Status = s.session1Completed
          ? 'Tamamlandı (%100)'
          : s.session1Duration > 0
          ? `Kısmi (%${Math.round((s.session1Duration / 720) * 100)})`
          : 'Yapılmadı (%0)';

        const p2Status = s.session2Completed
          ? 'Tamamlandı (%100)'
          : s.session2Duration > 0
          ? `Kısmi (%${Math.round((s.session2Duration / 720) * 100)})`
          : 'Yapılmadı (%0)';

        const dailyResult = isComplete
          ? 'TAM UYUM (2/2)'
          : isPartial
          ? 'KISMİ UYUM (1/2)'
          : 'YAPILMADI (0/2)';

        const statusClass = isComplete ? 'status-tam' : isPartial ? 'status-kismi' : 'status-yok';
        const zebraClass = rowIndex % 2 === 0 ? 'zebra' : '';

        tableRowsHtml += `
          <tr class="${zebraClass}">
            <td style="text-align:center;">${rowIndex++}</td>
            <td style="font-weight:bold;text-align:center;mso-number-format:'\\@';">${s.participantId}</td>
            <td style="font-weight:bold;">${p?.name || '-'}</td>
            <td style="text-align:center;">${p?.group === 'dikkat' ? 'Dikkat Eğitimi' : 'Kas Gevşeme'}</td>
            <td style="text-align:center;">${s.date}</td>
            <td style="text-align:center;">${p1Status}</td>
            <td style="text-align:center;">${formatSecsReadable(s.session1Duration)}</td>
            <td style="text-align:center;">${s.session1CompletedAt || '-'}</td>
            <td style="text-align:center;">${p2Status}</td>
            <td style="text-align:center;">${formatSecsReadable(s.session2Duration)}</td>
            <td style="text-align:center;">${s.session2CompletedAt || '-'}</td>
            <td style="font-weight:bold;text-align:center;">${formatSecsReadable(totalSec)}</td>
            <td class="${statusClass}">${dailyResult}</td>
            <td>${p?.notes || '-'}</td>
          </tr>
        `;
      });
    }

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Seans Raporu</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; }
          .report-title { font-size: 15pt; font-weight: bold; color: #1B4332; text-align: left; background-color: #EBF4ED; padding: 10px; }
          .report-meta { font-size: 9.5pt; color: #406050; background-color: #F7FAF8; padding: 6px; }
          th { background-color: #2D6A4F; color: #FFFFFF; font-weight: bold; font-size: 10pt; text-align: center; border: 1px solid #1B4332; padding: 8px 6px; }
          td { font-size: 9.5pt; border: 1px solid #D2E2D4; padding: 6px; vertical-align: middle; }
          .zebra { background-color: #F8FBF8; }
          .status-tam { background-color: #D8F3DC; color: #1B4332; font-weight: bold; text-align: center; }
          .status-kismi { background-color: #FEF3C7; color: #92400E; font-weight: bold; text-align: center; }
          .status-yok { background-color: #F1F5F9; color: #64748B; text-align: center; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="14" class="report-title">TEZ ARAŞTIRMASI SEANS VE KATILIMCI PROTOKOL RAPORU</td>
          </tr>
          <tr>
            <td colspan="14" class="report-meta">
              <strong>İncelenen Tarih:</strong> ${reportDateStr} | 
              <strong>Rapor Oluşturma Zamanı:</strong> ${nowStr} | 
              <strong>Toplam Katılımcı Havuzu:</strong> ${participants.length} Katılımcı
            </td>
          </tr>
          <tr><td colspan="14" style="height:8px;border:none;"></td></tr>
          <thead>
            <tr>
              <th>Sıra</th>
              <th>Katılımcı Kodu</th>
              <th>Katılımcı Adı Soyadı</th>
              <th>Deney Grubu</th>
              <th>Tarih</th>
              <th>1. Oturum Durumu</th>
              <th>1. Oturum Süresi</th>
              <th>1. Oturum Saati</th>
              <th>2. Oturum Durumu</th>
              <th>2. Oturum Süresi</th>
              <th>2. Oturum Saati</th>
              <th>Toplam Süre</th>
              <th>Günlük Sonuç</th>
              <th>Araştırmacı Notu</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF' + excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const fileName = `tez_seans_raporu_${isSingleDate ? selectedDate : 'tum_tarihler'}.xls`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 150);
  };

  // ================= 2. RESMİ AKADEMİK PDF RAPORU ÇIKARMA (A4 YAZDIR / PDF KAYDET) =================
  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank', 'width=1050,height=900');
    if (!printWindow) {
      alert('Yazdırma penceresi açılamadı. Lütfen tarayıcınızın pop-up (açılır pencere) engellemesini kaldırınız.');
      return;
    }

    const reportDateStr = formatTurkishDate(selectedDate);
    const nowStr = new Date().toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' });

    let rowsHtml = '';
    let rowIndex = 1;

    const formatSecsReadable = (secs: number) => {
      if (!secs || secs === 0) return '-';
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return `${m} dk ${s > 0 ? s + ' sn' : ''}`;
    };

    let doneCount1 = 0;
    let doneCount2 = 0;
    let fullCompleted = 0;

    participants.forEach((p) => {
      const s = getSession(p.id, selectedDate);
      const totalSec = s.session1Duration + s.session2Duration;
      if (s.session1Completed) doneCount1++;
      if (s.session2Completed) doneCount2++;
      if (s.session1Completed && s.session2Completed) fullCompleted++;

      const isComplete = s.session1Completed && s.session2Completed;
      const isPartial =
        !isComplete &&
        (s.session1Completed || s.session2Completed || s.session1Duration > 0 || s.session2Duration > 0);

      const p1Status = s.session1Completed
        ? `<span class="badge badge-success">%100 Tamamlandı (${s.session1CompletedAt || 'Saat Yok'})</span>`
        : s.session1Duration > 0
        ? `<span class="badge badge-warning">%${Math.round((s.session1Duration / 720) * 100)} Kısmi (${formatSecsReadable(s.session1Duration)})</span>`
        : `<span class="badge badge-gray">%0 Yapılmadı</span>`;

      const p2Status = s.session2Completed
        ? `<span class="badge badge-success">%100 Tamamlandı (${s.session2CompletedAt || 'Saat Yok'})</span>`
        : s.session2Duration > 0
        ? `<span class="badge badge-warning">%${Math.round((s.session2Duration / 720) * 100)} Kısmi (${formatSecsReadable(s.session2Duration)})</span>`
        : `<span class="badge badge-gray">%0 Yapılmadı</span>`;

      const resultBadge = isComplete
        ? '<span class="badge badge-success">TAM UYUM (2/2)</span>'
        : isPartial
        ? '<span class="badge badge-warning">KISMİ (1/2)</span>'
        : '<span class="badge badge-gray">YAPILMADI (0/2)</span>';

      rowsHtml += `
        <tr>
          <td style="text-align:center;">${rowIndex++}</td>
          <td style="font-weight:bold;font-family:monospace;text-align:center;">${p.id}</td>
          <td><strong>${p.name}</strong></td>
          <td style="text-align:center;">${p.group === 'dikkat' ? 'Dikkat Eğitimi' : 'Kas Gevşeme'}</td>
          <td>${p1Status}</td>
          <td>${p2Status}</td>
          <td style="text-align:center;font-family:monospace;font-weight:bold;">${formatSecsReadable(totalSec)}</td>
          <td style="text-align:center;">${resultBadge}</td>
        </tr>
      `;
    });

    const p1Percent = participants.length ? Math.round((doneCount1 / participants.length) * 100) : 0;
    const p2Percent = participants.length ? Math.round((doneCount2 / participants.length) * 100) : 0;
    const fullPercent = participants.length ? Math.round((fullCompleted / participants.length) * 100) : 0;

    const printableHtml = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="utf-8">
        <title>Tez Araştırması Günlük Protokol Raporu - ${selectedDate}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 14mm 12mm;
          }
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            color: #1a2e22;
            margin: 0;
            padding: 0;
            font-size: 9pt;
            line-height: 1.35;
          }
          .header-table {
            width: 100%;
            border-bottom: 2px solid #2d6a4f;
            padding-bottom: 10px;
            margin-bottom: 12px;
            text-align: center;
          }
          .university-title {
            font-size: 13pt;
            font-weight: 800;
            color: #1b4332;
            letter-spacing: 0.5px;
            margin: 0;
          }
          .institute-title {
            font-size: 9.5pt;
            font-weight: 600;
            color: #406050;
            margin: 2px 0 0 0;
          }
          .report-heading {
            font-size: 11pt;
            font-weight: 800;
            color: #2d6a4f;
            margin: 6px 0 0 0;
            text-transform: uppercase;
            letter-spacing: 0.8px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin-bottom: 14px;
          }
          .summary-card {
            border: 1px solid #d2e2d4;
            background: #f7faf8;
            border-radius: 8px;
            padding: 7px 10px;
            text-align: center;
          }
          .summary-card .label {
            font-size: 7.5pt;
            text-transform: uppercase;
            color: #557060;
            font-weight: 700;
            display: block;
            margin-bottom: 2px;
          }
          .summary-card .val {
            font-size: 11pt;
            font-weight: 800;
            color: #1b4332;
            font-family: monospace;
          }
          .summary-card .sub {
            font-size: 7.5pt;
            color: #2d6a4f;
            font-weight: 600;
          }
          table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
          }
          table.data-table th {
            background-color: #2d6a4f;
            color: #ffffff;
            font-weight: 700;
            font-size: 8pt;
            padding: 6px 4px;
            border: 1px solid #1b4332;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          table.data-table td {
            border: 1px solid #d8e5db;
            padding: 5px 6px;
            font-size: 8pt;
            vertical-align: middle;
          }
          table.data-table tr:nth-child(even) {
            background-color: #f8fbf9;
          }
          .badge {
            display: inline-block;
            padding: 2px 5px;
            border-radius: 4px;
            font-size: 7.5pt;
            font-weight: 700;
            white-space: nowrap;
          }
          .badge-success { background: #d8f3dc; color: #1b4332; border: 1px solid #b7e4c7; }
          .badge-warning { background: #fef3c7; color: #92400E; border: 1px solid #fde68a; }
          .badge-gray { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }
          .signatures {
            margin-top: 20px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
          }
          .sig-box {
            width: 45%;
            border-top: 1px dashed #8ba592;
            padding-top: 8px;
            text-align: center;
            font-size: 8.5pt;
            color: #2c4235;
          }
          .sig-box strong {
            display: block;
            margin-bottom: 22px;
          }
          .footer-note {
            margin-top: 15px;
            font-size: 7.5pt;
            color: #728c7d;
            text-align: center;
            border-top: 1px solid #e2ece5;
            padding-top: 6px;
          }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header-table">
          <h1 class="university-title">T.C. ÜNİVERSİTESİ LİSANSÜSTÜ EĞİTİM ENSTİTÜSÜ</h1>
          <h2 class="institute-title">DİKKAT EĞİTİMİ VE PROGRESİF KAS GEVŞEME EGZERSİZLERİ TEZ PROTOKOLÜ</h2>
          <h3 class="report-heading">GÜNLÜK SEANS VE KATILIMCI PROTOKOL RAPORU</h3>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <span class="label">Rapor Tarihi</span>
            <div class="val" style="font-size:10pt;">${selectedDate}</div>
            <span class="sub">${reportDateStr}</span>
          </div>
          <div class="summary-card">
            <span class="label">Kayıtlı Katılımcı</span>
            <div class="val">${participants.length} Kişi</div>
            <span class="sub">${participants.filter((p) => p.group === 'dikkat').length} Dikkat / ${participants.filter((p) => p.group === 'kas_gevseme').length} Gevşeme</span>
          </div>
          <div class="summary-card">
            <span class="label">1. Oturum Uyum</span>
            <div class="val">${doneCount1} / ${participants.length}</div>
            <span class="sub">%${p1Percent} Tamamlandı</span>
          </div>
          <div class="summary-card">
            <span class="label">2. Oturum Uyum</span>
            <div class="val">${doneCount2} / ${participants.length}</div>
            <span class="sub">%${p2Percent} Tamamlandı</span>
          </div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width:28px;">No</th>
              <th style="width:55px;">Kod</th>
              <th>Katılımcı Adı Soyadı</th>
              <th style="width:85px;">Grup</th>
              <th>1. Oturum (12 dk)</th>
              <th>2. Oturum (12 dk)</th>
              <th style="width:70px;">Toplam</th>
              <th style="width:90px;">Sonuç</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="signatures">
          <div class="sig-box">
            <strong>Raporu Hazırlayan Araştırmacı</strong>
            <span>İmza: .................................................</span>
          </div>
          <div class="sig-box">
            <strong>Tez Danışmanı / Yetkili</strong>
            <span>İmza: .................................................</span>
          </div>
        </div>

        <div class="footer-note">
          Bu rapor ${nowStr} tarihinde sistem tarafından üretilmiştir. Tarayıcı yazdırma ekranında <strong>"PDF Olarak Kaydet"</strong> seçeneği ile doğrudan PDF dosyası olarak indirebilirsiniz.
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printableHtml);
    printWindow.document.close();
  };

  const filteredParticipants = participants.filter((p) => {
    if (groupFilter !== 'all' && p.group !== groupFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
    }
    return true;
  });

  if (!isMounted) return null;

  // ================= 1. YÖNETİCİ ŞİFRE GİRİŞ EKRANI =================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#ebf4ec] via-[#f7faf7] to-[#e6f0e7] flex flex-col items-center justify-center p-4 text-slate-800">
        <div className="w-full max-w-md bg-white border border-emerald-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-950/5 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-800 mx-auto flex items-center justify-center shadow-xs">
              <Lock className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-800">
              <Leaf className="w-3 h-3 text-emerald-600" />
              <span>Tez Araştırması Yönetimi</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Yönetici Girişi
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Katılımcı seans takip çizelgesini görüntülemek ve katılımcı linklerini yönetmek için şifrenizi giriniz.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Yönetici Şifresi
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError('');
                }}
                placeholder="Şifreyi giriniz (varsayılan: 1234)"
                className="w-full bg-[#f8fbf9] border border-emerald-200/90 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-3 text-sm outline-none transition-all shadow-xs"
                autoFocus
              />
              {passwordError && (
                <p className="mt-2 text-xs text-rose-600 flex items-center gap-1.5 font-medium bg-rose-50 p-2 rounded-xl border border-rose-100">
                  <Info className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                  {passwordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-emerald-950/10 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <span>Giriş Yap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-500">
              Geliştirme aşaması şifresi: <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">1234</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ================= 2. TAM DONANIMLI YÖNETİCİ PANELİ =================
  const totalDikkat = participants.filter((p) => p.group === 'dikkat').length;
  const totalKas = participants.filter((p) => p.group === 'kas_gevseme').length;

  // Seçili gün istatistikleri
  let selectedDateSession1Done = 0;
  let selectedDateSession2Done = 0;
  participants.forEach((p) => {
    const s = getSession(p.id, selectedDate);
    if (s.session1Completed) selectedDateSession1Done++;
    if (s.session2Completed) selectedDateSession2Done++;
  });

  return (
    <div className="min-h-screen bg-[#f4f7f4] text-slate-800 flex flex-col">
      {/* Top Responsive Navbar */}
      <header className="border-b border-emerald-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-6 md:px-8 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold shadow-xs shrink-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight truncate">
                Yönetim Paneli
              </h1>
              <span className="text-[9px] sm:text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
                Yetkili
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 truncate hidden sm:block">
              80 Katılımcı Seans Takibi, Tamamlanma Yüzdeleri ve Raporlama
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => handleExportExcel('allDates')}
            className="flex items-center gap-1 sm:gap-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all shadow-xs"
            title="Tüm Tarihlerin Düzenli Excel (.xls) Tablosunu İndir"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span className="hidden md:inline">Tüm Tarihlerin Exceli (.xls)</span>
            <span className="md:hidden">Tüm Excel</span>
          </button>

          <a
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-900 bg-white hover:bg-emerald-50 border border-emerald-200 p-2 sm:px-3 sm:py-2 rounded-xl transition-all shadow-2xs"
            title="Katılımcı Arayüzünü Aç"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Kullanıcı Görünümü</span>
          </a>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-rose-600 bg-white hover:bg-rose-50 border border-emerald-200 hover:border-rose-200 p-2 sm:px-3 sm:py-2 rounded-xl transition-all shadow-2xs"
            title="Çıkış Yap"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </header>

      {/* Main Responsive Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 md:p-8 space-y-4 sm:space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5 sm:mb-1">
              Kayıtlı Katılımcı
            </span>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono">{participants.length}</span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium">kişi</span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-emerald-700 font-bold mt-0.5 sm:mt-1 block truncate">
              {totalDikkat} Dikkat / {totalKas} Kas
            </span>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5 sm:mb-1">
              İncelenen Tarih
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
              {formatTurkishDate(selectedDate)}
            </span>
            <span className="text-[10px] sm:text-[11px] text-emerald-800 font-mono font-bold mt-0.5 sm:mt-1 block">
              {selectedDate}
            </span>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5 sm:mb-1">
              1. Oturum Tamamlanma
            </span>
            <div className="flex items-baseline gap-1 sm:gap-2">
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-700 font-mono">
                {selectedDateSession1Done} / {participants.length}
              </span>
              <span className="text-[10px] sm:text-xs text-emerald-800 font-bold">
                (%{participants.length ? Math.round((selectedDateSession1Done / participants.length) * 100) : 0})
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 sm:mt-1 block font-medium truncate">
              1. Seansı Bitirenler
            </span>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5 sm:mb-1">
              2. Oturum Tamamlanma
            </span>
            <div className="flex items-baseline gap-1 sm:gap-2">
              <span className="text-xl sm:text-2xl font-extrabold text-teal-800 font-mono">
                {selectedDateSession2Done} / {participants.length}
              </span>
              <span className="text-[10px] sm:text-xs text-teal-900 font-bold">
                (%{participants.length ? Math.round((selectedDateSession2Done / participants.length) * 100) : 0})
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 sm:mt-1 block font-medium truncate">
              2. Seansı Bitirenler
            </span>
          </div>
        </div>

        {/* Tab Selector & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border-b border-emerald-200 pb-3 sm:pb-4">
          {/* Main Tabs Responsive */}
          <div className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center gap-1.5 bg-emerald-100/70 p-1 rounded-2xl border border-emerald-200/70">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'sessions'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-emerald-900 hover:bg-emerald-200/50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span className="sm:hidden">Seans Takibi</span>
              <span className="hidden sm:inline">Günlük Seans Takibi</span>
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'participants'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-emerald-900 hover:bg-emerald-200/50'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span className="sm:hidden">Katılımcılar ({participants.length})</span>
              <span className="hidden sm:inline">Katılımcı Yönetimi & Linkler ({participants.length})</span>
            </button>
          </div>

          {/* Right Action: EXCEL & PDF EXPORT BUTTONS */}
          <div className="w-full sm:w-auto flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {activeTab === 'sessions' && (
              <>
                {/* DÜZENLİ EXCEL İNDİR BUTONU */}
                <button
                  onClick={() => handleExportExcel('selectedDate')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 px-3.5 py-2.5 rounded-xl transition-all shadow-xs"
                  title="Seçili günün renkli, düzenli ve başlıklı Excel tablosunu indir"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>Excel (.xls) İndir</span>
                </button>

                {/* RESMİ PDF RAPORU ÇIKAR BUTONU */}
                <button
                  onClick={handlePrintPDF}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 hover:from-emerald-700 hover:to-teal-700 text-white px-3.5 py-2.5 rounded-xl transition-all shadow-xs"
                  title="Resmi A4 formatında PDF seans raporunu görüntüle ve yazdır"
                >
                  <FileText className="w-4 h-4 text-emerald-300" />
                  <span>PDF Raporu Çıkar</span>
                </button>
              </>
            )}

            {activeTab === 'participants' && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs font-bold bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white px-3.5 py-2.5 rounded-xl shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Katılımcı Ekle</span>
              </button>
            )}
          </div>
        </div>

        {/* ================= TAB 1: GÜNLÜK SEANS TAKİBİ ================= */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            {/* Responsive Date & Search Bar */}
            <div className="p-3 sm:p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
              {/* Date pickers */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 shrink-0">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <span className="hidden xs:inline">Tarih:</span>
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-[#f8fbf9] border border-emerald-200 text-slate-900 text-xs rounded-xl px-2.5 py-1.5 outline-none focus:border-emerald-600 font-semibold"
                />
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setDateOffset(0)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                      selectedDate === getTodayKey()
                        ? 'bg-emerald-700 text-white border-emerald-700 font-bold shadow-2xs'
                        : 'bg-[#f8fbf9] text-slate-600 border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    Bugün
                  </button>
                  <button
                    onClick={() => setDateOffset(-1)}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-[#f8fbf9] text-slate-600 border border-emerald-200 hover:bg-emerald-50 font-medium"
                  >
                    Dün
                  </button>
                </div>
              </div>

              {/* Group filter & search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <div className="relative w-full sm:w-52">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ID veya İsim Ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#f8fbf9] border border-emerald-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-600"
                  />
                </div>
                <div className="flex items-center gap-1">
                  {(['all', 'dikkat', 'kas_gevseme'] as const).map((grp) => (
                    <button
                      key={grp}
                      onClick={() => setGroupFilter(grp)}
                      className={`flex-1 sm:flex-none text-xs px-2.5 py-1.5 rounded-xl transition-all ${
                        groupFilter === grp
                          ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                          : 'bg-[#f8fbf9] text-slate-600 border border-emerald-200 hover:bg-emerald-50 font-medium'
                      }`}
                    >
                      {grp === 'all' && 'Tümü'}
                      {grp === 'dikkat' && 'Dikkat'}
                      {grp === 'kas_gevseme' && 'Gevşeme'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ================= 1. MOBILE CARDS VIEW (Ekran < 768px) ================= */}
            <div className="block md:hidden space-y-3">
              {filteredParticipants.map((p) => {
                const session = getSession(p.id, selectedDate);
                const totalSec = session.session1Duration + session.session2Duration;
                const isComplete = session.session1Completed && session.session2Completed;

                const p1Percent = Math.min(
                  100,
                  session.session1Completed ? 100 : Math.round((session.session1Duration / 720) * 100)
                );
                const p2Percent = Math.min(
                  100,
                  session.session2Completed ? 100 : Math.round((session.session2Duration / 720) * 100)
                );

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-white border border-emerald-200/90 shadow-xs space-y-3"
                  >
                    {/* Top Row: Participant & Group */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono font-extrabold text-slate-900 text-sm block">
                          {p.id}
                        </span>
                        <span className="text-xs text-slate-600 font-semibold">{p.name}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          p.group === 'dikkat'
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                            : 'bg-purple-100 border-purple-300 text-purple-900'
                        }`}
                      >
                        {p.group === 'dikkat' ? 'Dikkat Eğitimi' : 'Kas Gevşeme'}
                      </span>
                    </div>

                    {/* Sessions Progress in Mobile Card */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                      {/* Session 1 */}
                      <div className="p-2 rounded-xl bg-[#f8fbf9] border border-emerald-100 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 block">1. Oturum</span>
                        {session.session1Completed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>%100 Tam</span>
                          </span>
                        ) : session.session1Duration > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-800">
                            <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>%{p1Percent} Kısmi</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                            <XCircle className="w-3 h-3 shrink-0" />
                            <span>%0 Yapılmadı</span>
                          </span>
                        )}
                        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${p1Percent}%` }}
                            className={`h-full ${
                              session.session1Completed
                                ? 'bg-emerald-600'
                                : session.session1Duration > 0
                                ? 'bg-amber-500'
                                : 'bg-transparent'
                            }`}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-slate-600 block">
                          {formatTime(session.session1Duration)} / 12:00
                        </span>
                      </div>

                      {/* Session 2 */}
                      <div className="p-2 rounded-xl bg-[#f8fbf9] border border-emerald-100 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 block">2. Oturum</span>
                        {session.session2Completed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>%100 Tam</span>
                          </span>
                        ) : session.session2Duration > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-800">
                            <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>%{p2Percent} Kısmi</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                            <XCircle className="w-3 h-3 shrink-0" />
                            <span>%0 Yapılmadı</span>
                          </span>
                        )}
                        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${p2Percent}%` }}
                            className={`h-full ${
                              session.session2Completed
                                ? 'bg-emerald-600'
                                : session.session2Duration > 0
                                ? 'bg-amber-500'
                                : 'bg-transparent'
                            }`}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-slate-600 block">
                          {formatTime(session.session2Duration)} / 12:00
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row: Total Duration & Status */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-slate-500 text-[11px]">
                        Toplam: <strong className="font-mono text-slate-800">{Math.floor(totalSec / 60)} dk {totalSec % 60} sn</strong>
                      </span>
                      {isComplete ? (
                        <span className="text-[10px] font-extrabold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                          TAM (2/2)
                        </span>
                      ) : session.session1Completed || session.session2Completed ? (
                        <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                          KISMİ (1/2)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                          BEKLİYOR (0/2)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ================= 2. DESKTOP DETAILED TABLE VIEW (Ekran >= 768px) ================= */}
            <div className="hidden md:block rounded-2xl bg-white border border-emerald-200/80 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-emerald-200/80 bg-[#f0f7f2] text-emerald-950 font-extrabold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Katılımcı</th>
                      <th className="py-3 px-4">Grup</th>
                      <th className="py-3 px-4 min-w-[210px]">1. Oturum (Yüzde & Süre)</th>
                      <th className="py-3 px-4 min-w-[210px]">2. Oturum (Yüzde & Süre)</th>
                      <th className="py-3 px-4 text-center">Toplam Süre</th>
                      <th className="py-3 px-4 text-right">Günün Durumu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100/70 font-medium">
                    {filteredParticipants.map((p) => {
                      const session = getSession(p.id, selectedDate);
                      const totalSec = session.session1Duration + session.session2Duration;
                      const isComplete = session.session1Completed && session.session2Completed;

                      const p1Percent = Math.min(
                        100,
                        session.session1Completed ? 100 : Math.round((session.session1Duration / 720) * 100)
                      );
                      const p2Percent = Math.min(
                        100,
                        session.session2Completed ? 100 : Math.round((session.session2Duration / 720) * 100)
                      );

                      return (
                        <tr key={p.id} className="hover:bg-[#f6faf7] transition-colors">
                          {/* Katılımcı Bilgisi */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-slate-900 block">
                              {p.id}
                            </span>
                            <span className="text-[11px] text-slate-600">{p.name}</span>
                          </td>

                          {/* Deney Grubu */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                p.group === 'dikkat'
                                  ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                                  : 'bg-purple-100 border-purple-300 text-purple-900'
                              }`}
                            >
                              {p.group === 'dikkat' ? 'Dikkat Eğitimi' : 'Kas Gevşeme'}
                            </span>
                          </td>

                          {/* 1. Oturum Detayı */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                {session.session1Completed ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>%100 Tamamlandı</span>
                                  </span>
                                ) : session.session1Duration > 0 ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>%{p1Percent} Kısmi</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                                    <XCircle className="w-3 h-3" />
                                    <span>%0 Yapılmadı</span>
                                  </span>
                                )}

                                <span className="text-[11px] font-mono text-slate-700 font-semibold">
                                  {formatTime(session.session1Duration)} / 12:00
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                                <div
                                  style={{ width: `${p1Percent}%` }}
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    session.session1Completed
                                      ? 'bg-emerald-600'
                                      : session.session1Duration > 0
                                      ? 'bg-amber-500'
                                      : 'bg-slate-300'
                                  }`}
                                />
                              </div>

                              {session.session1CompletedAt && (
                                <span className="text-[10px] text-slate-500 block">
                                  Tamamlanma Saati: <strong className="text-slate-800">{session.session1CompletedAt}</strong>
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 2. Oturum Detayı */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                {session.session2Completed ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>%100 Tamamlandı</span>
                                  </span>
                                ) : session.session2Duration > 0 ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>%{p2Percent} Kısmi</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                                    <XCircle className="w-3 h-3" />
                                    <span>%0 Yapılmadı</span>
                                  </span>
                                )}

                                <span className="text-[11px] font-mono text-slate-700 font-semibold">
                                  {formatTime(session.session2Duration)} / 12:00
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                                <div
                                  style={{ width: `${p2Percent}%` }}
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    session.session2Completed
                                      ? 'bg-emerald-600'
                                      : session.session2Duration > 0
                                      ? 'bg-amber-500'
                                      : 'bg-slate-300'
                                  }`}
                                />
                              </div>

                              {session.session2CompletedAt && (
                                <span className="text-[10px] text-slate-500 block">
                                  Tamamlanma Saati: <strong className="text-slate-800">{session.session2CompletedAt}</strong>
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Toplam Süre */}
                          <td className="py-3.5 px-4 text-center font-mono text-slate-800 font-semibold">
                            {Math.floor(totalSec / 60)} dk {totalSec % 60} sn
                          </td>

                          {/* Günlük Durum Rozeti */}
                          <td className="py-3.5 px-4 text-right">
                            {isComplete ? (
                              <span className="text-[10px] font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full">
                                %100 TAM (2/2)
                              </span>
                            ) : session.session1Completed || session.session2Completed ? (
                              <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full">
                                KISMİ (1/2)
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                                BEKLİYOR (0/2)
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: KATILIMCI YÖNETİMİ & SİHİRLİ LİNKLER ================= */}
        {activeTab === 'participants' && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="p-3 sm:p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
              <div className="relative flex-1 md:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Katılımcı ID veya Adı Ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#f8fbf9] border border-emerald-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-500 mr-1 shrink-0" />
                {(['all', 'dikkat', 'kas_gevseme'] as const).map((grp) => (
                  <button
                    key={grp}
                    onClick={() => setGroupFilter(grp)}
                    className={`flex-1 sm:flex-none text-xs px-2.5 sm:px-3 py-1.5 rounded-xl font-bold transition-all ${
                      groupFilter === grp
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-[#f8fbf9] text-slate-600 border border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    {grp === 'all' && `Tümü (${participants.length})`}
                    {grp === 'dikkat' && `Dikkat (${totalDikkat})`}
                    {grp === 'kas_gevseme' && `Gevşeme (${totalKas})`}
                  </button>
                ))}
              </div>
            </div>

            {/* ================= 1. MOBILE CARDS PARTICIPANTS VIEW (Ekran < 768px) ================= */}
            <div className="block md:hidden space-y-3">
              {filteredParticipants.map((p) => {
                const isCopied = copiedId === p.id;

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-white border border-emerald-200/90 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-slate-900 text-base">
                            {p.id}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                              p.group === 'dikkat'
                                ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                                : 'bg-purple-100 border-purple-300 text-purple-900'
                            }`}
                          >
                            {p.group === 'dikkat' ? 'Dikkat Eğitimi' : 'Kas Gevşeme'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 mt-0.5">{p.name}</h4>
                        {p.notes && (
                          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                            Not: {p.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingParticipant(p)}
                          className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all"
                          title="Düzenle"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-2 rounded-xl bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-all"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Full Width Mobile Magic Link Button */}
                    <button
                      onClick={() => handleCopyLink(p)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-2xs ${
                        isCopied
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>Link Kopyalandı! (WhatsApp/SMS'e Yapıştır)</span>
                        </>
                      ) : (
                        <>
                          <Link2 className="w-4 h-4 text-emerald-700" />
                          <span>Giriş Linkini Kopyala</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* ================= 2. DESKTOP DETAILED PARTICIPANTS TABLE (Ekran >= 768px) ================= */}
            <div className="hidden md:block rounded-2xl bg-white border border-emerald-200/80 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-emerald-200/80 bg-[#f0f7f2] text-emerald-950 font-extrabold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Katılımcı Adı</th>
                      <th className="py-3 px-4">Grup</th>
                      <th className="py-3 px-4">Sihirli Bağlantı (Magic Link)</th>
                      <th className="py-3 px-4">Notlar</th>
                      <th className="py-3 px-4 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100/70 font-medium">
                    {filteredParticipants.map((p) => {
                      const isCopied = copiedId === p.id;

                      return (
                        <tr key={p.id} className="hover:bg-[#f6faf7] transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {p.id}
                          </td>
                          <td className="py-3 px-4 text-slate-900 font-bold">
                            {p.name}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                p.group === 'dikkat'
                                  ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                                  : 'bg-purple-100 border-purple-300 text-purple-900'
                              }`}
                            >
                              {p.group === 'dikkat' ? 'Dikkat Eğitimi' : 'Kas Gevşeme'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleCopyLink(p)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                                isCopied
                                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
                              }`}
                              title="WhatsApp veya SMS ile göndermek için kopyala"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-white" />
                                  <span>Link Kopyalandı!</span>
                                </>
                              ) : (
                                <>
                                  <Link2 className="w-3.5 h-3.5" />
                                  <span>Linkini Kopyala</span>
                                </>
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate font-medium">
                            {p.notes || '-'}
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => setEditingParticipant(p)}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all"
                              title="Düzenle"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-all"
                              title="Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL 1: YENİ KATILIMCI EKLE ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-emerald-200 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl text-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-700" />
                <span>Yeni Katılımcı Tanımla</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold p-1"
              >
                Kapat
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Katılımcı Kodu / ID (Örn: DE-11 veya KG-11)
                </label>
                <input
                  type="text"
                  required
                  placeholder="DE-11"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                  className="w-full bg-[#f8fbf9] border border-emerald-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600 uppercase font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Adı Soyadı
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Elif Yılmaz"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#f8fbf9] border border-emerald-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deney Grubu
                </label>
                <select
                  value={formData.group}
                  onChange={(e) =>
                    setFormData({ ...formData, group: e.target.value as 'dikkat' | 'kas_gevseme' })
                  }
                  className="w-full bg-[#f8fbf9] border border-emerald-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600 font-medium"
                >
                  <option value="dikkat">Dikkat Eğitimi Grubu</option>
                  <option value="kas_gevseme">Progresif Kas Gevşeme Grubu</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notlar / Açıklama (İsteğe bağlı)
                </label>
                <textarea
                  rows={2}
                  placeholder="Katılımcı hakkında araştırmacı notu..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#f8fbf9] border border-emerald-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 text-center"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 text-white font-bold text-xs shadow-xs hover:opacity-95 text-center"
                >
                  Katılımcıyı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: KATILIMCI DÜZENLE ================= */}
      {editingParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-emerald-200 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl text-slate-800 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-700" />
                <span>Katılımcıyı Düzenle ({editingParticipant.id})</span>
              </h3>
              <button
                onClick={() => setEditingParticipant(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold p-1"
              >
                Kapat
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Adı Soyadı
                </label>
                <input
                  type="text"
                  required
                  value={editingParticipant.name}
                  onChange={(e) =>
                    setEditingParticipant({ ...editingParticipant, name: e.target.value })
                  }
                  className="w-full bg-[#f8fbf9] border border-emerald-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deney Grubu
                </label>
                <select
                  value={editingParticipant.group}
                  onChange={(e) =>
                    setEditingParticipant({
                      ...editingParticipant,
                      group: e.target.value as 'dikkat' | 'kas_gevseme',
                    })
                  }
                  className="w-full bg-[#f8fbf9] border border-emerald-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600 font-medium"
                >
                  <option value="dikkat">Dikkat Eğitimi Grubu</option>
                  <option value="kas_gevseme">Progresif Kas Gevşeme Grubu</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notlar
                </label>
                <textarea
                  rows={2}
                  value={editingParticipant.notes || ''}
                  onChange={(e) =>
                    setEditingParticipant({ ...editingParticipant, notes: e.target.value })
                  }
                  className="w-full bg-[#f8fbf9] border border-emerald-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingParticipant(null)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 text-center"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 text-white font-bold text-xs shadow-xs hover:opacity-95 text-center"
                >
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
