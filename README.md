# Relation & Media Dashboard

Dashboard untuk manajemen MOU dan Media Release departemen Humas, terhubung dengan Google Sheets.

## 🚀 Fitur Utama

- 📊 **Dashboard** dengan statistik real-time
- 📑 **Manajemen MOU** - lihat semua perjanjian kerja sama
- 📰 **Media Release** - publikasi dan berita
- 👥 **Manajemen Mitra** - data institusi partner
- 📈 **Laporan & Analytics** - export data ke Excel
- 🔄 **Auto-sync** dengan Google Sheets
- 📱 **Responsive design** - mobile friendly

## 🛠️ Setup Instruksi

### 1. **Siapkan Google Sheets**
1. Buat spreadsheet baru di Google Sheets
2. Buat 3 sheet dengan nama:
   - `MOU` - Data perjanjian kerja sama
   - `Media` - Data media release
   - `Partners` - Data mitra
3. **Share spreadsheet** dengan akses "Anyone with the link can VIEW"

### 2. **Dapatkan API Key**
1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Buat project baru
3. Enable **Google Sheets API**
4. Buat **API Key** (Credentials → Create Credentials → API Key)
5. Restrict API Key ke Sheets API saja

### 3. **Konfigurasi Aplikasi**
Edit file `config.js`:
```javascript
spreadsheetId: 'GANTI_DENGAN_ID_SPREADSHEET_ANDA',
apiKey: 'GANTI_DENGAN_API_KEY_ANDA'