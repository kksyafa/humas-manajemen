// CONFIGURATION FILE - EDIT INI SAJA
// ==================================

// 1. GOOGLE SHEETS CONFIGURATION
const CONFIG = {
    // GANTI DENGAN SPREADSHEET ID ANDA
    spreadsheetId: '1DmH3C0h_rhljR5gX4k4YgK7FFg_w5V1fmhFIyY3RrwQ', // Ganti dengan ID spreadsheet Anda
    
    // NAMA SHEET YANG AKAN DIBACA
    sheets: {
        mou: 'MOU',          // Sheet untuk data MOU
        media: 'Media',      // Sheet untuk Media Release
        partners: 'Partners', // Sheet untuk data Partners
        logs: 'Logs'         // Sheet untuk Activity Logs (optional)
    },
    
    // API KEY untuk Google Sheets API
    apiKey: 'AIzaSyAQ7KT4JdDo_CKX4IG6nqrLXU97kNiIlHw', // Ganti dengan API Key Anda
    
    // SETTINGS
    settings: {
        autoRefresh: true,           // Auto refresh setiap 5 menit
        refreshInterval: 300000,     // 5 menit dalam milidetik
        useCache: true,             // Gunakan cache untuk performa
        cacheDuration: 60000        // Cache berlaku 1 menit
    }
};

// 2. DEMO DATA (jika spreadsheet tidak bisa diakses)
const DEMO_DATA = {
    mou: [
        {
            id: 'MOU-001',
            partner: 'PT Telkom Indonesia',
            category: 'Telekomunikasi',
            start_date: '2024-01-01',
            end_date: '2025-12-31',
            description: 'Kerja sama pengembangan teknologi 5G',
            contact: 'Budi - 0812-3456-7890',
            status: 'active'
        },
        {
            id: 'MOU-002',
            partner: 'Universitas Indonesia',
            category: 'Pendidikan',
            start_date: '2023-08-10',
            end_date: '2026-08-10',
            description: 'Kerja sama penelitian dan pertukaran mahasiswa',
            contact: 'Dr. Sari - 0813-9876-5432',
            status: 'active'
        },
        {
            id: 'MOU-003',
            partner: 'RS Hermina',
            category: 'Kesehatan',
            start_date: '2022-01-15',
            end_date: '2024-12-31',
            description: 'Kerja sama pemeriksaan kesehatan rutin',
            contact: 'Dr. Andi - 0821-1122-3344',
            status: 'ending'
        }
    ],
    
    media: [
        {
            id: 'MEDIA-001',
            title: 'Open House Sekolah Tahun 2024',
            date: '2024-01-12',
            category: 'Kegiatan',
            content: 'Kami dengan bangga mengumumkan kegiatan Open House yang akan diadakan pada tanggal 15 Januari 2024. Acara ini terbuka untuk umum dan akan menampilkan berbagai fasilitas terbaru kami.',
            status: 'published',
            author: 'Tim Humas'
        },
        {
            id: 'MEDIA-002',
            title: 'Kerjasama Strategis dengan PT Astra International',
            date: '2024-01-05',
            category: 'Kerja Sama',
            content: 'Pengumuman kerjasama strategis dengan PT Astra International dalam pengembangan program magang dan penelitian bersama.',
            status: 'published',
            author: 'Tim Humas'
        },
        {
            id: 'MEDIA-003',
            title: 'Siswa Raih Medali Olimpiade Sains Nasional',
            date: '2023-12-20',
            category: 'Prestasi',
            content: 'Siswa kami berhasil meraih medali emas dalam Olimpiade Sains Nasional 2023. Prestasi ini membanggakan seluruh komunitas sekolah.',
            status: 'published',
            author: 'Tim Humas'
        }
    ],
    
    partners: [
        {
            id: 'PART-001',
            institution: 'PT Telkom Indonesia',
            category: 'Telekomunikasi',
            address: 'Jl. Jend. Sudirman No. 1, Jakarta',
            contact: '021-1234567',
            email: 'cs@telkom.co.id',
            website: 'www.telkom.co.id',
            status: 'active'
        },
        {
            id: 'PART-002',
            institution: 'Universitas Indonesia',
            category: 'Pendidikan',
            address: 'Kampus UI Depok, Jawa Barat',
            contact: '021-7867222',
            email: 'humas@ui.ac.id',
            website: 'www.ui.ac.id',
            status: 'active'
        }
    ]
};

// 3. HOW TO GET YOUR SPREADSHEET ID:
// - Buka Google Sheets Anda
// - Lihat di URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
// - Copy kode setelah /d/ dan sebelum /edit

// 4. HOW TO GET API KEY:
// - Buka https://console.cloud.google.com
// - Buat project baru
// - Enable Google Sheets API
// - Credentials → Create Credentials → API Key
// - Restrict key ke Sheets API saja

// 5. SPREADSHEET FORMAT:
// Pastikan spreadsheet Anda memiliki sheet dengan nama:
// - "MOU" (data MOU)
// - "Media" (data Media Release)
// - "Partners" (data Partners)

console.log('Config loaded successfully!');