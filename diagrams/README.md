# 📊 Dokumentasi Diagram Sistem GPS Vehicle Tracking

Folder ini berisi **9 diagram profesional** dalam format **PlantUML** untuk skripsi Anda. Semua diagram dirancang dengan tema rapi dan mudah dibaca.

---

## 📋 Daftar Diagram

### 1. **Use Case Diagram** 
📄 File: `01_UseCase.puml`

**Deskripsi:**
- Menampilkan semua use case dalam sistem
- Menunjukkan interaksi antara User dan sistem
- Mencakup 13 use case utama (Register, Login, Monitor, Create Geofence, dll)
- Menampilkan relationship antar use case

**Yang ditampilkan:**
```
- UC1: Register User
- UC2: Login
- UC3: View Dashboard
- UC4: Add Vehicle
- UC5: Monitor Vehicle Location
- UC6: Create Geofence
- UC7: Detect Geofence Violation
- UC8: Receive Notification
- UC9: View Violation History
- Dan lainnya...
```

---

### 2. **Activity Diagram - Geofence Violation Detection**
📄 File: `02_Activity_GeofenceViolation.puml`

**Deskripsi:**
Menampilkan **alur lengkap proses deteksi pencerobohan geofence** dari awal hingga notifikasi dikirim.

**Alur proses:**
1. Backend menerima GPS location dari device
2. Validasi input data
3. Query geofence yang aktif
4. Loop: Jalankan Ray Casting Algorithm untuk setiap geofence
5. Jika ada violation:
   - Buat LocationLog dengan isViolation=true
   - Trigger N8N webhook
   - N8N mengirim notifikasi via Email, Telegram, WhatsApp (parallel)
   - Buat Notification Log
6. Jika tidak ada violation:
   - Update location biasa saja

**Fitur special:**
- Fork/join untuk notifikasi parallel
- Validasi input
- Geofence check logic

---

### 3. **Activity Diagram - Login & Autentikasi**
📄 File: `03_Activity_LoginAuth.puml`

**Deskripsi:**
Menampilkan **alur lengkap proses login dan autentikasi** pengguna.

**Alur proses:**
1. User input email & password
2. Kirim POST request ke backend
3. Validasi format input
4. Query database cari user
5. Validasi password dengan bcryptjs
6. Generate JWT Token (7 hari validity)
7. Simpan token di LocalStorage
8. Redirect ke Dashboard

**Security notes:**
- Password di-hash dengan bcryptjs (never plain text)
- JWT token dengan expiration
- Token disimpan di browser LocalStorage

---

### 4. **Sequence Diagram - Real-time Monitoring**
📄 File: `04_Sequence_RealtimeMonitoring.puml`

**Deskripsi:**
Menampilkan **interaksi antara Frontend dan Backend** untuk real-time vehicle monitoring.

**Alur:**
1. Frontend polling setiap 5 detik untuk update location
2. Backend query latest location dari database
3. Update marker di map (warna hijau = normal, merah = violation)
4. Display di sidebar

**Optimization notes:**
- Polling approach (simple, works in all browsers)
- Better alternative: WebSocket untuk ultra-low latency
- Database query dengan index optimization

---

### 5. **Sequence Diagram - Create Geofence**
📄 File: `05_Sequence_CreateGeofence.puml`

**Deskripsi:**
Menampilkan **proses pembuatan geofence** dari UI hingga tersimpan di database.

**Alur:**
1. User buka halaman Geofences
2. Klik "Create New Geofence"
3. Gambar polygon pada map dengan klik-klik points
4. Input nama dan deskripsi
5. Validasi (min 3 points, nama tidak kosong)
6. Kirim POST ke backend
7. Backend validasi GeoJSON format
8. Insert ke MongoDB
9. Return success response
10. Refresh geofences list di UI

**Format GeoJSON:**
```json
{
  "type": "Polygon",
  "coordinates": [[[lon1, lat1], [lon2, lat2], [lon3, lat3], [lon1, lat1]]]
}
```

---

### 6. **Sequence Diagram - N8N Notification**
📄 File: `06_Sequence_N8NNotification.puml`

**Deskripsi:**
Menampilkan **alur lengkap sistem notifikasi otomatis via N8N**.

**Alur:**
1. GPS Device kirim location ke Backend
2. Backend deteksi violation
3. Backend trigger N8N webhook dengan payload violation
4. N8N receive webhook
5. N8N jalankan workflow:
   - **Parallel**: Send Email + Send Telegram + Send WhatsApp
   - Log notification status ke database
6. User menerima notifikasi di multiple channels

**Keuntungan N8N:**
- Decoupling dari backend
- Asynchronous processing (non-blocking)
- Easy to configure multi-channel
- Retry mechanism
- Workflow flexibility

---

### 7. **Flowchart - System Flow**
📄 File: `07_Flowchart_System.puml`

**Deskripsi:**
Menampilkan **alur kerja keseluruhan sistem** dengan 3 jalur utama.

**3 Jalur:**

**Jalur 1: User Activity**
- Register → Login → Add Vehicle → Create Geofence
- View Dashboard dengan real-time tracking
- View violation history

**Jalur 2: GPS Device Activity**
- Device send location setiap X detik
- Backend validasi dan cari vehicle
- Geofence check dengan Ray Casting
- Trigger N8N untuk notifikasi
- Return response

**Jalur 3: Monitoring & Analysis**
- View vehicle history
- View violations
- Export data/reports

**Decision points:**
- Database connection OK?
- Vehicle exists?
- Any geofence?
- Any violation?

---

### 8. **Entity Relationship Diagram - Database Design**
📄 File: `08_ER_DatabaseDesign.puml`

**Deskripsi:**
Menampilkan **struktur database lengkap** dengan semua koleksi dan relationship.

**Koleksi (5):**

**1. Users**
```
- _id, name, email, password (hashed)
- notifConfig: {email, telegram, whatsapp}
- timestamps
```

**2. Vehicles**
```
- _id, userId (FK), vehicleName, deviceId
- currentLocation (GeoJSON Point)
- lastUpdated, isActive
- timestamps
```

**3. Geofences**
```
- _id, userId (FK), name
- geometry (GeoJSON Polygon)
- isActive, description, color
- timestamps
```

**4. LocationLogs**
```
- _id, vehicleId (FK), location (GeoJSON Point)
- isViolation, violatedGeofences (FK array)
- accuracy, speed, heading, altitude, timestamp
```

**5. NotificationLogs**
```
- _id, vehicleId (FK), geofenceId (FK), userId (FK)
- channel (email|telegram|whatsapp|webhook)
- status (pending|sent|failed)
- message, violationDetails, sentAt
```

**Relationship:**
- Users owns Vehicles (1-M)
- Users creates Geofences (1-M)
- Vehicles generates LocationLogs (1-M)
- LocationLogs triggers NotificationLogs (1-M)

**Indexing:**
- Primary indexes on _id
- Foreign key indexes untuk joins
- Geospatial index (2dsphere) untuk location queries
- Unique indexes pada email, deviceId

---

### 9. **Architecture Diagram - System Architecture**
📄 File: `09_Architecture_MonitoringVehicles.puml`

**Deskripsi:**
Menampilkan **arsitektur keseluruhan sistem** dengan 6 layer utama.

**6 Layer:**

**1. IoT Devices Layer**
- GPS Device (Android/IoT)
- Mengirim location HTTPS POST setiap 30 detik

**2. Presentation Layer**
- Web Browser (Vue.js 3)
- Interactive Map (Leaflet.js)
- Responsive UI (Dashboard, Vehicles, Geofences)
- Port 3000

**3. API Layer / Backend**
- Express.js Server (Port 5000)
- Authentication Middleware (JWT)
- Request Validation
- Rate Limiting (DDoS Protection)

**4. Business Logic Layer**
- Location Controller (GPS handler)
- Vehicle Controller (CRUD)
- Geofence Controller (CRUD)
- Auth Controller (Login/Register)

**5. Geofencing Logic**
- Ray Casting Algorithm
- Violation Detection & Logger

**6. Data Layer**
- MongoDB (NoSQL)
- Collections: users, vehicles, geofences, locationlogs, notificationlogs
- Geospatial indexing
- Replica Set (HA)

**External:**
- N8N (Notification Service)
- Email, Telegram, WhatsApp APIs
- OpenStreetMap (Map tiles)

---

## 🎨 Cara Membaca Diagram

### Format PlantUML
Semua diagram menggunakan format **PlantUML** yang dapat dibuka dengan:

1. **Online Editor**: https://www.plantuml.com/plantuml/uml/
   - Copy-paste konten file .puml
   - Instant preview

2. **VS Code Extension**:
   - Install extension: "PlantUML"
   - Right-click file → Preview
   - Auto-render semua diagram

3. **Command Line** (jika sudah install):
   ```bash
   plantuml 01_UseCase.puml -o output/
   ```

4. **Github**: PlantUML otomatis rendered di Github

---

## 📐 Spesifikasi Teknis Setiap Diagram

| No | Diagram | Type | Elements | Color Scheme |
|---|---------|------|----------|--------------|
| 1 | UseCase | UML | 13 use cases, 2 actors | Blue theme |
| 2 | GeofenceViolation | Activity | 20+ nodes, fork/join | Green/Red |
| 3 | LoginAuth | Activity | 15+ nodes, decision | Blue/Green |
| 4 | RealtimeMonitoring | Sequence | 6 participants, loops | Gradient |
| 5 | CreateGeofence | Sequence | 7 participants, alt blocks | Neutral |
| 6 | N8NNotification | Sequence | 9 participants, parallel | Multi-color |
| 7 | SystemFlow | Flowchart | 3 jalur, split/merge | Orange/Blue |
| 8 | DatabaseDesign | ER Diagram | 5 entities, 5 relationships | Gray/Blue |
| 9 | Architecture | Component | 6 frames, multiple layers | Professional |

---

## ✨ Fitur Khusus Diagram Ini

✅ **Professional Quality**: Cocok untuk skripsi/presentasi
✅ **Readability**: Font besar, colors berbeda untuk clarity
✅ **Complete**: Semua detail sistem tertangkap
✅ **Maintainable**: Format PlantUML mudah diupdate
✅ **Scalable**: Bisa di-export ke berbagai format (PNG, SVG, PDF)

---

## 🚀 Rekomendasi Penggunaan

### Untuk Skripsi:
1. **Bab Analisis**: Gunakan **Use Case + Activity Diagrams**
2. **Bab Perancangan**: Gunakan **ER Diagram + Architecture**
3. **Bab Implementasi**: Gunakan **Sequence + Flowchart**

### Untuk Presentasi:
1. Start dengan **Architecture Diagram** (big picture)
2. Deep dive dengan **Use Case + Activity Diagrams**
3. Technical detail dengan **Sequence + ER Diagram**

### Export Tips:
```bash
# Export ke PNG (high quality)
plantuml -Tpng *.puml

# Export ke PDF
plantuml -Tpdf *.puml

# Export ke SVG (scalable)
plantuml -Tsvg *.puml
```

---

## 📝 Catatan untuk Skripsi

Setiap diagram dapat dimasukkan ke laporan dengan caption:

```
Gambar X: Diagram Use Case Sistem GPS Vehicle Tracking
Sumber: Hasil analisis sistem (2024)

Keterangan: Diagram menampilkan 13 use case utama 
dalam sistem GPS tracking, mencakup user activities 
seperti registration, login, vehicle monitoring, 
geofence creation, dan violation detection.
```

---

## ❓ FAQ

**Q: Bisakah saya edit diagram?**
A: Ya! Edit file .puml dengan text editor, maka preview otomatis update.

**Q: Format apa yang terbaik untuk printed thesis?**
A: PNG dengan DPI tinggi (300 DPI) atau PDF vector.

**Q: Diagram mana yang paling penting?**
A: Use Case (overview) + Architecture (technical) adalah yang fundamental.

**Q: Bisa di-customize?**
A: Tentu! Edit warna, fonts, layout sesuai template skripsi Anda.

---

**Happy Thesis Writing! 🎓📚**

Created for GPS Vehicle Tracking System - Final Year Project (2024)
