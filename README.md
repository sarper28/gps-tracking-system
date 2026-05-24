# GPS Vehicle Tracking System

🚗 **A comprehensive web-based vehicle monitoring system with real-time GPS tracking, geofencing, and automated notifications.**

## 🎯 Project Overview

This is a **full-stack application** designed for final-year project demonstration that enables:

- ✅ **Real-time vehicle tracking** with GPS coordinates
- ✅ **Polygon-based geofencing** with violation detection
- ✅ **Automated notifications** (Email, Telegram, WhatsApp via N8N)
- ✅ **Location history** and violation logs
- ✅ **Multi-user support** with strict data isolation
- ✅ **Interactive mapping** with Leaflet.js
- ✅ **Production-ready architecture**

---

## 🧩 Architecture

### 3-Tier Stack:

```
┌─────────────────────┐
│   Frontend (Vue.js)   │  Interactive UI with Leaflet maps
├─────────────────────┤
│  Backend (Express)  │  RESTful API with geofencing logic
├─────────────────────┤
│  MongoDB Database   │  Document-based storage with geospatial indexes
└─────────────────────┘
       + N8N Webhooks   Automated notification workflows
```

---

## 📦 Project Structure

```
gps_tracker_sistem/
├── backend/
│   ├── src/
│   │   ├── models/          # MongoDB schemas (Mongoose)
│   │   │   ├── User.js
│   │   │   ├── Vehicle.js
│   │   │   ├── Geofence.js
│   │   │   ├── LocationLog.js
│   │   │   └── NotificationLog.js
│   │   ├── controllers/     # Business logic
│   │   │   ├── authController.js
│   │   │   ├── vehicleController.js
│   │   │   ├── geofenceController.js
│   │   │   └── locationController.js
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # JWT authentication
│   │   ├── utils/           # Geofencing logic (Ray Casting)
│   │   └── index.js         # Express server
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/           # Vue pages
│   │   │   ├── Login.vue
│   │   │   ├── Register.vue
│   │   │   ├── Dashboard.vue
│   │   │   ├── Vehicles.vue
│   │   │   ├── Geofences.vue
│   │   │   └── VehicleMap.vue
│   │   ├── services/        # API client
│   │   ├── router.js        # Vue Router
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── scripts/
│   └── gps-simulator.js     # GPS data simulator
│
├── README.md                # This file
├── QUICK_START.md           # Setup instructions
├── API_DOCUMENTATION.md     # API endpoints reference
├── N8N_INTEGRATION.md       # N8N workflow setup
└── PROJECT_DELIVERY.md      # Delivery checklist

```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 14+
- MongoDB 4.4+
- N8N (optional, for notifications)

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start server
npm run dev
```

**Server runs on:** `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

**Frontend runs on:** `http://localhost:3000`

### GPS Simulator

```bash
cd scripts
npm install axios

# Run simulator
node gps-simulator.js
```

---

## 📖 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update notification settings

### Vehicles

- `POST /api/vehicles` - Create vehicle
- `GET /api/vehicles` - List vehicles
- `GET /api/vehicles/:id` - Get vehicle details
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Geofences

- `POST /api/geofences` - Create geofence
- `GET /api/geofences` - List geofences
- `GET /api/geofences/:id` - Get geofence details
- `PUT /api/geofences/:id` - Update geofence
- `DELETE /api/geofences/:id` - Delete geofence

#### 🏙️ Province-based Geofences (Unggulan)

Geofence tipe `province` menggunakan boundary resmi dari data GeoJSON provinsi Indonesia.

- `GET /api/geofences/provinces` - Get list nama provinsi yang tersedia
- `GET /api/geofences/provinces/:provinceName/geometry` - Get geometry provinsi (untuk preview sebelum simpan)

### Location & Tracking

- `POST /api/location` - Submit GPS location (triggers geofence check)
- `GET /api/location/vehicles/:vehicleId/history` - Get location history
- `GET /api/location/vehicles/:vehicleId/violations` - Get violation history
- `GET /api/location/stats/dashboard` - Get dashboard statistics

---

## 🔐 Features

### 1. **User Authentication**

- JWT-based authentication
- Secure password hashing with bcryptjs
- User profile management

### 2. **Vehicle Management**

- Create/Read/Update/Delete vehicles
- Real-time location tracking
- Device ID mapping
- Active/Inactive status

### 3. **Geofence Management**

- Polygon-based geofences (GeoJSON format)
- Multi-geofence support per user
- Active/Inactive toggle

### 4. **Real-Time Tracking**

- GPS location updates via API
- Automatic violation detection (Ray Casting algorithm)
- Location history logging
- Violation history tracking

### 5. **Notification System**

- Webhook triggers to N8N
- Multi-channel support (Email, Telegram, WhatsApp)
- User-configurable notification preferences
- Notification logs and status tracking

### 6. **Dashboard**

- Vehicle count statistics
- Geofence count
- Today's violation count
- Real-time updates

### 7. **Interactive Map**

- Leaflet.js mapping
- Live vehicle markers
- Geofence visualization
- Manual tracking toggle
- Real-time location polling

---

## 🔍 Geofencing Algorithm

Uses **Ray Casting Algorithm** for point-in-polygon detection:

```javascript
// Determines if a GPS point (lat, lng) is inside a polygon
isPointInPolygon([longitude, latitude], polygonCoordinates);
```

**How it works:**

1. Cast a ray from the point to infinity
2. Count how many polygon edges the ray crosses
3. Odd count = inside, Even count = outside

---

## 🔔 N8N Integration

N8N receives geofence violation webhooks and can:

- Send **Email notifications**
- Send **Telegram messages**
- Send **WhatsApp messages**
- Log violations to external systems
- Trigger complex workflows

See [N8N_INTEGRATION.md](N8N_INTEGRATION.md) for detailed setup.

---

## 📊 Database Schema

### Users

```
{
  name: String,
  email: String,
  password: String (hashed),
  notifConfig: {
    email: Boolean,
    telegram: Boolean,
    telegramChatId: String,
    whatsapp: Boolean,
    whatsappPhone: String
  },
  timestamps
}
```

### Vehicles

```
{
  userId: ObjectId,
  vehicleName: String,
  deviceId: String (unique),
  currentLocation: GeoJSON Point,
  lastUpdated: Date,
  isActive: Boolean,
  timestamps
}
```

### Geofences

```
{
  userId: ObjectId,
  name: String,
  geometry: GeoJSON Polygon,
  isActive: Boolean,
  description: String,
  timestamps
}
```

### LocationLogs

```
{
  vehicleId: ObjectId,
  location: GeoJSON Point,
  isViolation: Boolean,
  violatedGeofences: [ObjectId],
  accuracy: Number,
  speed: Number,
  heading: Number,
  timestamp: Date,
  timestamps
}
```

### NotificationLogs

```
{
  vehicleId: ObjectId,
  geofenceId: ObjectId,
  userId: ObjectId,
  status: 'pending' | 'sent' | 'failed',
  channel: 'email' | 'telegram' | 'whatsapp' | 'webhook',
  message: String,
  violationDetails: Object,
  sentAt: Date,
  timestamps
}
```

---

## 🧪 Testing the System

### 1. Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 2. Create Vehicle

```bash
curl -X POST http://localhost:5000/api/vehicles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleName": "Tesla Model 3",
    "deviceId": "DEVICE_001"
  }'
```

### 3. Create Geofence

```bash
curl -X POST http://localhost:5000/api/geofences \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Zone",
    "description": "Restricted downtown area",
    "coordinates": [
      [-74.006, 40.7128],
      [-74.005, 40.7128],
      [-74.005, 40.7129],
      [-74.006, 40.7129]
    ],
    "type": "polygon",
    "vehicleId": "YOUR_VEHICLE_ID"
  }'
```

### 3b. Create Province Geofence (Type `province`)

```bash
curl -X POST http://localhost:5000/api/geofences \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jawa Barat",
    "description": "Geofence berbasis provinsi",
    "type": "province",
    "provinceName": "Jawa Barat",
    "vehicleId": "YOUR_VEHICLE_ID",
    "isActive": true
  }'
```

### 4. Submit Location (Trigger Geofence Check)

```bash
curl -X POST http://localhost:5000/api/location \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "DEVICE_001",
    "latitude": 40.7128,
    "longitude": -74.006,
    "accuracy": 10,
    "speed": 25,
    "heading": 45
  }'
```

---

## 🛠 Development

### Code Standards

- **Backend:** Express.js with async/await
- **Frontend:** Vue.js 3 with Composition API
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT tokens
- **Maps:** Leaflet.js with OpenStreetMap

### Key Technologies

- **Runtime:** Node.js
- **Framework:** Express.js
- **UI:** Vue.js 3 + Vite
- **Database:** MongoDB
- **Mapping:** Leaflet.js
- **HTTP Client:** Axios
- **Security:** JWT, bcryptjs, CORS
- **Automation:** N8N

---

## 📝 Example JSON Responses

### Login Response

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Get Vehicles Response

```json
{
  "success": true,
  "count": 2,
  "vehicles": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439010",
      "vehicleName": "Tesla Model 3",
      "deviceId": "DEVICE_001",
      "currentLocation": {
        "type": "Point",
        "coordinates": [-74.006, 40.7128]
      },
      "lastUpdated": "2024-01-15T10:30:00Z",
      "isActive": true
    }
  ]
}
```

### Location Update Response

```json
{
  "success": true,
  "message": "Location updated successfully",
  "data": {
    "vehicleId": "507f1f77bcf86cd799439011",
    "location": [40.7128, -74.006],
    "isViolation": true,
    "violatedGeofences": ["507f1f77bcf86cd799439012"],
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

---

## 🚨 Error Handling

The API returns standard HTTP status codes:

- **200 OK** - Request successful
- **201 Created** - Resource created
- **400 Bad Request** - Invalid input
- **401 Unauthorized** - Missing/invalid authentication
- **403 Forbidden** - Permission denied
- **404 Not Found** - Resource not found
- **409 Conflict** - Resource already exists
- **500 Internal Server Error** - Server error

---

## 🔒 Security Considerations

1. **JWT Expiration:** Tokens expire after 7 days
2. **Password Hashing:** bcryptjs with 10 salt rounds
3. **CORS:** Configurable cross-origin requests
4. **Data Isolation:** Each user can only access their own data
5. **Input Validation:** All inputs validated on backend
6. **Environment Variables:** Sensitive data in .env files

---

## 📚 Documentation Files

- **[QUICK_START.md](QUICK_START.md)** - Step-by-step setup guide
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Detailed API reference
- **[N8N_INTEGRATION.md](N8N_INTEGRATION.md)** - N8N webhook setup
- **[PROJECT_DELIVERY.md](PROJECT_DELIVERY.md)** - Delivery checklist

---

## 💡 Future Enhancements

- [ ] Real-time WebSocket updates instead of polling
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] SMS notifications
- [ ] Vehicle route optimization
- [ ] Machine learning for predictive analytics
- [ ] Docker containerization
- [ ] Kubernetes deployment

---

## 📄 License

This project is for educational purposes. Feel free to use and modify as needed for your project.

---

## 👤 Author

Created as a comprehensive final-year project demonstration.

---

## 🤝 Support

For issues or questions, refer to the documentation files or check the API responses for error messages.

**Happy Tracking! 🚗📍**
