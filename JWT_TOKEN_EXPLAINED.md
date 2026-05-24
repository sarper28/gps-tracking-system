# 🔐 Penjelasan JWT Token: Tempat Penyimpanan & Cara Lihatnya

## 📍 RINGKASAN SINGKAT

| Pertanyaan | Jawaban |
|-----------|---------|
| **Token muncul di mana?** | Response dari `/api/auth/login` atau `/api/auth/register` |
| **Disimpan di mana?** | **LocalStorage** browser (key: `"token"`) |
| **Cara lihat token?** | **Developer Tools** browser (F12 → Application → LocalStorage) |
| **Digunakan untuk apa?** | Autentikasi setiap request ke API (header: `Authorization: Bearer {token}`) |
| **Berlaku berapa lama?** | **7 hari** (bisa logout manual sebelumnya) |

---

## 🔄 ALUR JWT: Register → Login → Simpan → Gunakan

### STEP 1️⃣: REGISTER (Buat Akun Baru)

```
┌─ User ─┐
│ Input: │
│ - Nama │
│ - Email
│ - Password
└────────┘
    ↓
    POST /api/auth/register
    {
      "name": "John Doe",
      "email": "john@example.com",
      "password": "password123"
    }
    ↓
┌──────────────────────────────────┐
│ BACKEND (Node.js + Express)      │
│                                  │
│ 1. Validasi input                │
│ 2. Hash password dengan bcrypt   │
│ 3. Simpan user ke MongoDB        │
│ 4. Generate JWT token            │
│    jwt.sign({id: userId},        │
│             secret,              │
│             {expiresIn: "7d"})   │
└──────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ RESPONSE 201 Created:                   │
│                                         │
│ {                                       │
│   "success": true,                      │
│   "message": "User registered...",      │
│   "token": "eyJhbGci....",             │ ← JWT TOKEN!
│   "user": {                             │
│     "id": "507f1f77bcf86cd799439011",  │
│     "name": "John Doe",                 │
│     "email": "john@example.com"         │
│   }                                     │
│ }                                       │
└─────────────────────────────────────────┘
```

---

### STEP 2️⃣: LOGIN (Masuk ke Akun)

```
┌──────────────────┐
│ User Input:      │
│ - Email          │
│ - Password       │
└──────────────────┘
    ↓
    POST /api/auth/login
    {
      "email": "john@example.com",
      "password": "password123"
    }
    ↓
┌────────────────────────────────────────┐
│ BACKEND:                               │
│                                        │
│ 1. Cari user dengan email ini         │
│ 2. Bandingkan password (bcryptjs)      │
│ 3. Password cocok?                     │
│    ├─ YES → Generate JWT token         │
│    └─ NO → Return error 401            │
│ 4. Return token di response            │
└────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────┐
│ RESPONSE 200 OK:                     │
│                                      │
│ {                                    │
│   "success": true,                   │
│   "message": "Login successful",     │
│   "token": "eyJhbGci....",          │ ← JWT TOKEN!
│   "user": {...}                      │
│ }                                    │
└──────────────────────────────────────┘
```

---

### STEP 3️⃣: SIMPAN TOKEN (di LocalStorage Browser)

**File: `/frontend/src/pages/Login.vue` (Baris 48)**

```javascript
// Setelah login berhasil:
async handleLogin() {
  try {
    const response = await api.loginUser(this.form);
    
    // ✅ SIMPAN TOKEN DI LOCALSTORAGE
    localStorage.setItem("token", response.data.token);  // ← TOKEN DISIMPAN DI SINI!
    
    // ✅ SIMPAN USER INFO
    localStorage.setItem("user", JSON.stringify(response.data.user));
    
    // ✅ REDIRECT KE DASHBOARD
    this.$router.push("/dashboard");
    
  } catch (error) {
    this.error = error.response?.data?.message || "Login failed";
  }
}
```

**Apa itu LocalStorage?**
- Tempat penyimpanan di **browser** untuk data yang persisten
- Data tetap ada meski tab ditutup atau browser direstart
- Max size: ~5-10 MB
- Aksesibel dari halaman yang sama origin

---

### STEP 4️⃣: LIHAT TOKEN (di DevTools)

#### Cara Lihat Token:

**1. Buka Developer Tools**
```
Windows: F12 atau Ctrl+Shift+I
Mac: Cmd+Option+I
```

**2. Pergi ke Tab "Application" (Chrome) atau "Storage" (Firefox)**
```
Chrome:  DevTools → Application → LocalStorage → http://localhost:3000
Firefox: DevTools → Storage → Local Storage → http://localhost:3000
```

**3. Cari key `"token"`**
```
LocalStorage:
├─ token    : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTcwMjUyMzQ1MSwiZXhwIjoxNzAzMTI4MjUxfQ.x8y9z0..."
└─ user     : "{\"id\":\"507f1f77bcf86cd799439011\",\"name\":\"John Doe\",...}"
```

**4. Klik di value untuk lihat full token**

---

## 🔍 APA YANG TERDAPAT DI JWT TOKEN?

JWT Token terdiri dari 3 bagian dipisahkan oleh titik (`.`):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTcwMjUyMzQ1MSwiZXhwIjoxNzAzMTI4MjUxfQ.
x8y9z0abc123def456...
│                                                  │                                                     │
├─ HEADER (base64)                                ├─ PAYLOAD (base64)                                   └─ SIGNATURE (base64)
│                                                  │
├─ Tipe token: JWT                                ├─ id (user ID)
├─ Algorithm: HS256                               ├─ iat (issued at): waktu pembuatan
                                                   ├─ exp (expiration): waktu expired
```

**Decode payload:**
```json
{
  "id": "507f1f77bcf86cd799439011",  // User ID di database
  "iat": 1702523451,                   // Waktu pembuatan (timestamp)
  "exp": 1703128251                    // Waktu expired (7 hari dari sekarang)
}
```

**Cara lihat isi token:**
Buka https://jwt.io dan paste token di "Encoded" section
(⚠️ Jangan share token pribadi ke website yang tidak terpercaya!)

---

## 📤 STEP 5: GUNAKAN TOKEN (untuk setiap API Request)

**File: `/frontend/src/services/api.js` (Baris 13-19)**

```javascript
// Axios interceptor - otomatis tambah token ke setiap request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");  // ← AMBIL TOKEN DARI LOCALSTORAGE
  
  if (token) {
    // Tambah token ke header Authorization
    config.headers.Authorization = `Bearer ${token}`;  // ← FORMAT: "Bearer {token}"
  }
  
  return config;
});
```

**Contoh Request dengan Token:**
```
GET /api/vehicles
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTcwMjUyMzQ1MSwiZXhwIjoxNzAzMTI4MjUxfQ.x8y9z0...
```

**Backend menerima dan memverifikasi:**
```javascript
// File: /backend/src/middleware/authenticate.js
const token = req.headers.authorization?.split(" ")[1];  // Extract token dari header
const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verifikasi token
req.user = decoded;  // Simpan user ID di request
// Jika token valid, lanjut ke controller
// Jika invalid/expired, return error 401
```

---

## 🎯 VISUALISASI LENGKAP: Dari Login hingga Gunakan Token

```
┌─────────────────────────────────────────────────────────────────────┐
│ USER LOGIN PAGE (http://localhost:3000/login)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Input Email & Password                                             │
│  ↓                                                                   │
│  Click "Login" Button                                               │
│  ↓                                                                   │
│  POST /api/auth/login                                               │
│  {email, password}                                                   │
│  ↓                                                                   │
├─────────────────────────────────────────────────────────────────────┤
│ BACKEND API (http://localhost:5000/api)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Validasi email & password                                        │
│  2. Query MongoDB: cari user dengan email ini                        │
│  3. bcryptjs.compare(inputPassword, dbPassword)                      │
│  4. Generate JWT: jwt.sign({id: user._id}, secret, {exp: 7d})       │
│  5. Response 200:                                                    │
│     {                                                                │
│       "token": "eyJhbGci...",                                        │
│       "user": {id, name, email}                                      │
│     }                                                                │
│  ↓                                                                   │
├─────────────────────────────────────────────────────────────────────┤
│ FRONTEND (Browser JavaScript)                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  const response = await api.loginUser(form)                          │
│  ↓                                                                   │
│  response.data.token = "eyJhbGci..."                                 │
│  ↓                                                                   │
│  localStorage.setItem("token", response.data.token)                  │
│  ✅ TOKEN SEKARANG DISIMPAN DI LOCALSTORAGE!                         │
│  ↓                                                                   │
│  Navigate ke /dashboard                                             │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│ SETIAP REQUEST KE API (misal: GET /api/vehicles)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Axios Interceptor:                                                 │
│    const token = localStorage.getItem("token")  ← AMBIL DARI STORAGE │
│    config.headers.Authorization = `Bearer ${token}`                  │
│  ↓                                                                   │
│  GET /api/vehicles                                                  │
│  Headers:                                                            │
│    Authorization: Bearer eyJhbGci...                                 │
│  ↓                                                                   │
│  Backend Middleware (authenticate.js):                              │
│    const token = extractTokenFromHeader()                            │
│    const decoded = jwt.verify(token, secret)  ← VERIFIKASI TOKEN     │
│    if (valid) → req.user = {id: user_id}                             │
│    if (invalid) → return 401 Unauthorized                            │
│  ↓                                                                   │
│  Controller dapat akses req.user.id                                  │
│  ✅ SEKARANG BACKEND TAHU SIAPA USER INI!                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔑 CONTOH PRAKTIS: Step-by-Step di Browser

### Simulasi Complete Flow:

**1. Buka http://localhost:3000 di browser**

**2. Masuk ke halaman Login**
```
URL: http://localhost:3000/login
```

**3. Input Credentials**
```
Email: user@example.com
Password: password123
```

**4. Klik Login**
```
→ POST ke backend
→ Backend return token
→ Frontend save ke localStorage
→ Redirect ke dashboard
```

**5. Buka DevTools (F12)**
```
Application → LocalStorage → http://localhost:3000
```

**6. Lihat Token**
```
localStorage:
├─ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTcwMjUyMzQ1MSwiZXhwIjoxNzAzMTI4MjUxfQ.x8y9z0..."
└─ user: "{"id":"507f1f77bcf86cd799439011","name":"John Doe","email":"user@example.com"}"
```

**7. Copy token dan cek di jwt.io**
```
Pergi ke https://jwt.io
Paste token di "Encoded"
Lihat payload + verify signature
```

**8. Network Tab - Lihat Token di Header**
```
Buka DevTools → Network Tab
Klik salah satu request ke /api/
Headers → Authorization: Bearer eyJhbGci...
```

---

## ⚠️ PENTING: Token Security

### Jangan Lakukan:
❌ Jangan simpan password (selalu hash!)
❌ Jangan share token dengan orang lain
❌ Jangan hardcode token di code
❌ Jangan kirim token via email
❌ Jangan expose token di console log

### Lakukan:
✅ Simpan token di localStorage atau sessionStorage
✅ Kirim token via Authorization header
✅ Token expire setelah waktu tertentu
✅ Logout = delete token dari localStorage
✅ Gunakan HTTPS untuk transmit data

---

## 🔓 LOGOUT: Hapus Token

**File: `/frontend/src/pages/...` (logout handler)**

```javascript
// Logout function
function logout() {
  // Hapus token dari localStorage
  localStorage.removeItem("token");  // ← HAPUS TOKEN!
  localStorage.removeItem("user");
  
  // Redirect ke login page
  window.location.href = "/login";
  
  // Sekarang user tidak punya token, tidak bisa akses protected routes
}
```

---

## 🎓 SUMMARY: Alur Lengkap JWT

```
┌──────────────────────────────────────────────────────────┐
│ REGISTER / LOGIN                                         │
├──────────────────────────────────────────────────────────┤
│ 1. User submit email & password                          │
│ 2. Backend generate JWT token                            │
│ 3. Return token di response                              │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ SIMPAN TOKEN                                             │
├──────────────────────────────────────────────────────────┤
│ localStorage.setItem("token", response.data.token)       │
│ ✅ Token sekarang disimpan di browser LocalStorage       │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ LIHAT TOKEN                                              │
├──────────────────────────────────────────────────────────┤
│ F12 → Application → LocalStorage → cari key "token"      │
│ ✅ Bisa lihat token value di sini                        │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ GUNAKAN TOKEN                                            │
├──────────────────────────────────────────────────────────┤
│ Setiap request API:                                      │
│ GET /api/vehicles                                        │
│ Headers: Authorization: Bearer {token}                   │
│ ✅ Backend verifikasi token → allow request              │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ LOGOUT (Hapus Token)                                     │
├──────────────────────────────────────────────────────────┤
│ localStorage.removeItem("token")                         │
│ ✅ Token dihapus → user tidak bisa akses protected API   │
└──────────────────────────────────────────────────────────┘
```

---

## 📞 Quick Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Token tidak muncul di LocalStorage | Cek Network tab → Response login apakah return token? |
| Can't find LocalStorage di DevTools | Pastikan di tab "Application" (bukan Console) |
| Token terlihat random/panjang | Normal! JWT berbentuk base64 encoding |
| Login gagal, status 401 | Password salah atau user tidak terdaftar |
| API return 401 Unauthorized | Token sudah expired atau invalid, perlu login ulang |
| LocalStorage kosong setelah restart browser | Ini normal! Hapus localStorage pada logout atau force logout |

---

## 🔗 Files Reference

**Backend:**
- `/backend/src/controllers/authController.js` → Login/Register logic
- `/backend/src/utils/jwt.js` → Generate & verify token
- `/backend/src/middleware/authenticate.js` → Token verification middleware

**Frontend:**
- `/frontend/src/pages/Login.vue` → Login page (token saving)
- `/frontend/src/services/api.js` → Axios interceptor (token usage)
- `/frontend/src/router.js` → Protected routes check

---

**Semoga sudah jelas! 🎓 Token JWT muncul dari backend saat login, disimpan di browser LocalStorage, dan digunakan untuk setiap request API selanjutnya.**
