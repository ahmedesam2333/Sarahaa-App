<div align="center">

# Sarahaa App

**Anonymous Messaging Platform — REST API Backend**

![Status](https://img.shields.io/badge/Status-In_Progress-f59e0b?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

*A secure, scalable backend for an anonymous social messaging platform.*

</div>

---

## Overview

Sarahaa is an anonymous messaging platform where users share a public link and receive messages from anyone — without the sender revealing their identity.

**Core flow:**
- Users register and receive a personal public link
- Anyone (authenticated or not) can send an anonymous message via that link
- Users view, manage, and reply to messages — replies are public, senders stay anonymous
- Full auth system: email OTP verification, Google OAuth, and password reset

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (access & refresh tokens), Google OAuth |
| Security | bcryptjs, CryptoJS (AES), CORS |
| Validation | Joi |
| Email | Nodemailer + Node EventEmitter |
| File Upload | Multer (local & Cloudinary) |
| OTP | nanoid (`customAlphabet`) |
| Config | dotenv |

---

## Project Structure

```
SARAHAA-APP/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.routes.js
│   │   │   └── auth.validation.js
│   │   └── user/
│   │       ├── user.controller.js
│   │       ├── user.routes.js
│   │       ├── user.validation.js
│   │       └── user.authorization.js
│   ├── DB/
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   └── token.model.js
│   │   ├── db.service.js
│   │   └── connection.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── validation.middleware.js
│   └── utils/
│       ├── response.js
│       ├── multer/
│       │   ├── local.multer.js
│       │   ├── cloud.multer.js
│       │   └── cloudinary.js
│       ├── email/
│       │   ├── send.email.js
│       │   └── templates/
│       │       └── Email.template.js
│       ├── events/
│       │   └── email.event.js
│       └── security/
│           ├── hash.security.js
│           ├── encrypt.security.js
│           ├── otp.security.js
│           └── token.security.js
│   ├── app.controller.js
│   └── index.js
├── .gitignore
├── package.json
└── README.md
```

---

## Database Models

### User — `src/DB/models/user.model.js`

| Field | Type | Notes |
|---|---|---|
| `firstName` / `lastName` | String | Required · 2–20 chars each |
| `fullName` | Virtual | Getter/setter splitting first & last name |
| `email` | String | Required · Unique |
| `password` | String | Required for `system` provider · bcrypt hashed |
| `oldPasswords` | [String] | Prevents password reuse |
| `phone` | String | Required for `system` provider · AES encrypted |
| `gender` | String | `male` / `female` · Default: `male` |
| `role` | String | `user` / `admin` · Default: `user` |
| `provider` | String | `system` / `google` · Default: `system` |
| `picture` | Object | `{ secure_url, public_id }` — Cloudinary |
| `coverImages` | [Object] | Array of `{ secure_url, public_id }` — Cloudinary |
| `confirmEmail` | Date | Set on verification · absent = unverified |
| `confirmEmailOtp` | String | Hashed · removed after verification |
| `forgetPasswordOtp` | String | Hashed · removed after reset |
| `otpDate` | Date | OTP timestamp — drives 2-min expiry logic |
| `changeCredentialsTime` | Date | Updated on password reset / logout-all · invalidates all prior tokens |
| `deletedAt` / `deletedBy` | Date / ObjectId | Soft-delete fields |
| `restoredAt` / `restoredBy` | Date / ObjectId | Restore audit fields |

---

### Token (Blacklist) — `src/DB/models/token.model.js`

Stores revoked JWT IDs. Every authenticated request checks this collection before proceeding.

| Field | Type | Notes |
|---|---|---|
| `jti` | String | Required · Unique — JWT ID from token payload |
| `expiresIn` | Number | Unix timestamp — for future TTL cleanup |
| `userId` | ObjectId | Required · Ref: `User` |

---

## Security Design

- **Passwords** — bcrypt hashed; old passwords stored to prevent reuse
- **Phone numbers** — AES encrypted at rest
- **OTPs** — bcrypt hashed with a 2-minute expiry window
- **JWT** — Access + refresh token pair with `jti` tracking. Tokens include a unique `jti` (via nanoid). Logout revokes the `jti` into a blacklist. `changeCredentialsTime` on the user provides global session invalidation (logout from all devices).
- **Google OAuth** — ID token verified server-side via `google-auth-library`; unified signup/login flow

---

## API Reference

**Base URL:** `http://localhost:5000`

> 🔒 Protected routes require `Authorization: Bearer <token>` or `Authorization: Admin <token>`
>
> All routes return `400 Validation Error` on invalid input — omitted per endpoint for brevity.

---

### Auth — `/auth`

#### `POST /auth/signup` — Register a new user

**Body**
```json
{
  "fullName": "Ahmed Essam",
  "email": "ahmed@example.com",
  "password": "Ahmed@1234",
  "phone": "01012345678",
  "gender": "male",
  "role": "user"
}
```

**Validation**

| Field | Rules |
|---|---|
| `fullName` | Required · first + last name · each part 2–20 chars |
| `email` | Required · valid TLD: `com / net / org / io / gov / edu` |
| `password` | Required · min 8 chars · must include uppercase, lowercase, digit, special char |
| `phone` | Required · Egyptian numbers only: `010 / 011 / 012 / 015` |
| `gender` | Optional · `male` or `female` |
| `role` | Optional · `user` or `admin` |

**Responses**

| Status | Description |
|---|---|
| `201` | User created — OTP sent to email |
| `409` | Email already registered |

---

#### `POST /auth/login` — Login with credentials

**Body**
```json
{
  "email": "ahmed@example.com",
  "password": "Ahmed@1234"
}
```

**Responses**

| Status | Description |
|---|---|
| `200` | Login successful — returns `access_token` and `refresh_token` |
| `401` | Email not verified |
| `401` | Account is frozen |
| `404` | Invalid email or password |

> Token prefix is `Bearer` for users and `Admin` for admins — resolved automatically from user role.

---

#### `POST /auth/gmail` — Signup or login with Google

**Body**
```json
{ "idToken": "<google_id_token>" }
```

**Responses**

| Status | Description |
|---|---|
| `201` | New account created via Google |
| `200` | Existing Google user logged in |
| `401` | Google email not verified |
| `409` | Email already registered under `system` provider |

---

#### `PATCH /auth/confirm-email` — Verify email with OTP

**Body**
```json
{ "email": "ahmed@example.com", "otp": "123456" }
```

**Responses**

| Status | Description |
|---|---|
| `200` | Email verified |
| `400` | Invalid OTP |
| `400` | OTP expired (older than 2 minutes) |
| `404` | Email not found or already verified |

---

#### `PATCH /auth/resend-otp` — Resend verification OTP

**Body**
```json
{ "email": "ahmed@example.com" }
```

**Responses**

| Status | Description |
|---|---|
| `200` | OTP resent |
| `400` | Within 2-min cooldown — returns seconds remaining |
| `404` | Email not found or already confirmed |

---

#### `PATCH /auth/forget-password` — Request password reset OTP

**Body**
```json
{ "email": "ahmed@example.com" }
```

**Responses**

| Status | Description |
|---|---|
| `200` | Reset OTP sent to email |
| `404` | Email not found, unverified, or Google account |

---

#### `PATCH /auth/verify-forget-password` — Verify reset OTP

**Body**
```json
{ "email": "ahmed@example.com", "otp": "123456" }
```

**Responses**

| Status | Description |
|---|---|
| `200` | OTP verified — proceed to reset password |
| `400` | Invalid OTP |
| `404` | Email not found or no active reset request |

---

#### `PATCH /auth/reset-password` — Set new password

**Body**
```json
{
  "email": "ahmed@example.com",
  "otp": "123456",
  "password": "NewPass@5678"
}
```

**Responses**

| Status | Description |
|---|---|
| `200` | Password reset — all existing sessions invalidated |
| `400` | Invalid OTP |
| `404` | Email not found or no active reset request |

> `changeCredentialsTime` is updated on success, immediately invalidating all previously issued tokens.

---

### User — `/user`

#### `GET /user` 🔒 — Get current user profile

Returns the authenticated user's profile. Phone is decrypted before returning.

**Responses**

| Status | Description |
|---|---|
| `200` | Profile returned |
| `401` | Missing, revoked, or expired token |
| `403` | Role not permitted |
| `404` | User not found |

---

#### `PATCH /user` 🔒 — Update basic profile

**Body** *(all fields optional)*
```json
{
  "fullName": "Ahmed Updated",
  "phone": "01112345678",
  "gender": "male"
}
```

**Responses**

| Status | Description |
|---|---|
| `200` | Profile updated |
| `401` | Invalid or revoked token |
| `404` | User not found |

---

#### `PATCH /user/password` 🔒 — Update password

**Body**
```json
{
  "oldPassword": "Ahmed@1234",
  "newPassword": "NewPass@5678",
  "flag": "stayLoggedIn"
}
```

| `flag` value | Behavior |
|---|---|
| `stayLoggedIn` | Default — stay authenticated |
| `logout` | Revoke current session token |
| `logoutFromAll` | Invalidate all active sessions |

**Responses**

| Status | Description |
|---|---|
| `200` | Password updated |
| `400` | Old password doesn't match |
| `409` | New password matches a previously used password |
| `401` | Invalid or revoked token |
| `404` | User not found |

---

#### `PATCH /user/profile-image` 🔒 — Upload profile image

**Content-Type:** `multipart/form-data`  
**Field:** `image` — single file · accepted: `image/jpeg`, `image/gif`

Replaces existing profile image on Cloudinary if one exists.

**Responses**

| Status | Description |
|---|---|
| `200` | Image uploaded |
| `400` | Invalid file type |
| `401` | Invalid or revoked token |

---

#### `PATCH /user/profile-cover-images` 🔒 — Upload cover images

**Content-Type:** `multipart/form-data`  
**Field:** `images` — 1–2 files · accepted: `image/jpeg`, `image/gif`

Replaces all existing cover images on Cloudinary.

**Responses**

| Status | Description |
|---|---|
| `200` | Cover images uploaded |
| `400` | Invalid file type |
| `401` | Invalid or revoked token |

---

#### `GET /user/refresh-token` 🔒 — Rotate token pair

**Header:** `Authorization: Bearer <refresh_token>` or `Authorization: Admin <refresh_token>`

**Responses**

| Status | Description |
|---|---|
| `200` | New `access_token` and `refresh_token` returned |
| `401` | Invalid or revoked refresh token |

---

#### `POST /user/logout` 🔒 — Logout

**Body**
```json
{ "flag": "logout" }
```

| `flag` value | Behavior |
|---|---|
| `logout` | Revokes current token via JTI blacklist |
| `logoutFromAll` | Sets `changeCredentialsTime` — invalidates all active sessions |

**Responses**

| Status | Description |
|---|---|
| `201` | Logged out |
| `401` | Invalid or revoked token |

---

#### `GET /user/:userId` — View public profile

**Params:** `userId` — valid MongoDB ObjectId

Returns limited public fields: `firstName`, `lastName`, `fullName`, `email`.

**Responses**

| Status | Description |
|---|---|
| `200` | Public profile returned |
| `400` | Invalid ObjectId |
| `404` | Account not found or not verified |

---

#### `DELETE /user/:userId/freeze-account` 🔒 — Soft-delete (freeze) account

Users can freeze their own account (omit `userId`). Admins can target any user by passing `userId`.

**Responses**

| Status | Description |
|---|---|
| `204` | Account frozen |
| `403` | Non-admin attempting to freeze another user |
| `404` | User not found or already frozen |
| `401` | Invalid or revoked token |

---

#### `PATCH /user/:userId/restore-account` 🔒 Admin — Restore frozen account

**Header:** `Authorization: Admin <access_token>`  
**Params:** `userId` — valid MongoDB ObjectId

**Responses**

| Status | Description |
|---|---|
| `200` | Account restored |
| `403` | Not an admin |
| `404` | User not found or already active |
| `401` | Invalid or revoked token |

---

#### `DELETE /user/:userId` 🔒 Admin — Hard delete account

**Header:** `Authorization: Admin <access_token>`  
**Params:** `userId` — valid MongoDB ObjectId

> Account must be frozen first (`deletedAt` must exist). Active accounts cannot be hard-deleted directly.

**Responses**

| Status | Description |
|---|---|
| `204` | Account permanently deleted |
| `403` | Not an admin |
| `404` | User not found or not frozen |
| `401` | Invalid or revoked token |

---

## Roadmap

- [ ] Rate limiting per IP (`express-rate-limit`)
- [ ] Helmet security headers
- [ ] Anonymous message sending (no auth required)
- [ ] Message inbox — view, delete, reply
- [ ] Block / report a message
- [ ] Pagination for message inbox
- [ ] Admin dashboard

---

## Author

**Ahmed Essam** — Node.js Backend Engineer  
ahmedezsam@gmail.com · [LinkedIn](https://linkedin.com/in/ahmed-essam-33b989221)
