'use client';

import React, { useState } from 'react';
import { Participant } from '@/types';
import { getTodayKey } from '@/lib/mockData';
import { getAllSessions, getParticipants } from '@/lib/storage';
import {
  X,
  Download,
  Users,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectParticipant?: (id: string) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  onSelectParticipant,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<'all' | 'dikkat' | 'kas_gevseme'>('all');

  if (!isOpen) return null;

  const participants: Participant[] = getParticipants();
  const sessions = getAllSessions();
  const today = getTodayKey();

  const formatSecsReadable = (secs: number) => {
    if (!secs || secs === 0) return '-';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m} dk ${s > 0 ? s + ' sn' : ''}`;
  };

  const rows = participants.map((p) => {
    const key = `${p.id}_${today}`;
    const s = sessions[key];
    return {
      participant: p,
      session1Done: s ? s.session1Completed : false,
      session1Time: s?.session1CompletedAt || '-',
      session1Duration: s?.session1Duration || 0,
      session2Done: s ? s.session2Completed : false,
      session2Time: s?.session2CompletedAt || '-',
      session2Duration: s?.session2Duration || 0,
      totalDuration: (s?.session1Duration || 0) + (s?.session2Duration || 0),
    };
  });

  const filteredRows = rows.filter((r) => {
    if (filterGroup !== 'all' && r.participant.group !== filterGroup) return false;
    if (searchTerm && !r.participant.id.toLowerCase().includes(searchTerm.toLowerCase()) && !r.participant.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  // ================= 1. DÜZENLİ VE BİÇİMLENDİRİLMİŞ EXCEL ÇIKTISI (.xls) =================
  const handleExportExcel = () => {
    const nowStr = new Date().toLocaleString('tr-TR');
    let tableRowsHtml = '';
    let rowIndex = 1;

    rows.forEach((r) => {
      const isComplete = r.session1Done && r.session2Done;
      const isPartial = !isComplete && (r.session1Done || r.session2Done || r.session1Duration > 0 || r.session2Duration > 0);

      const p1Status = r.session1Done
        ? 'Tamamlandı (%100)'
        : r.session1Duration > 0
        ? `Kısmi (%${Math.round((r.session1Duration / 720) * 100)})`
        : 'Yapılmadı (%0)';

      const p2Status = r.session2Done
        ? 'Tamamlandı (%100)'
        : r.session2Duration > 0
        ? `Kısmi (%${Math.round((r.session2Duration / 720) * 100)})`
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
          <td style="font-weight:bold;text-align:center;mso-number-format:'\\@';">${r.participant.id}</td>
          <td style="font-weight:bold;">${r.participant.name}</td>
          <td style="text-align:center;">${r.participant.group === 'dikkat' ? 'Dikkat Eğitimi' : 'Kas Gevşeme'}</td>
          <td style="text-align:center;">${today}</td>
          <td style="text-align:center;">${p1Status}</td>
          <td style="text-align:center;">${formatSecsReadable(r.session1Duration)}</td>
          <td style="text-align:center;">${r.session1Time}</td>
          <td style="text-align:center;">${p2Status}</td>
          <td style="text-align:center;">${formatSecsReadable(r.session2Duration)}</td>
          <td style="text-align:center;">${r.session2Time}</td>
          <td style="font-weight:bold;text-align:center;">${formatSecsReadable(r.totalDuration)}</td>
          <td class="${statusClass}">${dailyResult}</td>
          <td>${r.participant.notes || '-'}</td>
        </tr>
      `;
    });

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Günlük Seans Raporu</x:Name>
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
            <td colspan="14" class="report-title">TEZ ARAŞTIRMASI GÜNLÜK SEANS VE PROTOKOL RAPORU</td>
          </tr>
          <tr>
            <td colspan="14" class="report-meta">
              <strong>Tarih:</strong> ${today} | 
              <strong>Rapor Çıkarılma Zamanı:</strong> ${nowStr} | 
              <strong>Toplam Katılımcı:</strong> ${participants.length} Katılımcı
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
    const fileName = `tez_seans_raporu_${today}.xls`;
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

  // ================= 2. RESMİ AKADEMİK PDF RAPORU (A4 YAZDIR / PDF) =================
  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank', 'width=1050,height=900');
    if (!printWindow) {
      alert('Yazdırma penceresi açılamadı. Lütfen tarayıcınızın pop-up engellemesini kaldırınız.');
      return;
    }

    const nowStr = new Date().toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' });
    let rowsHtml = '';
    let rowIndex = 1;
    let doneCount1 = 0;
    let doneCount2 = 0;

    rows.forEach((r) => {
      if (r.session1Done) doneCount1++;
      if (r.session2Done) doneCount2++;
      const isComplete = r.session1Done && r.session2Done;
      const isPartial = !isComplete && (r.session1Done || r.session2Done || r.session1Duration > 0 || r.session2Duration > 0);

      const p1Status = r.session1Done
        ? `<span class="badge badge-success">%100 Tamamlandı (${r.session1Time})</span>`
        : r.session1Duration > 0
        ? `<span class="badge badge-warning">%${Math.round((r.session1Duration / 720) * 100)} Kısmi (${formatSecsReadable(r.session1Duration)})</span>`
        : `<span class="badge badge-gray">%0 Yapılmadı</span>`;

      const p2Status = r.session2Done
        ? `<span class="badge badge-success">%100 Tamamlandı (${r.session2Time})</span>`
        : r.session2Duration > 0
        ? `<span class="badge badge-warning">%${Math.round((r.session2Duration / 720) * 100)} Kısmi (${formatSecsReadable(r.session2Duration)})</span>`
        : `<span class="badge badge-gray">%0 Yapılmadı</span>`;

      const resultBadge = isComplete
        ? '<span class="badge badge-success">TAM UYUM (2/2)</span>'
        : isPartial
        ? '<span class="badge badge-warning">KISMİ (1/2)</span>'
        : '<span class="badge badge-gray">YAPILMADI (0/2)</span>';

      rowsHtml += `
        <tr>
          <td style="text-align:center;">${rowIndex++}</td>
          <td style="font-weight:bold;font-family:monospace;text-align:center;">${r.participant.id}</td>
          <td><strong>${r.participant.name}</strong></td>
          <td style="text-align:center;">${r.participant.group === 'dikkat' ? 'Dikkat Eğitimi' : 'Kas Gevşeme'}</td>
          <td>${p1Status}</td>
          <td>${p2Status}</td>
          <td style="text-align:center;font-family:monospace;font-weight:bold;">${formatSecsReadable(r.totalDuration)}</td>
          <td style="text-align:center;">${resultBadge}</td>
        </tr>
      `;
    });

    const printableHtml = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="utf-8">
        <title>Tez Araştırması Günlük Protokol Raporu - ${today}</title>
        <style>
          @page { size: A4 portrait; margin: 10mm 12mm 14mm 12mm; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 9pt; line-height: 1.35; color: #1e293b; margin: 0; padding: 0; background: #ffffff; }
          .header { border-bottom: 2.5px solid #2d6a4f; padding-bottom: 10px; margin-bottom: 12px; text-align: center; }
          .univ-badge { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; background: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 999px; font-size: 8pt; font-weight: 700; color: #1b4332; margin-bottom: 5px; text-transform: uppercase; }
          .institute-title { font-size: 11pt; font-weight: 800; color: #0f172a; margin: 0 0 3px 0; }
          .report-heading { font-size: 14pt; font-weight: 900; color: #2d6a4f; margin: 0; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 14px; }
          .summary-card { background: #f8faf9; border: 1px solid #d1fae5; border-radius: 8px; padding: 7px 10px; }
          .summary-card .label { font-size: 7.5pt; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px; }
          .summary-card .val { font-size: 12pt; font-weight: 800; color: #0f172a; }
          .summary-card .sub { font-size: 7.5pt; color: #2d6a4f; font-weight: 600; }
          .data-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 8.5pt; }
          .data-table th { background: #2d6a4f; color: #ffffff; font-weight: 700; text-align: left; padding: 6px 7px; border: 1px solid #1b4332; font-size: 8pt; }
          .data-table td { padding: 5px 7px; border: 1px solid #e2e8f0; vertical-align: middle; }
          .data-table tr:nth-child(even) { background-color: #f8fafc; }
          .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 7.5pt; font-weight: 700; }
          .badge-success { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
          .badge-warning { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
          .badge-gray { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 24px; padding-top: 14px; border-top: 1px dashed #cbd5e1; page-break-inside: avoid; }
          .sig-box { text-align: center; }
          .sig-box strong { display: block; font-size: 9pt; color: #0f172a; margin-bottom: 35px; }
          .sig-box span { font-size: 8.5pt; color: #64748b; }
          .footer-note { font-size: 7.5pt; color: #94a3b8; text-align: center; margin-top: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="univ-badge">Akademik Araştırma & Veri Kayıt Protokolü</div>
          <h2 class="institute-title">DİKKAT EĞİTİMİ VE PROGRESİF KAS GEVŞEME EGZERSİZLERİ TEZ PROTOKOLÜ</h2>
          <h3 class="report-heading">GÜNLÜK SEANS VE KATILIMCI PROTOKOL RAPORU</h3>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <span class="label">Rapor Tarihi</span>
            <div class="val" style="font-size:10pt;">${today}</div>
            <span class="sub">Günlük Protokol</span>
          </div>
          <div class="summary-card">
            <span class="label">Kayıtlı Katılımcı</span>
            <div class="val">${participants.length} Kişi</div>
            <span class="sub">${participants.filter((p) => p.group === 'dikkat').length} Dikkat / ${participants.filter((p) => p.group === 'kas_gevseme').length} Gevşeme</span>
          </div>
          <div class="summary-card">
            <span class="label">1. Oturum Uyum</span>
            <div class="val">${doneCount1} / ${participants.length}</div>
            <span class="sub">%${participants.length ? Math.round((doneCount1 / participants.length) * 100) : 0} Tamamlandı</span>
          </div>
          <div class="summary-card">
            <span class="label">2. Oturum Uyum</span>
            <div class="val">${doneCount2} / ${participants.length}</div>
            <span class="sub">%${participants.length ? Math.round((doneCount2 / participants.length) * 100) : 0} Tamamlandı</span>
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

  const totalCompleted1 = rows.filter((r) => r.session1Done).length;
  const totalCompleted2 = rows.filter((r) => r.session2Done).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-emerald-200/90 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl text-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-100 flex items-center justify-between bg-[#f4f9f5]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold shadow-xs shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Hızlı Yönetici Önizlemesi</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                  Admin
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Gelişmiş yönetim ve linkler için <a href="/admin" className="text-emerald-700 underline font-bold">/admin</a> sayfasına gidiniz.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1 sm:gap-1.5 text-xs font-bold bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 sm:px-3 py-2 rounded-xl shadow-xs transition-all active:scale-95"
              title="Düzenli Excel (.xls) İndir"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline">Excel (.xls)</span>
              <span className="sm:hidden">Excel</span>
            </button>
            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-1 sm:gap-1.5 text-xs font-bold bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white px-2.5 sm:px-3 py-2 rounded-xl shadow-xs transition-all active:scale-95"
              title="Günün Resmi PDF Raporunu Çıkar"
            >
              <FileText className="w-4 h-4 text-emerald-200" />
              <span className="hidden sm:inline">PDF Çıkar</span>
              <span className="sm:hidden">PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Stat Summary Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 bg-[#f8fbf9] border-b border-emerald-100 text-center">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-emerald-200/80 shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 block mb-0.5">Katılımcı</span>
            <span className="text-base sm:text-lg font-extrabold text-slate-900 font-mono">{participants.length}</span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 block font-medium">Havuz</span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-emerald-200/80 shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 block mb-0.5">1. Seans</span>
            <span className="text-base sm:text-lg font-extrabold text-emerald-700 font-mono">
              {totalCompleted1} / {participants.length}
            </span>
            <span className="text-[9px] sm:text-[10px] text-emerald-800 block font-bold">
              %{participants.length ? Math.round((totalCompleted1 / participants.length) * 100) : 0}
            </span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-emerald-200/80 shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 block mb-0.5">2. Seans</span>
            <span className="text-base sm:text-lg font-extrabold text-teal-800 font-mono">
              {totalCompleted2} / {participants.length}
            </span>
            <span className="text-[9px] sm:text-[10px] text-teal-900 block font-bold">
              %{participants.length ? Math.round((totalCompleted2 / participants.length) * 100) : 0}
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-3 sm:p-4 border-b border-emerald-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 justify-between bg-white">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Katılımcı ID Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#f8fbf9] border border-emerald-200 focus:border-emerald-600 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none font-medium"
            />
          </div>

          <div className="flex items-center gap-1 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-500 mr-1 shrink-0" />
            {(['all', 'dikkat', 'kas_gevseme'] as const).map((grp) => (
              <button
                key={grp}
                onClick={() => setFilterGroup(grp)}
                className={`flex-1 sm:flex-none text-xs px-2.5 py-1.5 rounded-xl font-bold transition-all ${
                  filterGroup === grp
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-[#f8fbf9] text-slate-600 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                {grp === 'all' && `Tümü (${participants.length})`}
                {grp === 'dikkat' && 'Dikkat'}
                {grp === 'kas_gevseme' && 'Gevşeme'}
              </button>
            ))}
          </div>
        </div>

        {/* ================= 1. MOBILE CARDS VIEW (Ekran < 640px) ================= */}
        <div className="flex-1 overflow-y-auto p-3 sm:hidden space-y-2.5">
          {filteredRows.map((r) => (
            <div
              key={r.participant.id}
              className="p-3 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-slate-900 text-sm block">
                    {r.participant.id}
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium">
                    {r.participant.name}
                  </span>
                </div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                    r.participant.group === 'dikkat'
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                      : 'bg-purple-100 border-purple-300 text-purple-900'
                  }`}
                >
                  {r.participant.group === 'dikkat' ? 'Dikkat' : 'Kas Gevşeme'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs">
                <div className="p-1.5 rounded-lg bg-[#f8fbf9] border border-emerald-100">
                  <span className="text-[10px] text-slate-400 block font-medium">1. Egzersiz:</span>
                  {r.session1Done ? (
                    <span className="inline-flex items-center gap-1 text-emerald-800 font-bold text-[11px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{r.session1Time}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]">
                      <XCircle className="w-3 h-3 text-slate-400" />
                      <span>Bekliyor</span>
                    </span>
                  )}
                </div>

                <div className="p-1.5 rounded-lg bg-[#f8fbf9] border border-emerald-100">
                  <span className="text-[10px] text-slate-400 block font-medium">2. Egzersiz:</span>
                  {r.session2Done ? (
                    <span className="inline-flex items-center gap-1 text-emerald-800 font-bold text-[11px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{r.session2Time}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]">
                      <XCircle className="w-3 h-3 text-slate-400" />
                      <span>Bekliyor</span>
                    </span>
                  )}
                </div>
              </div>

              {onSelectParticipant && (
                <div className="pt-1 text-right">
                  <button
                    onClick={() => {
                      onSelectParticipant(r.participant.id);
                      onClose();
                    }}
                    className="text-xs text-emerald-800 font-bold hover:underline"
                  >
                    Katılımcıyı İncele →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ================= 2. DESKTOP TABLE VIEW (Ekran >= 640px) ================= */}
        <div className="hidden sm:block flex-1 overflow-y-auto p-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-200/80 bg-[#f0f7f2] text-emerald-950 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 pl-3">Katılımcı</th>
                <th className="py-2.5">Grup</th>
                <th className="py-2.5 text-center">1. Egzersiz</th>
                <th className="py-2.5 text-center">2. Egzersiz</th>
                <th className="py-2.5 text-right pr-3">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100/70 font-medium">
              {filteredRows.map((r) => (
                <tr key={r.participant.id} className="hover:bg-[#f6faf7] transition-colors">
                  <td className="py-3 pl-3">
                    <span className="font-mono font-bold text-slate-900 block">
                      {r.participant.id}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {r.participant.name}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        r.participant.group === 'dikkat'
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                          : 'bg-purple-100 border-purple-300 text-purple-900'
                      }`}
                    >
                      {r.participant.group === 'dikkat' ? 'Dikkat' : 'Kas Gevşeme'}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    {r.session1Done ? (
                      <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{r.session1Time}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                        <XCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>Bekliyor</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-center">
                    {r.session2Done ? (
                      <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{r.session2Time}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                        <XCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>Bekliyor</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right pr-3">
                    {onSelectParticipant && (
                      <button
                        onClick={() => {
                          onSelectParticipant(r.participant.id);
                          onClose();
                        }}
                        className="text-xs text-emerald-800 hover:text-emerald-950 font-bold hover:underline"
                      >
                        Gözat
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
