# FixItNow — API Documentation

Complete REST API reference for the **FixItNow** home-service marketplace (customers book technicians for repair/maintenance services).

- **Base URL (local):** `http://localhost:5000/api`
- **Base URL (production):** `https://fixitnow-one.vercel.app/api`
- **Content type:** `application/json`
- **Auth:** JWT. Two ways to authenticate:
  1. **Cookie (browser):** `accessToken` httpOnly cookie set by `POST /auth/login`.
  2. **Bearer header (Postman / mobile):** `Authorization: Bearer <accessToken>`

Postman collection: [`server/FixItNow.postman_collection.json`](./FixItNow.postman_collection.json) — set the `base-url` and `accessToken` collection variables and everything works out of the box.

---

## Response envelope

Every success response looks like:

```json
{
  "success": true,
  "message": "User logged in successfully!",
  "meta": null,
  "data": { }
}
```

Every error looks like:

```json
{
  "success": false,
  "statusCode": 401,
  "name": "Error",
  "message": "Password is not correct!"
}
```

| Code | Meaning |
| ---- | ------- |
| 200 | OK |
| 400 | Validation / bad request |
| 401 | Not authenticated (no/invalid token) |
| 403 | Role not allowed for this endpoint |
| 404 | Resource not found |
| 409 | Conflict — **e.g. the time slot is already booked** |
| 500 | Internal server error |

---

## 1. Authentication (`/auth`)

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| `POST` | `/auth/register` | public | Create a `CUSTOMER` or `TECHNICIAN` account |
| `POST` | `/auth/login` | public | Get JWT access/refresh tokens (+ httpOnly cookies) |
| `POST` | `/auth/logout` | public | Clear auth cookies |
| `GET` | `/auth/me` | any | Current logged-in user |
| `PUT` | `/auth/me` | any | Update own name / phone / address |
| `POST` | `/auth/forget-password` | public | Send reset email with token + PIN |
| `PATCH` | `/auth/update-password` | public | Password-reset success email |
| `PATCH` | `/auth/reset-password` | public | Password-reset success email |

### `POST /auth/register`

```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "password": "securePassword123",
  "role": "CUSTOMER",
  "phone": "+1234567890",
  "address": "789 Maple Drive, Austin, TX"
}
```

Response `200`:

```json
{
  "success": true,
  "message": "User registered successfully!",
  "data": {
    "id": "ba35abfb-400e-4d4c-83b0-38b12185da61",
    "email": "jane.smith@example.com",
    "name": "Jane Smith",
    "role": "CUSTOMER",
    "status": "ACTIVE",
    "emailVerified": true,
    "technicianProfile": null
  }
}
```

> Registering with `role: "TECHNICIAN"` also creates an empty technician profile. A welcome/confirm email is sent best-effort — a broken SMTP never blocks registration.

### `POST /auth/login`

```json
{ "email": "jane.smith@example.com", "password": "securePassword123" }
```

Response `200` (also sets `accessToken` + `refreshToken` httpOnly cookies):

```json
{
  "success": true,
  "message": "User logged in successfully!",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### `GET /auth/me`

Response `200`:

```json
{
  "success": true,
  "data": {
    "id": "ba35abfb-...",
    "email": "jane.smith@example.com",
    "name": "Jane Smith",
    "role": "CUSTOMER",
    "phone": "+1234567890",
    "address": "789 Maple Drive, Austin, TX",
    "status": "ACTIVE"
  }
}
```

### Super admin seeding

```bash
cd server
npx tsx prisma/seed.ts   # creates the admin from ADMIN_EMAIL / ADMIN_PASSWORD in .env if none exists
```


## 2. Categories, Services & Technicians (public discovery)

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| `GET` | `/categories` | public | All service categories |
| `GET` | `/services` | public | Paginated services with filters |
| `GET` | `/services/:id` | public | Single service incl. technician + availability |
| `POST` | `/services` | TECHNICIAN | Create a service offering |
| `GET` | `/services/technician` | TECHNICIAN | Own services |
| `GET` | `/technicians` | public | Paginated technician profiles |
| `GET` | `/technicians/:id` | public | Public technician profile |

### `GET /services` — query params

`page`, `limit`, `searchTerm`, `categoryId`, `technicianId`, `location`, `minPrice`, `maxPrice`, `status`, `sortBy` (default `createdAt`), `sortOrder` (`asc|desc`)

```
GET /api/services?page=1&limit=10&categoryId=e8dd2f3b-a6ca-4ac2-ba29-dcd62c258874&minPrice=10&maxPrice=80
```

### `GET /technicians` — query params

`page`, `limit`, `searchTerm`, `minRate`, `maxRate`, `minExperience`, `available` (`true|false`), `status`, `sortBy`, `sortOrder`

### `POST /services` (TECHNICIAN)

```json
{
  "title": "AC Maintenance & Repair",
  "description": "Full servicing of split and window AC units.",
  "price": 2500,
  "location": "Dhaka",
  "categoryId": "e8dd2f3b-a6ca-4ac2-ba29-dcd62c258874"
}
```

### `GET /technicians/:id` response (excerpt)

```json
{
  "success": true,
  "data": {
    "id": "146d59be-fc8b-498c-ac3c-21e56977a416",
    "bio": "10 years of AC repair experience",
    "experience": 10,
    "isAvailable": true,
    "hourlyRate": 500,
    "availability": {
      "monday":    [{ "start": "09:00", "end": "17:00" }],
      "wednesday": [{ "start": "09:00", "end": "17:00" }]
    },
    "user": { "id": "...", "name": "David Chen", "email": "dchen.service@example.com", "phone": "..." }
  }
}
```

---

## 3. Bookings (`/bookings`) — CUSTOMER

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| `POST` | `/bookings` | CUSTOMER | Create a booking (slot conflict → `409`) |
| `GET` | `/bookings` | CUSTOMER | Own bookings with service + technician |
| `GET` | `/bookings/:id` | CUSTOMER, ADMIN | Booking details |
| `GET` | `/bookings/availability` | CUSTOMER | **Free time slots for a technician on a date** |

### `GET /bookings/availability?technicianId=...&date=YYYY-MM-DD`

Returns the technician's slots for that weekday **minus the ones already booked** (status `REQUESTED`/`ACCEPTED`/`PAID`/`IN_PROGRESS`). Use this in the booking UI so booked slots are never selectable.

```
GET /api/bookings/availability?technicianId=146d59be-fc8b-498c-ac3c-21e56977a416&date=2026-09-07
```

Response:

```json
{
  "success": true,
  "message": "Available time slots retrieved successfully!",
  "data": [
    { "start": "09:00", "end": "17:00" }
  ]
}
```

### `POST /bookings`

```json
{
  "serviceId": "9f1c2a34-1b2c-4d5e-8f90-1a2b3c4d5e6f",
  "technicianId": "146d59be-fc8b-498c-ac3c-21e56977a416",
  "scheduledDate": "2026-09-07T00:00:00.000Z",
  "scheduledTime": "09:00 AM - 05:00 PM",
  "totalPrice": 2500,
  "customerAddress": "House 12, Road 5, Dhanmondi, Dhaka",
  "notes": "Please call before arriving"
}
```

- `scheduledDate` — ISO date (midnight UTC of the chosen calendar day).
- `scheduledTime` — `HH:MM AM/PM - HH:MM AM/PM` range string as displayed in the UI.
- `totalPrice` is **re-computed server-side** from the service price.
- A `PENDING` payment record is created together with the booking.

Response `200`:

```json
{
  "success": true,
  "message": "New booking created successfully!",
  "data": {
    "id": "ec7a0d7a-...",
    "status": "REQUESTED",
    "paymentStatus": "PENDING",
    "scheduledDate": "2026-09-07T00:00:00.000Z",
    "scheduledTime": "09:00 AM - 05:00 PM",
    "totalPrice": 2500
  }
}
```

Response `409` when the slot is gone:

```json
{
  "success": false,
  "statusCode": 409,
  "name": "Error",
  "message": "Slot 09:00 AM - 05:00 PM on 2026-09-07 is already booked. Please choose another time slot."
}
```

> 📧 **Emails:** creating a booking sends *Booking Request Received* to the customer and *New Booking Request* to the technician.

---

## 4. Payments (`/payments`) — CUSTOMER (SSLCommerz)

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| `POST` | `/payments/create` | CUSTOMER | Start an SSLCommerz session for a booking |
| `POST` | `/payments/confirm` | CUSTOMER | Confirm/validate the gateway response |
| `GET` | `/payments` | CUSTOMER | Own payment history |
| `GET` | `/payments/:id` | CUSTOMER | Payment details by booking id |

### `POST /payments/create`

```json
{ "bookingId": "ec7a0d7a-..." }
```

Response:

```json
{
  "success": true,
  "message": "Payment created successfully!",
  "data": { "paymentUrl": "https://sandbox.sslcommerz.com/EasyCheckOut/..." }
}
```

### `POST /payments/confirm`

```json
{
  "transactionId": "Fix-It-Now-1756905600000-483920",
  "val_id": "2609031355AbCdEf",
  "amount": "2500.00",
  "status": "VALID"
}
```

On success the payment becomes `COMPLETED`, and the booking becomes `PAID` with `paymentStatus: COMPLETED`.

> 📧 **Emails:** *Payment Successful — Booking Confirmed* to the customer and *Payment Received for Your Booking* to the technician.

---

## 5. Technician portal (`/technician`) — TECHNICIAN

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `GET` | `/technician` | Own technician profile (incl. user) |
| `PUT` | `/technician/profile` | Patch profile fields |
| `PATCH` | `/technician/tech-profile` | Update bio, skills, experience, hourlyRate, isAvailable, status |
| `PUT` | `/technician/availability` | Set weekly slots for one day |
| `GET` | `/technician/availability` | Read weekly availability |
| `GET` | `/technician/overview` | Dashboard stats + recent bookings |
| `GET` | `/technician/bookings` | Bookings assigned to this technician |
| `PATCH` | `/technician/bookings/:id` | Change booking status (sends emails) |

### `PUT /technician/availability`

```json
{
  "day": "monday",
  "slots": [{ "start": "09:00", "end": "12:00" }, { "start": "14:00", "end": "18:00" }]
}
```

### `PATCH /technician/bookings/:id`

```json
{ "status": "ACCEPTED" }
```

Allowed `status` values and the emails each one triggers:

| status | Email to customer | Email to technician |
| ------ | ----------------- | ------------------- |
| `ACCEPTED` | Booking Has Been Accepted | — |
| `DECLINED` | Booking Request Was Declined (+ `declineReason`) | — |
| `IN_PROGRESS` | Your Service Has Started | — |
| `COMPLETED` | Service Has Been Completed + Review Request | Booking Completed |
| `CANCELLED` | Booking Has Been Cancelled (+ `cancellationReason`) | Booking Cancelled |

Example with a reason:

```json
{ "status": "DECLINED", "declineReason": "I am unavailable on that date" }
```

---

## 6. Reviews (`/reviews`)

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| `POST` | `/reviews` | any logged-in | Review a **COMPLETED** booking you own |

```json
{
  "bookingId": "ec7a0d7a-...",
  "rating": 5,
  "comment": "Fantastic service, very professional!"
}
```

> 📧 A *review reminder* email is sent automatically 24h after completion if the customer has not reviewed (cron job).

---

## 7. Admin (`/admin`) — ADMIN

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| `GET` | `/admin/users` | ADMIN | All users |
| `PATCH` | `/admin/users/:id` | ADMIN | `{ "status": "ACTIVE" \| "BANNED" }` |
| `GET` | `/admin/bookings` | ADMIN | All bookings |
| `GET` | `/admin/overview` | ADMIN | KPI metrics, trends, recent bookings |
| `GET` | `/admin/categories` | public | All categories |
| `POST` | `/admin/categories` | ADMIN | `{ "name": "Plumbing", "description": "..." }` |
| `PUT` | `/admin/categories/:id` | ADMIN | Update name/description |
| `PUT` | `/admin/update/category/:id` | ADMIN | `{ "status": true }` |

---

## 8. Email notification matrix

All emails are rendered from EJS templates in `server/src/templates/` and dispatched through the BullMQ `email-notifications` queue (Redis). **If Redis is offline the queue falls back to sending directly via nodemailer**, so notifications are never lost. Every dispatch uses an idempotency key to avoid duplicates.

| # | Event | Trigger | Recipient(s) | Template |
| - | ----- | ------- | ------------ | -------- |
| 1 | Booking created | `POST /bookings` | Customer + Technician | `bookingCreatedCustomer` / `bookingCreatedTechnician` |
| 2 | Booking accepted | technician sets `ACCEPTED` | Customer | `bookingAccepted` |
| 3 | Booking declined | technician sets `DECLINED` | Customer | `bookingDeclined` |
| 4 | Payment success | `POST /payments/confirm` | Customer + Technician | `paymentSuccessCustomer` / `paymentSuccessTechnician` |
| 5 | Payment failed | gateway failure | Customer | `paymentFailed` |
| 6 | Booking cancelled | technician sets `CANCELLED` | Customer + Technician | `bookingCancelledCustomer` / `bookingCancelledTechnician` |
| 7 | Booking rescheduled | reschedule flow | Customer + Technician | `bookingRescheduled` |
| 8 | 24h reminder | cron (every 15 min) | Customer + Technician | `bookingReminder24hCustomer` / `bookingReminder24hTechnician` |
| 9 | 2h reminder | cron (every 15 min) | Customer + Technician | `bookingReminder2hCustomer` / `bookingReminder2hTechnician` |
| 10 | Service started | technician sets `IN_PROGRESS` | Customer | `bookingStarted` |
| 11 | Booking completed | technician sets `COMPLETED` | Customer + Technician | `bookingCompletedCustomer` / `bookingCompletedTechnician` |
| 12 | Review request | technician sets `COMPLETED` | Customer | `reviewRequested` |
| 13 | Review reminder | cron (24h after completion, no review) | Customer | `reviewReminder` |
| 14 | Pending booking nudge | cron (every 12h while REQUESTED) | Technician | `technicianBookingReminder` |
| 15 | Welcome / confirm account | `POST /auth/register` | New user | `confirmAccount` |
| 16 | Forgot password | `POST /auth/forget-password` | User | `forgotPassword` |
| 17 | Password reset success | reset endpoints | User | `passwordResetSuccess` |

---

## 9. Environment variables (`server/.env`)

| Variable | Example | Purpose |
| -------- | ------- | ------- |
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` | PostgreSQL (Neon) |
| `PORT` | `5000` | Server port |
| `NODE_ENV` | `development` | Cookie `sameSite`/`secure` behavior |
| `BCRYPT_SALT_ROUNDS` | `10` | Password hashing |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | random string | Token signing |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | `365d` | Token TTL |
| `FRONT_END_BASE_URL` | `http://localhost:3000` | Links inside emails |
| `REDIS_URL` | `redis://localhost:6379` | BullMQ email queue (falls back to direct send) |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server (**must match your credentials**) |
| `SMTP_PORT` | `587` | 587 = STARTTLS, 465 = implicit TLS |
| `SMTP_USERNAME` / `SMTP_PASSWORD` | Gmail app password | SMTP auth |
| `EMAIL_FROM` | `FixItNow <you@gmail.com>` | From header for queued emails |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `admin@fixitnow.com` / `admin@123` | Seed super admin |
| `STORE_ID` / `STORE_PASS` | SSLCommerz sandbox | Payment gateway |
| `SSL_PAYMENT_API` / `SSL_VALIDATION_API` | sandbox URLs | Payment gateway |
| `SUCCESS_URL` / `FAIL_URL` / `CANCEL_URL` | `http://localhost:3000/payment?status=success` | Gateway redirects |

> ⚠️ **SMTP note:** Gmail app passwords only work with `SMTP_HOST=smtp.gmail.com` (port 587 or 465). The old default fallback host was `smtp.mailtrap.io`, which rejects Gmail credentials with `535 Invalid credentials`.

---

## 10. Testing flow (happy path)

1. `POST /auth/register` → customer account
2. `POST /auth/login` → copy `accessToken`
3. `GET /services` → pick a `serviceId` (note its `technicianId`)
4. `GET /bookings/availability?technicianId=...&date=...` → pick a free slot
5. `POST /bookings` → booking created, both parties emailed
6. `POST /payments/create` → open `paymentUrl`, pay in sandbox
7. `POST /payments/confirm` → booking becomes `PAID`, both parties emailed
8. (as technician) `PATCH /technician/bookings/:id` with `ACCEPTED` → `IN_PROGRESS` → `COMPLETED`
9. `POST /reviews` → review the completed booking
---