# 🎯 RINGKASAN JWT TOKEN (5 MENIT READ)

## ❓ Pertanyaan Anda: "JWT Token muncul dimana, disimpan dimana, dan lihat dimana?"

### ✅ JAWABAN SINGKAT:

| Pertanyaan | Jawaban |
|-----------|---------|
| **Muncul dimana?** | **Response dari Login/Register API** (response body) |
| **Disimpan dimana?** | **Browser LocalStorage** (automatic, setelah login sukses) |
| **Lihat dimana?** | **DevTools F12 → Application → LocalStorage** |
| **Digunakan untuk?** | **Autentikasi setiap API request** (Authorization header) |
| **Berlaku berapa lama?** | **7 hari** (setting di backend .env) |

---

## 🔄 ALUR SINGKAT (Visual)

```
1. USER LOGIN
   Input: email + password
   
2. BACKEND RESPOND
   Response: {
     "token": "eyJhbGci...",  ← TOKEN MUNCUL DI SINI!
     "user": {...}
   }
   
3. FRONTEND SIMPAN
   localStorage.setItem("token", "eyJhbGci...")
   ✅ TOKEN SEKARANG DI LOCALSTORAGE!
   
4. SETIAP REQUEST KE API
   GET /api/vehicles
   Header: Authorization: Bearer eyJhbGci...
   
5. BACKEND VERIFIKASI
   Cek token valid?
   ✅ YES → Allow request
   ❌ NO → Return 401 Unauthorized
```

---

## 👀 LIHAT TOKEN: Step-by-Step

### Step 1: Login di aplikasi
```
http://localhost:3000/login
Input email & password
Klik "Login"
Tunggu redirect ke dashboard
```

### Step 2: Buka DevTools
```
Tekan: F12
Atau: Ctrl+Shift+I (Windows/Linux)
Atau: Cmd+Option+I (Mac)
```

### Step 3: Pergi ke Application Tab
```
DevTools > Application (atau Storage jika Firefox)
```

### Step 4: Expand LocalStorage
```
Left sidebar:
  LocalStorage
  └─ http://localhost:3000  ← KLIK INI
```

### Step 5: Lihat Token
```
Key           Value
─────────────────────────────────
token         eyJhbGciOiJIUzI1NiI...  ← KLIK DI SINI UNTUK FULL VALUE
user          {"id":"507f..."}
```

### Step 6: Copy & Decode (Optional)
```
1. Copy token value dari LocalStorage
2. Buka https://jwt.io
3. Paste di "Encoded" section
4. Lihat decoded payload di kanan:
   {
     "id": "507f1f77bcf86cd799439011",
     "iat": 1702523451,
     "exp": 1703128251
   }
```

---

## 📍 KODE BACKEND: Token Muncul di Sini

**File: `/backend/src/controllers/authController.js`**

```javascript
exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  // 1. Cari user
  const user = await User.findOne({ email }).select("+password");
  
  // 2. Cek password
  const isPasswordMatch = await user.matchPassword(password);
  
  if (isPasswordMatch) {
    // 3. Generate token
    const token = generateToken(user._id);  // ← TOKEN DIBUAT DI SINI
    
    // 4. Response return token
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,                          // ← TOKEN MUNCUL DI RESPONSE INI
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  }
};
```

**Apa itu generateToken?**
```javascript
// /backend/src/utils/jwt.js
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },              // Apa yang disimpan di token
    process.env.JWT_SECRET,      // Secret key (dari .env)
    { expiresIn: "7d" }          // Berlaku 7 hari
  );
  // Result: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTcwMjUyMzQ1MSwiZXhwIjoxNzAzMTI4MjUxfQ.x8y9z0..."
};
```

---

## 💾 KODE FRONTEND: Token Disimpan

**File: `/frontend/src/pages/Login.vue`**

```javascript
async handleLogin() {
  const response = await api.loginUser(this.form);
  
  // ← RESPONSE BERISI TOKEN!
  console.log(response.data);
  // {
  //   "success": true,
  //   "token": "eyJhbGci...",
  //   "user": {...}
  // }
  
  // SIMPAN TOKEN KE LOCALSTORAGE
  localStorage.setItem("token", response.data.token);  // ← DI SINI!
  localStorage.setItem("user", JSON.stringify(response.data.user));
  
  // REDIRECT KE DASHBOARD
  this.$router.push("/dashboard");
}
```

---

## 🔑 KODE FRONTEND: Token Digunakan

**File: `/frontend/src/services/api.js`**

```javascript
// Setiap request ke API, token otomatis ditambahkan
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");  // ← AMBIL TOKEN DARI LOCALSTORAGE
  
  if (token) {
    // Tambah ke header Authorization
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});
```

**Contoh request dengan token:**
```
GET /api/vehicles

Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTcwMjUyMzQ1MSwiZXhwIjoxNzAzMTI4MjUxfQ.x8y9z0...
```

---

## ✅ BACKEND: Token Diverifikasi

**File: `/backend/src/middleware/authenticate.js`**

```javascript
const authenticate = async (req, res, next) => {
  try {
    // 1. Extract token dari Authorization header
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }
    
    // 2. Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Simpan user ID ke req.user
    req.user = decoded;
    
    // 4. Lanjut ke controller
    next();
    
  } catch (error) {
    // 5. Token invalid atau expired
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};
```

---

## 🎯 JOURNEY: Token dari Awal sampai Akhir

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 1. USER LOGIN                              ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
│ POST /api/auth/login
│ {email: "user@example.com", password: "xxx"}
│
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 2. BACKEND GENERATE TOKEN                  ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
│ jwt.sign({id: "507f..."}, secret, {exp: 7d})
│ Return: "eyJhbGci...xyz"
│
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 3. RESPONSE RETURN TOKEN                   ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
│ HTTP 200 OK
│ {
│   "success": true,
│   "token": "eyJhbGci...xyz",
│   "user": {...}
│ }
│
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 4. FRONTEND SAVE TOKEN                     ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
│ localStorage.setItem("token", "eyJhbGci...")
│ ✅ TOKEN TERSIMPAN!
│ Bisa lihat di DevTools > Application > LocalStorage
│
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 5. SETIAP API REQUEST                      ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
│ GET /api/vehicles
│ Axios interceptor:
│   const token = localStorage.getItem("token")
│   config.headers.Authorization = `Bearer ${token}`
│
│ Header dikirim: Authorization: Bearer eyJhbGci...
│
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 6. BACKEND VERIFY TOKEN                    ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
│ Middleware authenticate():
│   Extract token dari header
│   jwt.verify(token, secret)
│   ✅ Valid? → Continue
│   ❌ Invalid? → Return 401
│
│ req.user = {id: "507f..."}
│ Controller bisa akses req.user.id
│
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 7. RESPONSE DENGAN DATA USER                ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
│ HTTP 200 OK
│ {
│   "success": true,
│   "vehicles": [...]  ← Data milik user ini
│ }
│
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 8. LOGOUT (HAPUS TOKEN)                    ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
│ localStorage.removeItem("token")
│ ✅ TOKEN DIHAPUS!
│ User tidak bisa akses API lagi (401)
└━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📋 QUICK CHECKLIST

Sebelum paham JWT, pastikan sudah tahu:

- ✅ Token adalah string panjang berisi encoded data
- ✅ Token berisi user ID + waktu expired
- ✅ Token disimpan di LocalStorage browser (tidak ke database)
- ✅ Token dikirim di setiap request (Authorization header)
- ✅ Backend verifikasi token sebelum process request
- ✅ Jika token invalid/expired → return 401 Unauthorized
- ✅ Logout = delete token dari LocalStorage

---

## 🎓 FILES REFERENCE

Untuk memahami JWT lebih detail, baca file ini:

1. **`JWT_TOKEN_EXPLAINED.md`** - Penjelasan detail dengan diagram
2. **`HOW_TO_VIEW_JWT_TOKEN.md`** - Cara lihat token di DevTools
3. **`diagrams/10_JWT_TokenFlow.puml`** - Diagram sequence flow JWT

---

## 🔗 Code Files

**Backend:**
- `/backend/src/controllers/authController.js` → Login/Register
- `/backend/src/utils/jwt.js` → Generate & verify token
- `/backend/src/middleware/authenticate.js` → Verify token untuk protected routes

**Frontend:**
- `/frontend/src/pages/Login.vue` → Simpan token (line 48-49)
- `/frontend/src/services/api.js` → Gunakan token (line 13-19)

---

## 💡 KEY TAKEAWAY

```
JWT = Autentikasi Token yang:
  1. ✅ Dibuat saat login/register
  2. ✅ Disimpan di LocalStorage browser
  3. ✅ Dikirim dengan setiap API request
  4. ✅ Diverifikasi oleh backend
  5. ✅ Berlaku 7 hari (bisa configure)
  6. ✅ Dihapus saat logout
```

---

**Mudah kan? Token = bukti identitas digital untuk akses API! 🔐**
