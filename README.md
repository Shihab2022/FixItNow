# FixItNow 🔧

**FixItNow** is a full-stack **home-service marketplace platform** that connects **customers** with **verified technicians**. It covers the complete service lifecycle — discovery, booking, payment, job execution, and review — plus an **interactive nearest-match map**, a **task / job-request marketplace**, and role-based dashboards for **Customers**, **Technicians**, and **Admins**.

| | |
|---|---|
| 🖥️ **Live Frontend** | https://fixitnow-frontend-theta.vercel.app/ |
| 🔌 **Live API** | https://fixitnow-one.vercel.app/ |
| 📦 **GitHub** | https://github.com/Shihab2022/FixItNow- |
| ▶️ **Demo Video** | https://drive.google.com/file/d/1EhaNvONCeX9UVcLYE7MJpJOxJW1dfCGl/view |

**Demo Admin:** `admin@gmail.com` / `12345`

---

## 📑 Table of Contents

1. [Tech Stack](#-tech-stack)
2. [Role-Based Authentication & Account Management](#1-role-based-authentication--account-management)
3. [Public Marketing Site](#2-public-marketing-site)
4. [Service & Category Browsing](#3-service--category-browsing)
5. [Booking & Scheduling](#4-booking--scheduling)
6. [Payments (SSLCOMMERZ)](#5-payments-sslcommerz)
7. [Reviews & Ratings](#6-reviews--ratings)
8. [Role-Based Dashboards](#7-role-based-dashboards)
9. [Interactive Map & Nearest-Matching](#8-interactive-map--nearest-matching)
10. [Task / Job-Request Marketplace](#9-task--job-request-marketplace)
11. [Image Uploads (Cloudinary)](#10-image-uploads-cloudinary)
12. [Email Notification System](#11-email-notification-system)
13. [Contact & Support](#12-contact--support)
14. [Admin Panel](#13-admin-panel)
15. [Getting Started](#-getting-started)
16. [Project Structure](#-project-structure)
17. [API Overview](#-api-overview)

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js (App Router), React, TypeScript, Tailwind CSS, Framer Motion, MapLibre GL + react-map-gl, Recharts, React Hook Form + Zod, react-hot-toast |
| **Backend** | Node.js, Express, TypeScript (tsx / tsup) |
| **Database** | PostgreSQL + Prisma ORM |
| **Cache / Queues** | Redis + BullMQ (email queue), node-cron (scheduled reminders) |
| **Payments** | SSLCOMMERZ (Bangladesh) |
| **Email** | Nodemailer (Mailtrap / SMTP), EJS templates, PDFKit receipts |
| **File Storage** | Cloudinary (image uploads) |
| **Deployment** | Vercel (frontend + serverless backend) |

## 1. Role-Based Authentication & Account Management

| Capability | Details |
|---|---|
| **Registration** | Users register as `CUSTOMER` or `TECHNICIAN`. Passwords are hashed with **bcrypt**; a technician profile is auto-created on sign-up. |
| **Login / Logout** | JWT access + refresh tokens are issued by the API and stored in **httpOnly cookies** in the Next.js app. |
| **Session / "Me"** | Authenticated users can fetch (`GET /auth/me`) and update (`PUT /auth/me`) their profile — name, phone, address, photo, and **latitude/longitude** (used by the map). |
| **Forgot / Reset Password** | Users request a reset via email; the backend sends a **reset link + 6-digit PIN** and a confirmation email after reset. |
| **Account Confirmation** | A welcome/confirmation email is sent on registration (best-effort, never blocks sign-up). |
| **Account Banning** | Admins can ban/unban users; banned users are blocked at login with a clear message. |

**Endpoints:** `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `POST /auth/forget-password`, `PATCH /auth/update-password`, `PATCH /auth/reset-password`, `GET /auth/me`, `PUT /auth/me`

---

## 2. Public Marketing Site

The landing page (`/`) contains a full marketing homepage:

- Hero section with search / booking CTA ("Find Services" → `/services`)
- **Featured services**, **popular categories**, and **top-rated technicians** (fetched live from the API)
- **Live map preview** — an interactive MapLibre GL embed of the nearest-match map
- About us, How-it-works, Stats counters, Testimonials, FAQ (accordion), Why-choose-us
- **"Become a technician"** CTA, contact section + footer

---

## 3. Service & Category Browsing

**Public pages** (`/category`, `/category/[id]`, `/services`, `/technicians`, `/technicians/[id]`):

- Browse **categories** with icons and images
- Browse **services** with price, location, images, and **live search / category filter / sorting** (price ASC/DESC, rating)
- View a **single service** detail page
- Browse the **technician directory** with average rating, experience, completed jobs
- View a **technician profile** — bio, skills, hourly rate, availability, services offered, and reviews
- Filter technicians by **category**

---

## 4. Booking & Scheduling

**Customer flow:**

- From a service page, the customer picks a **scheduled date and a free time slot** (the backend returns only slots not already `REQUESTED / ACCEPTED / PAID / IN_PROGRESS`)
- Creates a booking with address, notes, and total price
- Booking lifecycle: `REQUESTED → ACCEPTED → PAID → IN_PROGRESS → COMPLETED` (plus `DECLINED` and `CANCELLED`)
- Customers view bookings and statuses in their dashboard and can **download the PDF receipt**

**Technician flow:**

- View incoming booking requests in the dashboard
- **Accept / Decline** (with a reason), **Start**, **Complete**, or **Cancel** a booking
- Status changes notify both parties by email

**Admin:** View all bookings across the platform.

**Endpoints:** `POST /bookings`, `GET /bookings`, `GET /bookings/availability`, `GET /bookings/:id`, `PATCH /technician/bookings/:id`

---

## 5. Payments (SSLCOMMERZ)

The platform is built for Bangladesh and integrates the **SSLCOMMERZ** payment gateway.

- `POST /payments/create` creates a payment session for a booking and returns the **SSLCOMMERZ gateway URL** to redirect the customer
- After payment, `POST /payments/confirm` validates the transaction (`val_id`) with the gateway, marks the payment **COMPLETED**, and flips the booking to **PAID**
- Customers get a **payment history** page with each transaction, amount, status, and linked booking
- Each payment and booking produces a **PDF** (invoice / receipt) attached to the notification emails and downloadable from the UI
- Success / failure / cancellation confirmation page (`/payment?status=...`)

**Endpoints:** `POST /payments/create`, `POST /payments/confirm`, `GET /payments`, `GET /payments/:id`

---

## 6. Reviews & Ratings

- After a booking is completed, the customer can leave a **1–5 star rating and a comment**
- Reviews are linked to the booking (one review per booking)
- Ratings roll up into each technician's **average rating**, shown on public profiles, directory lists, and the map
- A **review-reminder email** is sent automatically 24h after completion if no review was given

**Endpoint:** `POST /reviews`
## 7. Role-Based Dashboards

All dashboards live under a protected `/dashboard` area guarded by a role-aware sidebar (users are redirected to login if they access another role's routes).

### Customer Dashboard
- Dashboard home, **bookings list**, and **payment history**
- Quick links to book a service, view receipts, and track booking status live

### Technician Dashboard
- **Dashboard / overview**
- **Profile management** — bio, skills, hourly rate, experience, profile photo upload
- **Availability management** — set weekly time slots (day + start/end time); booked slots are surfaced to customers
- **Services manager** — create and list their offered services (title, description, price, location, category, image)
- **Bookings manager** — accept/decline/start/complete/cancel incoming bookings
- **My Applications** — track task-marketplace applications with their status

### Admin Dashboard
- Overview with **analytics charts** (recharts area/bar/pie charts)
- **Users manager** — list all users, ban/unban
- **Technicians manager** — view all technicians
- **Bookings manager** — view all platform bookings (searchable table)
- **Categories manager** — create, edit, and enable/disable categories

**Key endpoints:** `GET /technician/overview`, `PUT /technician/availability`, `PATCH /technician/tech-profile`, `GET|POST /services` (technician), `GET /technician/bookings`, `GET /admin/overview`, `GET|PATCH /admin/users`, `GET|POST /admin/categories`, `PUT /admin/categories/:id`, `GET /admin/bookings`

---

## 8. Interactive Map & Nearest-Matching

The **Map page** (`/map`) matches users to the closest providers/tasks using the **Haversine distance formula** on their GPS coordinates.

- **MapLibre GL** map with OpenFreeMap tiles and built-in navigation controls
- **Geolocation permission flow** — on first visit the app asks for browser location and **saves it to the user's profile** so the map centers correctly next time
- **Manual location search** via the **Nominatim geocoder** (debounced)
- **Radius filter** (default 10 km, up to 500) + **category filter**
- Role-based content on the map:
  - **Customer** → sees **nearby available technicians**; click-through to view their profile and book. Search by name / bio / skills.
  - **Technician** → sees **nearby OPEN job tasks**; click-through to view the task and apply.
- Sorted **nearest-first** with distance shown on each card/marker

**Endpoints:** `GET /map/technicians?latitude&longitude&radiusKm&categoryId&q`, `GET /map/tasks?latitude&longitude&radiusKm&categoryId`

---

## 9. Task / Job-Request Marketplace

A "gig + map" hybrid flow where customers post tasks and nearby technicians apply.

- **Customers** can post a **job request** (`POST /job-requests`) — title, description, budget, address, latitude/longitude, category
- **Technicians** view open tasks on the map and **apply with a cover message** (`POST /job-requests/:id/applications`)
- A task can only be applied to while its status is `OPEN`; each technician may apply **once per task**
- **Customers** review the applications (technician name, experience, hourly rate, message) and **accept one** (`POST /job-requests/:id/applications/:appId/accept`)
- Technicians have a **"My Applications"** list (`GET /job-requests/technician/applications`)
- Email notifications fire on **apply** (to the customer) and on **accept** (to the technician)

**Endpoints:** `POST /job-requests`, `GET /job-requests`, `GET /job-requests/:id`, `GET /job-requests/:id/applications`, `POST /job-requests/:id/applications`, `POST /job-requests/:id/applications/:appId/accept`, `GET /job-requests/technician/applications`

---

## 10. Image Uploads (Cloudinary)

- Single-file image upload endpoint (`POST /uploads/image`, multipart field `image`)
- Uploads stream directly to **Cloudinary** and return a secure URL + public id
- Used for **profile pictures, category images, and service images** across the dashboards (via the reusable `ImageUpload` UI component)

---

## 11. Email Notification System

A production-grade email engine using **BullMQ + Redis** with **16+ HTML templates (EJS)**.

**Transactional emails (customer & technician):**
- Booking created, accepted, declined (with reason), cancelled, started, completed, rescheduled
- Payment success / failure
- Review requested, review reminder
- Welcome / account confirmation
- Forgot password (with PIN) & password reset success
- Contact-message notification to support
- Job-request applied (to customer) and job-request accepted (to technician)

**Scheduled reminders (node-cron, every 15 minutes):**
- **24-hour and 2-hour booking reminders** to both parties
- **Review reminder** 24h after a completed booking with no review
- **Stale-request reminders** to technicians for bookings left in `REQUESTED` (max once per 12h)

**Reliability features:**
- Emails are **queued** with idempotency keys, 3 retry attempts, and exponential backoff
- If **Redis is unavailable**, emails are sent **directly** (fail-safe) so notifications are never lost
- **PDF attachments** (`booking-details.pdf`, `payment-receipt.pdf`) generated with PDFKit for booking/payment emails

---

## 12. Contact & Support

- Public contact form (name, email, subject, message)
- Backend forwards the message to the support inbox (`POST /contact`) using a dedicated email template

---

## 13. Admin Panel

Admins get a full management suite:

- **Overview analytics** — revenue, bookings, users, technicians, category distribution (charts)
- **Users** — list and **ban/unban** any account
- **Technicians** — browse all technician profiles
- **Bookings** — searchable table of every booking on the platform
- **Categories** — create, edit, and toggle visibility

**Endpoints:** `GET /admin/overview`, `GET /admin/users`, `PATCH /admin/users/:id`, `GET /admin/bookings`, `GET|POST /admin/categories`, `PUT /admin/categories/:id`, `PUT /admin/update/category/:id`
## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Redis (optional — email engine falls back to direct SMTP)
- SSLCOMMERZ sandbox credentials (for payments)

### 1. Clone & Install

```bash
git clone https://github.com/Shihab2022/FixItNow-.git
cd FixItNow
npm install                 # root (concurrently)
cd front-end && npm install # Next.js app
cd ../server && npm install # Express API
```

### 2. Environment Variables

Create `.env` files from the provided examples:

```bash
# front-end/.env  (copy from front-end/#env.example)
NEXT_PUBLIC_API_BASE_URL=...

# server/.env     (copy from server/#env.example)
DATABASE_URL=postgresql://...
JWT_SECRET=...
SSLCOMMERZ_STORE_ID=...
SSLCOMMERZ_STORE_PASSWORD=...
CLOUDINARY_URL=...
REDIS_URL=...
MAILTRAP_USER=...
MAILTRAP_PASS=...
```

### 3. Database

```bash
cd server
npx prisma migrate dev   # or: npx prisma db push
```

### 4. Run

```bash
# From repository root — runs API + frontend together
npm run dev

# Or separately
npm run server   # Express API on :5000 (see server/.env)
npm run client   # Next.js app on :3000
```

---

## 🗂 Project Structure

```
FixItNow/
├── front-end/                 # Next.js (App Router) application
│   ├── app/
│   │   ├── (public)/          # Public pages: services, technicians, category, about, support, terms, privacy
│   │   ├── (auth)/            # Login / register / password flows
│   │   ├── booking/[id]       # Service booking pages (+ customer booking detail with PDF receipt)
│   │   ├── dashboard/          # Customer / technician / admin role-based dashboards
│   │   ├── map/               # Interactive nearest-match map
│   │   ├── payment/           # Payment gateway redirect + status pages
│   │   └── tasks/[id]         # Task / job-request detail pages
│   ├── components/            # Reusable UI + home sections
│   ├── service/               # API client layer (auth, publicApi, ...)
│   └── utils/                 # helpers (e.g. downPaymentReceipt print engine)
├── server/                    # Express + Prisma API
│   └── src/
│       ├── modules/           # auth, bookings, payments, servicesTechnicians, jobRequests, reviews, admin, map
│       ├── services/          # notification engine (BullMQ + EJS), pdfGenerator
│       ├── middlewares/       # JWT auth, RBAC guards
│       └── lib/               # prisma, redis, cloudinary, sslcommerz clients
├── features.md                # Detailed feature walkthrough
├── fixitnow.config.json       # Project showcase / portfolio config
└── resume-highlights.txt      # Resume bullet points
```

---

## 🔌 API Overview

| Method | Endpoint | Description |
|:--|:--|:--|
| `POST` | `/auth/register` | Register customer / technician |
| `POST` | `/auth/login` | Login (JWT access + refresh) |
| `GET` | `/services` | Paginated services with filters & sorting |
| `GET` | `/categories` | All service categories |
| `GET` | `/technicians` | Technician directory |
| `POST` | `/bookings` | Create a booking (validated time slots) |
| `PATCH` | `/technician/bookings/:id` | Technician updates booking status |
| `POST` | `/payments/create` | Create SSLCOMMERZ payment session |
| `POST` | `/payments/confirm` | Validate transaction, mark booking PAID |
| `GET` | `/payments` | User payment history |
| `GET` | `/map/technicians` | Nearest technicians (Haversine) |
| `GET` | `/map/tasks` | Nearest open tasks (Haversine) |
| `POST` | `/job-requests` | Customer posts a task |
| `POST` | `/job-requests/:id/applications` | Technician applies to a task |
| `GET` | `/admin/overview` | Admin analytics |
| `GET` | `/admin/bookings` | All platform bookings (searchable) |
| `POST` | `/reviews` | Leave rating & comment |
| `GET` | `/uploads/image` | Cloudinary image upload |

Full Postman collection: [`FixItNow.postman_collection.json`](./FixItNow.postman_collection.json)

---

*This document reflects the current codebase. Routes referenced: `/`, `/services`, `/technicians`, `/category`, `/booking/[id]`, `/payment`, `/map`, `/tasks/[id]`, and the role-based `/dashboard/*` sections.*
---