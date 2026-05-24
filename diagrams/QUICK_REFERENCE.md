# 🎯 Quick Reference Guide - Diagram GPS Vehicle Tracking System

## 📂 Struktur File Diagram

```
diagrams/
├── 01_UseCase.puml                    # Use Case Diagram
├── 02_Activity_GeofenceViolation.puml # Activity Diagram - Violation Detection
├── 03_Activity_LoginAuth.puml         # Activity Diagram - Login & Auth
├── 04_Sequence_RealtimeMonitoring.puml # Sequence Diagram - Real-time Tracking
├── 05_Sequence_CreateGeofence.puml    # Sequence Diagram - Create Geofence
├── 06_Sequence_N8NNotification.puml   # Sequence Diagram - N8N Notifications
├── 07_Flowchart_System.puml           # Flowchart - System Flow
├── 08_ER_DatabaseDesign.puml          # ER Diagram - Database Design
├── 09_Architecture_MonitoringVehicles.puml # Architecture Diagram
├── README.md                          # Dokumentasi lengkap (file ini)
└── QUICK_REFERENCE.md                 # Quick reference (file ini)
```

---

## ⚡ 5 Menit Quick View

### Diagram 1: Use Case (Mulai di sini!)
**Untuk memahami:** Apa yang bisa dilakukan user dan sistem?
```
User dapat:
✓ Register & Login
✓ Add Vehicle (untuk tracking)
✓ Create Geofence (area terlarang)
✓ Monitor vehicle location (real-time)
✓ Receive notification (jika geofence dilanggar)
✓ View history & violations
```

### Diagram 2 & 3: Activity Diagrams
**Untuk memahami:** Langkah demi langkah proses apa?

**Diagram 2 - Geofence Violation:**
```
User submits GPS → Backend checks geofence → 
Violation detected? → YES → Send notifications
                           (Email + Telegram + WhatsApp)
```

**Diagram 3 - Login:**
```
User login → Validate password → 
Generate JWT token → Simpan di browser → 
Access dashboard
```

### Diagram 4-6: Sequence Diagrams
**Untuk memahami:** Siapa berinteraksi dengan siapa? Urutan apa?

**Diagram 4 - Real-time Monitoring:**
- Frontend polling backend setiap 5 detik
- Update map markers real-time

**Diagram 5 - Create Geofence:**
- User gambar polygon di map
- Backend save ke MongoDB
- Refresh list geofences

**Diagram 6 - N8N Notifications:**
- Violation detected → Trigger N8N webhook
- N8N kirim Email + Telegram + WhatsApp (parallel)
- Log status ke database

### Diagram 7: Flowchart
**Untuk memahami:** Alur keseluruhan sistem dengan 3 jalur:

1. **User Activity**: Register → Login → Monitor vehicles
2. **Device Activity**: Send GPS → Check geofence → Notify
3. **Analysis**: View history → Export reports

### Diagram 8: ER Diagram
**Untuk memahami:** Struktur database & relationship

**5 Koleksi utama:**
```
Users
├── Vehicles (one user, many vehicles)
├── Geofences (one user, many geofences)
├── LocationLogs (tracking history)
└── NotificationLogs (notification history)
```

### Diagram 9: Architecture
**Untuk memahami:** Komponen sistem & how they connect

```
IoT Devices → Backend API → MongoDB
                   ↓
              N8N Webhooks → Email/Telegram/WhatsApp
                   ↓
              Vue.js Frontend → Leaflet Map
```

---

## 🎓 Penggunaan untuk Skripsi

### Bab 2: Analisis Sistem
```
Gunakan:
- Diagram 1: Use Case (feature overview)
- Diagram 7: Flowchart (system flow overview)
```

### Bab 3: Perancangan Sistem
```
Gunakan:
- Diagram 8: ER Diagram (database design)
- Diagram 9: Architecture (system architecture)
- Diagram 2: Activity - Geofence Detection (core logic)
```

### Bab 4: Implementasi
```
Gunakan:
- Diagram 3: Activity - Login (authentication flow)
- Diagram 4-6: Sequence Diagrams (API interactions)
```

---

## 💡 Tips Penggunaan

### Online Preview (No Installation):
1. Buka https://www.plantuml.com/plantuml/uml/
2. Copy-paste konten dari .puml file
3. Instant preview!

### VS Code Preview:
1. Install extension "PlantUML"
2. Right-click file → "PlantUML: Preview"
3. Auto-update saat edit

### Export untuk Presentasi:
```bash
# Mac/Linux
plantuml -Tpng 01_UseCase.puml -o output/

# Windows (dengan PlantUML installed)
java -jar plantuml.jar -Tpng 01_UseCase.puml
```

---

## 🔍 Cek Detail Diagram

| # | Diagram | Key Points | Best For |
|---|---------|-----------|----------|
| 1 | Use Case | 13 use cases, 2 actors | Feature overview |
| 2 | Geofence Activity | Ray Casting algorithm, parallel notifications | Core logic |
| 3 | Login Activity | JWT token, bcryptjs, LocalStorage | Security |
| 4 | Real-time Sequence | Polling 5 sec, map update | Real-time feature |
| 5 | Create Geofence | GeoJSON polygon, drawing | User interaction |
| 6 | N8N Sequence | Webhook, multi-channel, async | Notifications |
| 7 | Flowchart | 3 jalur system flow | Big picture |
| 8 | ER Diagram | 5 entities, 5 relationships, indexes | Database |
| 9 | Architecture | 6 layers, 9 components | Technical design |

---

## ❗ Penting: Format PlantUML

Semua file menggunakan format **PlantUML** (syntax UML text-based):

```
@startuml
... diagram content ...
@enduml
```

**Keuntungan:**
✅ Version control friendly (plain text)
✅ Easy to edit (text editor apapun)
✅ Dapat di-integrate ke Git
✅ Export ke berbagai format (PNG, SVG, PDF)
✅ Open source & free

**Format dukung:**
- UML: Use Case, Activity, Sequence, Class, Component, State, Deployment
- Non-UML: Flowchart, ER Diagram, Gantt, Architecture, DDD

---

## 🎨 Color Scheme

- **Blue**: User/Frontend activities
- **Green**: Success/Valid states
- **Red**: Warning/Violation/Error states
- **Orange**: Processes/Actions
- **Gray**: Database/Storage

---

## 📞 Troubleshooting

**Masalah: Diagram tidak tampil**
→ Cek syntax di https://www.plantuml.com/plantuml/uml/

**Masalah: Text terlalu kecil**
→ Zoom browser atau adjust font size di .puml

**Masalah: Mau customize warna**
→ Edit skin params di awal file:
```
skinparam backgroundColor #FEFEFE
skinparam sequenceArrowThickness 2
```

---

## 📚 Rekomendasi Order Presentasi

1. **Diagram 9**: Architecture (penjelasan teknis overall)
2. **Diagram 1**: Use Case (fitur yang tersedia)
3. **Diagram 7**: Flowchart (alur sistem)
4. **Diagram 3**: Login Activity (authentication)
5. **Diagram 2**: Geofence Activity (core logic)
6. **Diagram 4-6**: Sequence (implementasi detail)
7. **Diagram 8**: ER Diagram (database design)

---

## ✨ Customization Tips

Ingin customize diagram? Edit file .puml:

```
# Ubah warna background
skinparam backgroundColor #ffffff

# Ubah font size
skinparam defaultFontSize 12

# Ubah actor color
skinparam actorBackgroundColor #87CEEB

# Ubah line style
skinparam linetype ortho  # orthogonal lines
```

---

**Created: 2024 | For GPS Vehicle Tracking System Thesis**

Pertanyaan? Lihat `README.md` untuk dokumentasi lengkap!
