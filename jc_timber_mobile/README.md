# JC Timbers Mobile

Flutter mobile app for JC Timbers. Uses the **same backend** as the MERN web app:
- Same JWT authentication
- Same login/register endpoints
- Same timber processing booking APIs

## Scope

- **Login / Register** – Same auth as web
- **Timber Processing Booking** – Planing, Resawing, Debarking, Sawing

## Setup

### 1. Start the backend

From the project root:

```bash
cd server
npm run dev
```

Backend runs on `http://localhost:5001` by default.

### 2. Configure API base URL

The app defaults to `http://10.0.2.2:5001` (Android emulator → localhost).

| Target | Base URL |
|--------|----------|
| Android emulator | `http://10.0.2.2:5001` (default) |
| iOS simulator | `http://localhost:5001` |
| Physical device | Your machine's LAN IP, e.g. `http://192.168.1.5:5001` |

To override, run with:

```bash
flutter run --dart-define=API_BASE_URL=http://192.168.1.5:5001
```

Or edit `lib/config/api_config.dart` and change the default.

### 3. Run the app

```bash
cd jc_timber_mobile
flutter pub get
flutter run
```

## Backend APIs Used

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `POST /api/auth/login` | No | Login |
| `POST /api/auth/register` | No | Register |
| `GET /api/auth/profile` | JWT | User profile |
| `GET /api/services/schedule/available/:date` | No | Available slots |
| `POST /api/services/enquiries` | JWT | Create booking |
| `GET /api/services/enquiries/my` | JWT | My bookings |
| `PUT /api/services/enquiries/:id/cancel` | JWT | Cancel booking |

JWT is sent as `Authorization: Bearer <token>`.
