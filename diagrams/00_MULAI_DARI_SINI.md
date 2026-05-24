# 🚀 CARA MENGGUNAKAN DIAGRAM-DIAGRAM INI

## ✨ Diagram untuk Skripsi GPS Vehicle Tracking System Anda

Anda sekarang memiliki **9 diagram profesional** dalam format PlantUML untuk skripsi. Berikut cara menggunakannya:

---

## 📂 File-File yang Telah Dibuat

```
/diagrams/
├── 9 File Diagram PlantUML (.puml)
│   ├── 01_UseCase.puml
│   ├── 02_Activity_GeofenceViolation.puml
│   ├── 03_Activity_LoginAuth.puml
│   ├── 04_Sequence_RealtimeMonitoring.puml
│   ├── 05_Sequence_CreateGeofence.puml
│   ├── 06_Sequence_N8NNotification.puml
│   ├── 07_Flowchart_System.puml
│   ├── 08_ER_DatabaseDesign.puml
│   └── 09_Architecture_MonitoringVehicles.puml
│
└── 3 File Dokumentasi Markdown
    ├── README.md (Dokumentasi lengkap setiap diagram)
    ├── QUICK_REFERENCE.md (Panduan cepat & tips)
    └── INDEX.md (Overview & navigasi)
```

**Total**: 12 file siap pakai

---

## 🎯 3 Cara Preview Diagram

### Cara 1: Online Preview (Paling Mudah ⭐)

**Tidak perlu install apapun!**

1. Buka: https://www.plantuml.com/plantuml/uml/
2. Buka salah satu file .puml dengan text editor (Notepad, VS Code, dll)
3. Copy-paste isi file ke text area di website
4. **Instant preview!** Diagram langsung tampil

**Keuntungan:**
- Tidak perlu install apapun
- Instant preview
- Bisa di-export langsung ke PNG/SVG

---

### Cara 2: VS Code Preview (Recommended ✅)

**Dengan extension, preview otomatis!**

**Step 1: Install PlantUML Extension**
```
1. Buka VS Code
2. Extension marketplace (Ctrl+Shift+X)
3. Search: "PlantUML"
4. Install extension dari "jebbs" atau "eightHundreds"
```

**Step 2: Preview File**
```
1. Buka file .puml (misal: 01_UseCase.puml)
2. Right-click → "PlantUML: Preview"
3. Atau tekan Alt+D
4. Preview akan otomatis tampil di side panel
```

**Step 3: Edit & Auto-Refresh**
```
- Ubah kode .puml
- Preview otomatis refresh
- Export ke PNG langsung dari preview
```

---

### Cara 3: Command Line (Untuk Export Batch)

**Jika sudah install PlantUML di sistem:**

```bash
# Export SATU file ke PNG
plantuml -Tpng 01_UseCase.puml

# Export SEMUA file ke PNG
plantuml -Tpng *.puml

# Export dengan output folder
plantuml -Tpng *.puml -o output/

# Export ke format lain
plantuml -Tpdf *.puml    # PDF
plantuml -Tsvg *.puml    # SVG (vector, scalable)
```

---

## 📊 Preview Singkat Setiap Diagram

### 1️⃣ Diagram Use Case (`01_UseCase.puml`)
```
Menampilkan:
- User dapat: Register, Login, Add Vehicle, Monitor, Create Geofence
- Device dapat: Submit GPS Location
- Sistem dapat: Detect Violation, Send Notification

Visual: 
⬤ User actor → 13 use cases
⬤ Device actor → 1 use case
⬤ Relationship arrows
```

### 2️⃣ Activity Diagram - Geofence Violation (`02_Activity_GeofenceViolation.puml`)
```
Menampilkan:
- GPS Location diterima
- Validasi input
- Cari vehicle
- Loop: Ray Casting untuk setiap geofence
- Jika violation: Trigger N8N → Send notifications (parallel)
- Log activity

Visual:
⬤ Flow activity dengan diamond decisions
⬇️ Fork/join untuk parallel notifications
```

### 3️⃣ Activity Diagram - Login Auth (`03_Activity_LoginAuth.puml`)
```
Menampilkan:
- User input email & password
- Validasi format
- Cari user di DB
- bcryptjs password check
- Generate JWT token
- Simpan ke LocalStorage
- Redirect to dashboard

Visual:
⬆️ 15+ activity steps
💎 Decision points untuk validation
🔒 Security notes di diagram
```

### 4️⃣ Sequence Diagram - Real-time Monitoring (`04_Sequence_RealtimeMonitoring.puml`)
```
Menampilkan:
- Frontend ←→ Backend interactions
- Polling setiap 5 detik
- Location update
- Map marker update (hijau/merah)

Participants: 4
⬤ Frontend (Vue.js)
⬤ LocalStorage
⬤ Backend API
⬤ MongoDB
```

### 5️⃣ Sequence Diagram - Create Geofence (`05_Sequence_CreateGeofence.puml`)
```
Menampilkan:
- User menggambar polygon di map
- Koordinat dikumpulkan
- Validasi (min 3 points, nama)
- POST ke backend
- JWT auth check
- Insert ke MongoDB
- Success response

Participants: 7
⬤ User
⬇️ Frontend
⬇️ Leaflet Map
⬇️ Backend API
⬇️ Middleware
⬇️ Controller
⬇️ MongoDB
```

### 6️⃣ Sequence Diagram - N8N Notification (`06_Sequence_N8NNotification.puml`)
```
Menampilkan:
- Violation detected
- Webhook trigger ke N8N
- N8N workflow jalankan
- Parallel: Send Email + Telegram + WhatsApp
- Log notification status

Participants: 9
⬤ GPS Device
⬇️ Backend API
⬇️ N8N Webhook
⬇️ N8N Workflow
⬇️ Email Service
⬇️ Telegram
⬇️ WhatsApp
⬇️ User
⬇️ MongoDB
```

### 7️⃣ Flowchart - System Flow (`07_Flowchart_System.puml`)
```
Menampilkan:
3 jalur parallel:
1. User Activity: Register → Login → Monitor
2. GPS Device: Send Location → Check Geofence → Notify
3. Monitoring: View History → Export

Visual:
⬆️ Split into 3 parallel jalur
⬇️ Merge kembali
💎 Decision points
```

### 8️⃣ ER Diagram - Database Design (`08_ER_DatabaseDesign.puml`)
```
Menampilkan:
5 Koleksi MongoDB:
⬤ Users (name, email, password, notifConfig)
⬇️ Vehicles (vehicleName, deviceId, currentLocation)
⬇️ Geofences (name, geometry, isActive)
⬇️ LocationLogs (location, isViolation, violatedGeofences)
⬇️ NotificationLogs (channel, status, message)

Relationship:
→ 1-M relationships with lines
→ Index notes untuk setiap koleksi
```

### 9️⃣ Architecture Diagram (`09_Architecture_MonitoringVehicles.puml`)
```
Menampilkan:
6 Layer + External Services:

┌─────────────────────────┐
│ IoT Devices (GPS)       │
├─────────────────────────┤
│ Presentation (Vue.js)   │
├─────────────────────────┤
│ API Layer (Express)     │
├─────────────────────────┤
│ Business Logic          │
├─────────────────────────┤
│ Geofencing Logic        │
├─────────────────────────┤
│ Data Layer (MongoDB)    │
└─────────────────────────┘
  ↓
  N8N + Email/Telegram/WhatsApp
```

---

## 🎓 Rekomendasi Penggunaan Skripsi

### BAB 2: Analisis Sistem
Gunakan: **Diagram 1 + Diagram 7**
- Diagram 1 → Fitur-fitur apa yang disediakan
- Diagram 7 → Alur sistem keseluruhan

### BAB 3: Perancangan Sistem
Gunakan: **Diagram 8 + Diagram 9 + Diagram 2**
- Diagram 8 → Desain database
- Diagram 9 → Arsitektur teknis
- Diagram 2 → Logika core (geofence detection)

### BAB 4: Implementasi
Gunakan: **Diagram 3 + Diagram 4 + Diagram 5 + Diagram 6**
- Diagram 3 → Authentication implementation
- Diagram 4 → Real-time feature
- Diagram 5 → Geofence management
- Diagram 6 → Notification system & N8N

### BAB 5: Hasil & Pembahasan
Gunakan: **Semua diagram** untuk menunjukkan coverage testing

---

## 💡 Tips Penggunaan

### Untuk Print (Thesis Hardcopy):
```
1. Export ke PNG dengan DPI tinggi (300 DPI)
2. Atau gunakan SVG (vector, tidak blur saat di-zoom)
3. Adjust ukuran sesuai halaman (A4 landscape)
```

### Untuk Digital/PDF:
```
1. Export ke PNG (150 DPI cukup)
2. Atau gunakan format asli PlantUML (lebih kecil file)
```

### Untuk Presentasi:
```
1. Export ke PNG (150-200 DPI)
2. Atau gunakan SVG untuk zoom tanpa blur
3. Adjust warna sesuai template slide Anda
```

### Untuk Customize:
```
1. Edit file .puml dengan text editor
2. Ubah warna: skinparam backgroundColor #FFFFFF
3. Ubah font: skinparam defaultFontSize 14
4. Preview instant di website atau VS Code
```

---

## 📋 Checklist Sebelum Submisi

Sebelum submit skripsi, pastikan:

- [ ] Semua 9 diagram sudah di-review
- [ ] Diagram sudah di-export ke PNG/PDF
- [ ] Resolusi cukup tinggi untuk print
- [ ] Caption & description lengkap di bawah gambar
- [ ] Referensi diagram konsisten (Gambar 1, 2, 3, dll)
- [ ] Diagram positioning bagus di halaman
- [ ] Warna dan font sesuai template thesis
- [ ] No broken references atau placeholder text

---

## 🔧 Troubleshooting

### Diagram tidak tampil di website
→ Cek syntax di: https://www.plantuml.com/plantuml/uml/
→ Lihat error message dan perbaiki

### Text terlalu kecil
→ Edit di file: `skinparam defaultFontSize 14`
→ Re-export ke PNG

### Mau ubah warna
→ Edit `skinparam` di awal file:
   ```
   skinparam backgroundColor #FFFFFF
   skinparam sequenceArrowThickness 2
   skinparam actorBackgroundColor #87CEEB
   ```

### Export tidak berfungsi
→ Install Java (PlantUML butuh Java)
→ Atau gunakan online editor: plantuml.com

---

## 📚 File Dokumentasi

Dalam folder diagrams ada 3 file dokumentasi:

1. **README.md** - Dokumentasi lengkap setiap diagram
2. **QUICK_REFERENCE.md** - Tips cepat & troubleshooting
3. **INDEX.md** - Daftar lengkap & navigasi

**Baca file-file ini untuk:** penjelasan detail, spesifikasi teknis, tips penggunaan.

---

## 📞 Jika Ada Pertanyaan

- **Cara preview?** → Lihat bagian "3 Cara Preview Diagram" di atas
- **Cara customize?** → Lihat QUICK_REFERENCE.md
- **Penjelasan diagram?** → Lihat README.md
- **Navigasi cepat?** → Lihat INDEX.md

---

## ✨ Summary

Anda sekarang memiliki:

✅ **9 Diagram PlantUML** (format profesional untuk skripsi)
✅ **3 File Dokumentasi** (penjelasan detail + tips)
✅ **Siap Print/Digital** (mudah di-export ke berbagai format)
✅ **Mudah Customize** (plain text, bisa di-edit kapan saja)
✅ **Version Control Ready** (PlantUML = text-based)

**Semuanya siap untuk skripsi Anda! 🎓**

---

## 🚀 Next Steps

1. **Preview** diagram dengan online editor atau VS Code
2. **Review** setiap diagram sesuai dengan sistem Anda
3. **Customize** jika perlu (warna, text, layout)
4. **Export** ke PNG/PDF dengan resolusi tinggi
5. **Insert** ke skripsi dengan caption & keterangan
6. **Reference** diagram di text sesuai chapter

---

**Good luck with your thesis! 🎓📚🚗📍**

Created: 2024 | GPS Vehicle Tracking System - Final Year Project
Format: PlantUML (Open Standard, Free)
