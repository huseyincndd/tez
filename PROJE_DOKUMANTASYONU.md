# Tez Çalışması: Katılımcı Ses Dinleme ve Takip Sistemi
## Proje Dokümantasyonu ve Müşteri Gereksinimleri

Bu doküman, tez araştırması kapsamında yürütülen deneysel ses dinleme çalışmasının web uygulamasının tüm iş kurallarını, müşteri gereksinimlerini ve teknik mimarisini kalıcı olarak kayıt altında tutmak amacıyla hazırlanmıştır.

---

## 1. Proje Amacı ve Genel Çerçeve
* **Araştırma Türü:** Akademik Tez Çalışması (Deneysel / Karşılaştırmalı Takip).
* **Katılımcı Sayısı:** Toplam 80 Katılımcı.
* **Gruplar:**
  1. **Dikkat Eğitimi Grubu:** 40 Katılımcı
  2. **Progresif Kas Gevşeme Grubu:** 40 Katılımcı
* **Ses Kayıtları:** Toplamda 2 ayrı ses kaydı mevcuttur (biri Dikkat Eğitimi, diğeri Progresif Kas Gevşeme). Her kayıt yaklaşık **12 dakika** sürmektedir. Katılımcılar her oturumda kendi gruplarına atanmış olan ses kaydını dinlerler.

---

## 2. Müşteri Görüşmesi ve Kesinleşen İş Kuralları

### Soru 1: Ses atamaları nasıl yapılacak?
> **Müşteri Cevabı:**  
> *"Manuel olarak diyebiliriz. 80 katılımcının 40’ı dikkat eğitimi, 40’ı progresif kas gevşeme olacak. Bu kişilerle aynı zamanda yüz yüze oturumlar da yapacağım için kişilerin hangi grupta olacağı belli yani. Sadece 2 ayrı ses kaydı olacak dikkat eğitim ve progresif kas gevşeme olarak her seferinde aynısını dinleyecekler."*

* **Kural:** Katılımcı sisteme tanımlanırken grubu ("dikkat" veya "kas_gevseme") belirlenir. Katılımcı giriş yaptığında otomatik olarak sadece kendi grubunun 12 dakikalık ses kaydını görür.

---

### Soru 2: Tamamlama düzeyinden kasıt tam olarak ne?
> **Müşteri Cevabı:**  
> *"İleri sarma opsiyonu olmasa çok daha güzel olur zaten 12 dakika olacak. Tamamlama yüzdesini görme imkanımız varsa da daha iyi olur. Bu ünilerin moodle sistemlerinde oluyordu onun gibi. Bitmeden çıkmak isterse de egzersiz tamamlanmadan çıkmak istediğinize emin misiniz gibi bir uyarı mesajı çıkabilir."*

* **Kural 1 (İleri Sarma Engeli):** Standart tarayıcı oynatıcısı (`<audio controls>`) yerine özel (custom) oynatıcı kullanılır. Kullanıcı sadece Oynat / Duraklat yapabilir, ses çubuğunu ileri çekemez.
* **Kural 2 (Tamamlama Yüzdesi & Heartbeat):** Kullanıcının dinlediği saniye düzenli aralıklarla (örn. her 5-10 saniyede bir) kaydedilir. Tamamlama oranı (%0 - %100) hesaplanır.
* **Kural 3 (Erken Çıkış Uyarısı):** Ses %100 tamamlanmadan sayfadan ayrılmak, sekmeyi kapatmak veya geri gitmek istenirse modal / alert ile:  
  *"Egzersiz tamamlanmadan çıkmak istediğinize emin misiniz? İlerlemeniz kaydedilmeyecektir / yarım kalacaktır."* uyarısı verilir.

---

### Soru 3: Zaman kısıtı ve gün devri nasıl olacak?
> **Müşteri Cevabı:**  
> *"O kural katı evet. Gün içinde atıyorum 15 eylül egzersiz 1 egzersiz 2 olarak görünebilir hangi saatlerde dinleyecekleri katılımcıya kalmış, gece 12 den sonra da 16 eylüle geçebilir."*

* **Kural 1 (Günde 2 Egzersiz):** Her gün sistem katılımcıya 2 oturum sunar:
  * **Egzersiz 1 (1. Oturum)**
  * **Egzersiz 2 (2. Oturum)**
* **Kural 2 (Esnek Saat):** Katılımcı gün içinde istediği saatte dinleyebilir (örn. sabah-akşam veya öğlen-gece).
* **Kural 3 (Gece 00:00 Devri):** Sunucu saatine göre (Türkiye Saati UTC+3) gece 00:00'da yeni güne geçilir. Önceki günün yapılmayan egzersizleri kilitlenir veya "Tamamlanmadı" olarak işaretlenir.

---

### Soru 4: Katılımcı girişi ve kayıt nasıl olacak?
> **Müşteri Cevabı:**  
> *"Dışarıya açık değil sadece mevcutta görüştüğüm katılımcılara vereceğimiz idlerle girebilirler."*

* **Kural:** Sisteme dışarıdan kayıt olma (sign-up) formu kapalıdır. Katılımcılar kendilerine araştırmacı tarafından verilen benzersiz kod/ID (Örn: `KAT-101`, `DE-01`, `KG-01`) ile tek tıkla oturum açarlar.

---

## 3. Ekranlar ve Kullanıcı Deneyimi (UX)

### A. Katılımcı Arayüzü (Mobil Öncelikli Tasarım)
1. **Giriş Ekranı (Login):**
   * Katılımcı Kodu Giriş Kutusu.
   * "Giriş Yap" butonu.
2. **Ana Panel (Bugünün Egzersizleri):**
   * Tarih başlığı (Örn: "16 Eylül 2026, Çarşamba").
   * Katılımcı Bilgisi (Örn: Katılımcı #42 - Dikkat Grubu).
   * **Kart 1: Egzersiz 1**
     * Durum: *Bekliyor / Devam Ediyor / Tamamlandı (%100)*
     * [Egzersizi Başlat] Butonu.
   * **Kart 2: Egzersiz 2**
     * Durum: *Bekliyor / Devam Ediyor / Tamamlandı (%100)*
     * [Egzersizi Başlat] Butonu.
3. **Egzersiz Oynatıcı Ekranı:**
   * Sade, sakinleştirici, dikkat dağıtmayan zen arayüzü.
   * Kalan süre ve geçen süre sayacı (12:00 dakika).
   * Oynat / Duraklat butonu.
   * Ekran Açık Tutma (Screen Wake Lock) desteği (telefon ekranının kapanmasını önleme).
   * Erken ayrılma güvenlik koruması.

### B. Tez Yöneticisi (Admin) Paneli
1. **Genel İstatistikler:**
   * Toplam 80 katılımcının bugünkü katılım oranı.
   * Dikkat Grubu vs Kas Gevşeme Grubu karşılaştırmalı tamamlama oranları.
2. **Katılımcı Takip Tablosu / Çetelesi:**
   * Katılımcı ID, Grubu, Toplam Tamamlanan Gün Sayısı, Bugün Egzersiz 1 (✓/✗), Bugün Egzersiz 2 (✓/✗).
3. **SPSS / Excel Dışa Aktarımı (Export):**
   * Tek tıkla `.xlsx` veya `.csv` formatında katılımcıların gün gün, seans seans tamamlama ve süre verilerini indirme.

---

## 4. Veri Modeli Tasarımı

```typescript
// Katılımcı Modeli
interface Participant {
  id: string;             // Örn: "KAT-101"
  group: 'dikkat' | 'kas_gevseme';
  name?: string;          // İsteğe bağlı araştırmacı notu
  notes?: string;
  createdAt: string;
}

// Oturum / Egzersiz Kaydı Modeli
interface SessionLog {
  id: string;
  participantId: string;
  date: string;           // YYYY-MM-DD (Sunucu saati UTC+3)
  sessionNumber: 1 | 2;   // Günün 1. veya 2. egzersizi
  durationSeconds: number;// Dinlenen toplam net saniye
  isCompleted: boolean;   // %100 dinlendi mi?
  completionRate: number; // Yüzde (0-100)
  completedAt?: string;   // Tamamlanma zaman damgası
}
```

---

## 5. Proje Teknik Altyapısı
* **Framework:** Next.js 15+ (App Router)
* **Dil:** TypeScript
* **Stil:** Tailwind CSS (Modern, mobil uyumlu ve göz yormayan soft renk paleti)
* **İkonlar:** Lucide React
* **Mobil Uyumluluk:** Screen Wake Lock API (mobil cihazlarda ekran kararmasını önleyici yapı)
