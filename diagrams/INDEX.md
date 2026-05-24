# 📊 Index Diagram Sistem GPS Vehicle Tracking

**Tujuan**: Dokumentasi visual lengkap untuk skripsi Anda
**Format**: PlantUML (dapat di-preview online atau di VS Code)
**Total**: 9 Diagram + 3 File Dokumentasi

---

## 📋 Daftar Lengkap Diagram

### ✅ Diagram 1: Use Case Diagram
- **File**: `01_UseCase.puml`
- **Deskripsi**: Menampilkan 13 use case utama + 2 actors (User & GPS Device)
- **Tujuan**: Identifikasi fitur-fitur sistem secara overview
- **Use Case**: 
  - Register User, Login, View Dashboard
  - Add Vehicle, Monitor Location
  - Create Geofence, Detect Violation, Receive Notification
  - View History, Manage Profile, Submit GPS Location
- **Best for**: Bab Analisis Kebutuhan

---

### ✅ Diagram 2: Activity Diagram - Geofence Violation Detection
- **File**: `02_Activity_GeofenceViolation.puml`
- **Deskripsi**: Alur lengkap deteksi pencerobohan geofence dari GPS input hingga notifikasi
- **Highlights**:
  - Ray Casting Algorithm untuk point-in-polygon detection
  - Parallel notifications (Email + Telegram + WhatsApp via N8N)
  - LocationLog logging
  - Geofence iteration logic
- **Activities**: 20+ activities dengan decision points & fork/join
- **Best for**: Bab Perancangan - Logika Inti Sistem

---

### ✅ Diagram 3: Activity Diagram - Login & Autentikasi
- **File**: `03_Activity_LoginAuth.puml`
- **Deskripsi**: Alur lengkap proses login dari input credentials hingga akses dashboard
- **Highlights**:
  - Email & password validation
  - bcryptjs password comparison
  - JWT token generation (7 hari expiry)
  - LocalStorage token storage
  - Redirect ke dashboard
- **Activities**: 15+ activities dengan validation & decision logic
- **Best for**: Bab Implementasi - Security & Authentication

---

### ✅ Diagram 4: Sequence Diagram - Real-time Vehicle Monitoring
- **File**: `04_Sequence_RealtimeMonitoring.puml`
- **Deskripsi**: Interaksi Frontend-Backend untuk real-time vehicle tracking dengan polling
- **Participants**: 
  - Frontend (Vue.js)
  - Browser LocalStorage
  - Backend API (Express)
  - MongoDB
- **Highlights**:
  - Polling setiap 5 detik
  - Location update dengan isViolation flag
  - Map marker update (hijau = normal, merah = violation)
  - Database optimization notes
- **Best for**: Bab Implementasi - Real-time Features

---

### ✅ Diagram 5: Sequence Diagram - Create Geofence
- **File**: `05_Sequence_CreateGeofence.puml`
- **Deskripsi**: Alur pembuatan geofence dari UI drawing hingga tersimpan di database
- **Participants**:
  - User (Frontend)
  - Vue.js Frontend
  - Leaflet.js Map
  - Backend API
  - Middleware Auth
  - Controller
  - MongoDB
- **Highlights**:
  - Interactive polygon drawing pada map
  - Koordinat collection dalam GeoJSON format
  - JWT authentication
  - Input validation (min 3 points, nama tidak kosong)
  - GeoJSON Polygon format storage
- **Best for**: Bab Implementasi - Geofence Management

---

### ✅ Diagram 6: Sequence Diagram - N8N Automatic Notification
- **File**: `06_Sequence_N8NNotification.puml`
- **Deskripsi**: Alur lengkap sistem notifikasi otomatis via N8N dari violation detection hingga user notification
- **Participants**:
  - GPS Device
  - Backend Location API
  - Geofence Detection Logic
  - N8N Webhook Endpoint
  - N8N Workflow
  - Email Service (SMTP)
  - Telegram Bot API
  - WhatsApp API
  - User Notification
  - MongoDB NotificationLog
- **Highlights**:
  - Webhook trigger dari backend ke N8N
  - Parallel notification channels
  - Multi-channel support (Email, Telegram, WhatsApp)
  - Notification logging & status tracking
  - Asynchronous workflow (non-blocking)
- **Best for**: Bab Implementasi - Notification System & N8N Integration

---

### ✅ Diagram 7: Flowchart - System Flow
- **File**: `07_Flowchart_System.puml`
- **Deskripsi**: Alur kerja keseluruhan sistem dengan 3 jalur utama (User, Device, Monitoring)
- **3 Jalur**:
  1. **User Activity**: Register, Login, Add Vehicle, Create Geofence, View Dashboard
  2. **GPS Device Activity**: Submit location, Geofence check, Violation detection, N8N trigger
  3. **Monitoring & Analysis**: View history, View violations, Export reports
- **Highlights**:
  - Parallel processing (fork/merge)
  - Decision points (connection check, vehicle exists, violation?)
  - Ray Casting algorithm notation
  - Real-time polling explanation
- **Best for**: Bab Analisis - System Overview

---

### ✅ Diagram 8: Entity Relationship Diagram - Database Design
- **File**: `08_ER_DatabaseDesign.puml`
- **Deskripsi**: Struktur lengkap MongoDB database dengan 5 koleksi utama & relationships
- **Koleksi**:
  1. **Users**: name, email, password (hashed), notifConfig (email/telegram/whatsapp)
  2. **Vehicles**: vehicleName, deviceId, currentLocation (GeoJSON Point), lastUpdated, isActive
  3. **Geofences**: name, geometry (GeoJSON Polygon), isActive, description, color
  4. **LocationLogs**: location (GeoJSON Point), isViolation, violatedGeofences[], accuracy, speed, heading
  5. **NotificationLogs**: vehicleId, geofenceId, userId, channel, status, violationDetails
- **Relationships**:
  - Users 1-M Vehicles
  - Users 1-M Geofences
  - Vehicles 1-M LocationLogs
  - Geofences 1-M LocationLogs
  - LocationLogs 1-M NotificationLogs
- **Indexes**:
  - Primary (ObjectId)
  - Foreign keys (userId, vehicleId, geofenceId)
  - Unique (email, deviceId)
  - Geospatial (2dsphere untuk location queries)
  - TTL (auto-delete old records)
- **Best for**: Bab Perancangan - Database Design

---

### ✅ Diagram 9: Architecture Diagram - System Architecture
- **File**: `09_Architecture_MonitoringVehicles.puml`
- **Deskripsi**: Arsitektur keseluruhan sistem dengan 6 layer + external services
- **6 Layer**:
  1. **IoT Devices Layer**: GPS devices (Android/IoT) mengirim HTTPS POST location
  2. **Presentation Layer**: Web browser (Vue.js), Leaflet map, responsive UI
  3. **API Layer**: Express.js REST API, JWT middleware, validation, rate limiting
  4. **Business Logic Layer**: Controllers (Location, Vehicle, Geofence, Auth)
  5. **Geofencing Logic**: Ray Casting algorithm, violation detection
  6. **Data Layer**: MongoDB dengan koleksi users, vehicles, geofences, locationlogs, notificationlogs
- **External Services**:
  - N8N Workflow Orchestrator
  - Email Service (SMTP)
  - Telegram Bot API
  - WhatsApp Business API
  - OpenStreetMap (map tiles)
- **Key Points**:
  - Port 3000 (Frontend), Port 5000 (Backend)
  - Async notification workflow
  - Multi-channel notification support
  - Geospatial database indexing
- **Best for**: Bab Perancangan - Technical Architecture

---

## 📚 Dokumentasi Pendukung

### File 1: `README.md` (Dokumentasi Lengkap)
- Penjelasan detail setiap diagram
- Spesifikasi teknis
- Tips penggunaan
- Format PlantUML info
- Export instructions

### File 2: `QUICK_REFERENCE.md` (Panduan Cepat)
- 5-minute quick view
- Quick lookup table
- Penggunaan untuk skripsi
- Troubleshooting tips
- Customization guide

### File 3: `INDEX.md` (File Ini)
- Overview semua diagram
- Daftar lengkap dengan highlight
- Quick navigation

---

## 🎯 Rekomendasi Penggunaan untuk Skripsi

### Bab 2: Analisis Sistem & Kebutuhan
```
Gunakan:
- Diagram 1 (Use Case) → Identifikasi fitur
- Diagram 7 (Flowchart) → Alur sistem umum
```

### Bab 3: Perancangan Sistem
```
Gunakan:
- Diagram 9 (Architecture) → Teknologi & komponen
- Diagram 8 (ER Diagram) → Desain database
- Diagram 2 (Activity Geofence) → Logika core
```

### Bab 4: Implementasi
```
Gunakan:
- Diagram 3 (Activity Login) → Auth implementation
- Diagram 4-6 (Sequence) → API interactions & workflows
```

### Bab 5: Pengujian & Evaluasi
```
Gunakan:
- Semua diagram → Untuk test case coverage
- Diagram 2 & 6 → Untuk notification testing
```

---

## 🎨 Fitur Diagram

Semua diagram memiliki fitur professional:

✅ **Clean & Professional Design** - Cocok untuk skripsi
✅ **Clear Color Coding** - Mudah dibedakan
✅ **Proper Typography** - Font size & style konsisten
✅ **Detailed Notes** - Penjelasan di setiap diagram
✅ **Version Control Friendly** - Plain text format
✅ **Export Multiple Formats** - PNG, SVG, PDF
✅ **Online Preview Available** - No installation needed
✅ **Easy to Customize** - Edit text & colors easily

---

## ⚡ Quick Start

### Untuk Preview Cepat:
1. Buka https://www.plantuml.com/plantuml/uml/
2. Copy-paste konten file .puml
3. Instant preview!

### Untuk VS Code Preview:
1. Install extension "PlantUML"
2. Right-click file → "PlantUML: Preview"
3. Auto-reload saat edit

### Untuk Export PNG:
```bash
# Jika sudah install PlantUML
plantuml -Tpng *.puml -o output/
```

---

## 📊 Statistik Diagram

| Diagram | Type | Elements | Complexity |
|---------|------|----------|------------|
| 1 | Use Case | 13 UC + 2 actors | Medium |
| 2 | Activity | 20+ nodes + fork/join | High |
| 3 | Activity | 15+ nodes + decision | Medium |
| 4 | Sequence | 4 participants + loop | Medium |
| 5 | Sequence | 7 participants + alt | Medium-High |
| 6 | Sequence | 9 participants + parallel | High |
| 7 | Flowchart | 3 jalur + split/merge | High |
| 8 | ER Diagram | 5 entities + relationships | Medium |
| 9 | Architecture | 6 frames + 9 components | High |

---

## 💡 Tips Penggunaan

1. **Untuk Presentasi**: Gunakan PNG 300 DPI untuk print quality
2. **Untuk Digital**: SVG lebih baik untuk zoom tanpa blur
3. **Untuk Web**: PNG 150 DPI sudah cukup
4. **Edit & Customize**: Edit .puml file sesuai kebutuhan
5. **Version Control**: Commit .puml file ke Git

---

## 🔍 Navigasi Cepat

- Lihat **README.md** untuk dokumentasi lengkap setiap diagram
- Lihat **QUICK_REFERENCE.md** untuk quick tips & troubleshooting
- Lihat **INDEX.md** (file ini) untuk overview

---

**Status**: ✅ Semua 9 diagram siap untuk skripsi Anda
**Created**: 2024 | GPS Vehicle Tracking System
**Format**: PlantUML (Open Standard)
**License**: Free to use for educational purposes

---

Happy Thesis Writing! 🎓📚🚗📍
