# 👀 CARA LIHAT JWT TOKEN DI BROWSER (Step-by-Step dengan Visual)

## 🎯 Quick Answer

**Token JWT disimpan di mana?**
→ Browser **LocalStorage**

**Cara lihat?**
→ **DevTools** (F12) → **Application** → **LocalStorage**

**Berlaku berapa lama?**
→ **7 hari** dari saat login

---

## 📺 VISUAL GUIDE: Lihat Token di DevTools

### STEP 1: Buka DevTools

**Tekan: `F12`** (atau `Ctrl+Shift+I` di Windows/Linux, `Cmd+Option+I` di Mac)

```
┌─────────────────────────────────────────────────────────────┐
│ Browser Window                                              │
├─────────────────────────────────────────────────────────────┤
│ Dashboard | Vehicles | Geofences | Logout                   │
├─────────────────────────────────────────────────────────────┤
│ ↓ DevTools terbuka di bawah ↓                               │
├──────────┬───────────────────────────────────────────────────┤
│ Elements │ Console | Network | Application | ... | Settings │
└──────────┴───────────────────────────────────────────────────┘
```

**Klik tab "Application"** (Chrome) atau **"Storage"** (Firefox)

---

### STEP 2: Pergi ke LocalStorage

```
Left Sidebar:
├─ Storage/Application
│  ├─ Cookies
│  ├─ Cache Storage
│  ├─ Session Storage
│  ├─ IndexedDB
│  ├─ Web SQL
│  └─ Local Storage ← KLIK DI SINI!
│     └─ http://localhost:3000
```

**Expand "Local Storage" → klik `http://localhost:3000`**

---

### STEP 3: Lihat Token

```
┌─────────────────────────────────────────────────────────────┐
│ LOCAL STORAGE - http://localhost:3000                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Key              │ Value                                   │
│ ─────────────────┼─────────────────────────────────────── │
│ token            │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ...  │
│ user             │ {"id":"507f1f77bcf86cd799439011",...}  │
│                  │                                         │
└─────────────────────────────────────────────────────────────┘
```

**Klik di kolom "Value" untuk lihat full token:**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTcwMjUyMzQ1MSwiZXhwIjoxNzAzMTI4MjUxfQ.x8y9z0abc123def456ghijklmnop...
```

---

## 🔎 DECODE TOKEN: Lihat Apa Isinya

### Cara 1: Gunakan Website jwt.io

**1. Buka:** https://jwt.io

```
┌────────────────────────────────────────────────────────────┐
│ JWT.IO - JWT Debugger                                      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Encoded (left side)          │  Decoded (right side)       │
│                              │                            │
│ eyJhbGciOiJIUzI1NiI...       │ HEADER:                    │
│ [Paste token here]           │ {                          │
│                              │   "alg": "HS256",          │
│                              │   "typ": "JWT"             │
│                              │ }                          │
│                              │                            │
│                              │ PAYLOAD:                   │
│                              │ {                          │
│                              │   "id": "507f...",         │
│                              │   "iat": 1702523451,       │
│                              │   "exp": 1703128251        │
│                              │ }                          │
│                              │                            │
│                              │ SIGNATURE:                 │
│                              │ ⚠️ Invalid Signature       │
│                              │ (Need secret to verify)    │
└────────────────────────────────────────────────────────────┘
```

**2. Copy token dari LocalStorage**
```
Dari DevTools:
Local Storage → token value → Copy
```

**3. Paste ke jwt.io di "Encoded" section**
```
[CTRL+V atau CMD+V]
```

**4. Lihat payload di sisi kanan**
```
Decoded akan menunjukkan:
{
  "alg": "HS256",         ← Algorithm
  "typ": "JWT",           ← Type
  "id": "507f1f77bcf...",  ← User ID
  "iat": 1702523451,       ← Issued At (waktu pembuatan)
  "exp": 1703128251        ← Expiration (7 hari kemudian)
}
```

---

### Cara 2: Manual Decode (Understand Format)

Token format: `header.payload.signature`

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTcwMjUyMzQ1MSwiZXhwIjoxNzAzMTI4MjUxfQ.x8y9z0...
│────────────────────────────────────────────│────────────────────────────────────────────────│─────────────────────────────
└─ Part 1: HEADER (base64)                  └─ Part 2: PAYLOAD (base64)                      └─ Part 3: SIGNATURE (base64)
```

**Decode part 2 (payload) secara manual:**

Gunakan online tools: https://www.base64decode.org/

```
1. Copy: eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTcwMjUyMzQ1MSwiZXhwIjoxNzAzMTI4MjUxfQ
2. Paste ke base64decode.org
3. Click "Decode"
4. Hasil:
   {"id":"507f1f77bcf86cd799439011","iat":1702523451,"exp":1703128251}
```

---

## ⏰ CEK EXPIRATION TOKEN

Token memiliki waktu expired (berakhir). Cara cek:

### Dari Decoded Payload:

```json
{
  "id": "507f1f77bcf86cd799439011",
  "iat": 1702523451,              ← Waktu buat (unix timestamp)
  "exp": 1703128251               ← Waktu expired (unix timestamp)
}
```

### Convert Unix Timestamp ke Readable Format:

**Website:** https://www.unixtimestamp.com/

```
Input:  1703128251
Output: 2023-12-21 12:30:51 (GMT)
```

**Atau di JavaScript:**
```javascript
const expTimestamp = 1703128251;
const expDate = new Date(expTimestamp * 1000);
console.log(expDate); // Tue Dec 21 2023 12:30:51 GMT+0000 (UTC)
```

**Atau di DevTools Console:**
```javascript
const token = localStorage.getItem("token");
// Split dan decode payload
const payload = token.split('.')[1];
const decoded = JSON.parse(atob(payload));
console.log("Expired at:", new Date(decoded.exp * 1000));
// Output: Expired at: Tue Dec 21 2023 12:30:51 GMT+0000 (UTC)
```

---

## 🔑 LIHAT TOKEN DI NETWORK TAB (Saat Request)

### STEP 1: Buka DevTools → Network Tab

```
Tekan: F12 → Network tab
```

### STEP 2: Buat API Request

```
Di dashboard, klik sesuatu yang trigger API request
Misal: View Vehicles, Create Geofence, dll
```

### STEP 3: Lihat Request di Network Tab

```
┌─────────────────────────────────────────────────┐
│ Network Tab                                     │
├─────────────────────────────────────────────────┤
│ Name                 Method  Status  Type       │
│ ────────────────────────────────────────        │
│ login                POST    200     fetch      │
│ vehicles             GET     200     fetch      │ ← Klik ini
│ geofences            GET     200     fetch      │
│ ...                                             │
└─────────────────────────────────────────────────┘
```

### STEP 4: Klik Request → Lihat Headers

```
Request Headers:
├─ Accept: application/json
├─ Authorization: Bearer eyJhbGciOiJIUzI1NiI...  ← TOKEN DI SINI!
├─ Content-Type: application/json
├─ ...
└─ ...

Response Headers:
├─ Content-Type: application/json
├─ Content-Length: 1234
├─ ...
└─ ...
```

**Token di request dikirim dengan header:**
```
Authorization: Bearer {token}
```

---

## 🧪 CONSOLE TEST: Cek Token Programmatically

**Buka DevTools → Console Tab**

Paste commands ini:

### 1️⃣ Check if token exists
```javascript
const token = localStorage.getItem("token");
console.log("Token exists:", !!token);
console.log("Token:", token);
```

### 2️⃣ Decode token payload
```javascript
const token = localStorage.getItem("token");
const payload = JSON.parse(atob(token.split('.')[1]));
console.log("Decoded Payload:", payload);
// Output: {id: "507f...", iat: 1702523451, exp: 1703128251}
```

### 3️⃣ Check if token expired
```javascript
const token = localStorage.getItem("token");
const payload = JSON.parse(atob(token.split('.')[1]));
const expTime = payload.exp * 1000;
const isExpired = Date.now() > expTime;
console.log("Token expired:", isExpired);
console.log("Expires at:", new Date(expTime));
```

### 4️⃣ Get user info stored
```javascript
const user = JSON.parse(localStorage.getItem("user"));
console.log("Current user:", user);
// Output: {id: "507f...", name: "John Doe", email: "john@example.com"}
```

### 5️⃣ Clear token (logout)
```javascript
localStorage.removeItem("token");
localStorage.removeItem("user");
console.log("Token cleared!");
```

---

## 📱 Screenshot Reference

### Jika melihat ini di LocalStorage: ✅ BAGUS
```
┌──────────────────────────────────────────────┐
│ Key      │ Value                             │
├──────────┼───────────────────────────────────┤
│ token    │ eyJhbGciOiJIUzI1NiI... (panjang) │
│ user     │ {"id":"507f...","name":"John"}   │
└──────────────────────────────────────────────┘
```

### Jika LocalStorage kosong: ❌ BELUM LOGIN
```
┌──────────────────────────────────────────────┐
│ Key      │ Value                             │
├──────────┼───────────────────────────────────┤
│ (kosong) │                                   │
└──────────────────────────────────────────────┘
```
→ Berarti belum login atau sudah logout

---

## 🆘 Troubleshooting

### Q: Tidak bisa lihat LocalStorage di Application Tab?
**A:** 
- Pastikan di tab "Application" bukan "Elements"
- Pastikan website sudah loading (jangan di blank page)
- Expand "Local Storage" di left sidebar
- Pilih `http://localhost:3000`

### Q: LocalStorage kosong setelah login?
**A:**
- Refresh halaman (F5)
- Check di Network tab apakah login response return token?
- Buka Console dan cek: `localStorage.getItem("token")`

### Q: Token berisi karakter aneh seperti `eyJh...`?
**A:** Itu normal! Token di-encode dalam base64. Decode di jwt.io

### Q: Berapa nilai "exp" itu?
**A:** Unix timestamp (detik sejak 1 Jan 1970). Gunakan unixtimestamp.com

### Q: Bisa share token ke orang lain?
**A:** ❌ JANGAN! Token = password digital. Siapa punya token bisa akses akun Anda!

---

## 📝 Checklist: Token Sudah Benar?

- [ ] Token terlihat panjang & dengan format `xxxx.yyyy.zzzz`
- [ ] Token berisi base64 encoding (random string)
- [ ] Token ada 3 bagian dipisahkan titik
- [ ] Bisa di-decode di jwt.io
- [ ] Payload berisi user ID & expiration
- [ ] Dikirim di setiap API request (Authorization header)

---

## 📚 Reference Code

**Login saves token:**
```javascript
// /frontend/src/pages/Login.vue (Baris 48-49)
localStorage.setItem("token", response.data.token);
localStorage.setItem("user", JSON.stringify(response.data.user));
```

**API client uses token:**
```javascript
// /frontend/src/services/api.js (Baris 13-19)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Backend verifies token:**
```javascript
// /backend/src/middleware/authenticate.js
const token = req.headers.authorization?.split(" ")[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

---

**Sudah clear? Token = authentication key untuk setiap request! 🔑**
