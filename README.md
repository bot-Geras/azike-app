# AZIKE Community Platform

<div align="center">
  <img src="./assets/logo.png" alt="AZIKE Logo" width="120" />
  <h3>Digital Community Management Platform</h3>
  <p>
    Membership Management • Event Ticketing • M-Pesa Payments • QR Check-ins
  </p>
</div>

---

## Overview

AZIKE is a full-stack community management platform that digitizes membership administration, event ticketing, payments, and member engagement.

The platform eliminates manual processes through automated membership validation, secure ticket issuance, M-Pesa payment reconciliation, QR-based event check-ins, and real-time administrative reporting.

### Core Features

- 🎫 Digital membership cards with barcode validation
- 🔄 Automated membership renewal workflows
- 💳 M-Pesa STK Push payment integration
- 🎟️ Event ticketing with member/non-member pricing
- 📱 QR code ticket generation and validation
- 🔔 Push notifications via Firebase Cloud Messaging
- 📊 Real-time analytics and reporting dashboard
- 🛡️ Secure authentication and payment verification

---

## Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                     AZIKE PLATFORM                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Mobile App          Admin Dashboard      External Services  │
│  (React Native)      (Next.js)            • M-Pesa Daraja    │
│        │                  │               • Firebase FCM     │
│        └──────────┬───────┘               • Cloudinary       │
│                   │                                        │
│                   ▼                                        │
│           Express API (Node.js + TypeScript)              │
│                   │                                        │
│          ┌────────┴────────┐                               │
│          ▼                 ▼                               │
│      PostgreSQL          Redis                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---------|------------|
| Backend | Node.js 20, Express.js, TypeScript |
| Database | PostgreSQL 15, Prisma ORM |
| Cache | Redis 7 |
| Mobile | React Native, Expo, Expo Router, NativeWind |
| Admin Dashboard | Next.js, NextAuth.js, Tailwind CSS |
| Payments | Safaricom Daraja API |
| Notifications | Firebase Cloud Messaging |
| Storage | Cloudinary |
| Authentication | JWT, bcrypt |
| Validation | Zod |
| DevOps | Docker, Docker Compose |
| Monorepo | npm Workspaces |

---

## Project Structure

```text
azike-app/
│
├── packages/
│   ├── shared/
│   ├── server/
│   ├── mobile/
│   └── admin/
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
└── README.md
```

---

## Key Modules

### Membership Management

- Digital membership cards
- Membership status validation
- Renewal workflows
- Expiry enforcement
- Free annual event entitlement tracking

### Event Management

- Event creation and management
- Tiered member pricing
- Capacity management
- QR ticket generation
- Event attendance tracking

### Payments

- M-Pesa STK Push integration
- Callback verification
- Idempotent processing
- Automatic reconciliation
- Transaction history

### Notifications

- Push notifications
- Event reminders
- Community announcements
- Targeted messaging

---

## API Overview

### Authentication

| Method | Endpoint |
|----------|----------|
| POST | `/v1/auth/register` |
| POST | `/v1/auth/login` |
| POST | `/v1/auth/refresh` |
| GET | `/v1/auth/me` |

### Membership

| Method | Endpoint |
|----------|----------|
| GET | `/v1/membership/status` |
| GET | `/v1/membership/card` |
| POST | `/v1/membership/renew` |

### Events & Tickets

| Method | Endpoint |
|----------|----------|
| GET | `/v1/events` |
| GET | `/v1/events/:id` |
| POST | `/v1/tickets/events/:id/purchase` |
| GET | `/v1/tickets/my` |
| POST | `/v1/checkin/scan` |

### Administration

| Method | Endpoint |
|----------|----------|
| GET | `/v1/admin/dashboard/stats` |
| GET | `/v1/admin/members` |
| POST | `/v1/admin/events` |

> Total: 30+ REST endpoints across authentication, membership, events, payments, tickets, announcements, and administration.

---

## Database Design

### Main Entities

- Users
- Roles
- Memberships
- Membership Renewals
- Events
- Tickets
- Transactions
- Announcements
- Notifications


### Relationships

```text
Users
 ├── Memberships
 ├── Tickets
 ├── Transactions
 └── Notifications

Events
 └── Tickets
```

---

## Security

- JWT access and refresh token authentication
- Password hashing with bcrypt
- HMAC-SHA256 signed QR codes
- Redis-based rate limiting
- Input validation using Zod
- Prisma parameterized queries
- Secure M-Pesa callback verification
- Role-based access control (RBAC)

---

## Payment Workflow

```text
User
 │
 ├── Purchase Ticket
 ▼
Backend API
 │
 ├── Initiates STK Push
 ▼
Safaricom Daraja
 │
 ├── User Authorizes Payment
 ▼
Callback
 │
 ├── Verify Payment
 ├── Update Database
 └── Issue Ticket
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker
- Expo Go
- M-Pesa Daraja Sandbox Credentials

### Installation

```bash
git clone https://github.com/yourusername/azike-app.git

cd azike-app

npm install

cp .env.example .env

docker-compose up -d

npm run db:migrate -w packages/server

npm run db:seed -w packages/server

npm run dev
```

### Run Individual Services

```bash
npm run dev:server
npm run dev:mobile
npm run dev:admin
```

---

## Testing

```bash
npm run test
```

Backend only:

```bash
npm run test -w packages/server
```

Health check:

```bash
curl http://localhost:4000/health
```

---

## Project Status

| Component | Status |
|------------|---------|
| Backend API | ✅ Complete |
| Mobile App | ✅ Complete |
| Admin Dashboard | ✅ Complete |
| M-Pesa Integration | ✅ Sandbox Tested |
| Push Notifications | ✅ Complete |
| Production Deployment | 🚧 In Progress |

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

## License

Proprietary software developed for AZIKE Community.

All rights reserved.

---

## Contact

**Brian David Ikileng**

- Email: briandave771@gmail.com
- GitHub: https://github.com/bot-Geras

---

Built with ❤️ using Node.js, React Native, Next.js, PostgreSQL, and M-Pesa.

