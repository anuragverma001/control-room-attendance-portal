# Control Room Attendance Portal — Backend Project Setup Plan

**Company:** AVSOFT CORPORATION  
**Stack:** Node.js 22+ · Express · TypeScript · PostgreSQL · Prisma · JWT · OTP · Multer  
**Document version:** 1.0  
**Status:** Implementation-ready  
**References:** [project-requirements.md](./project-requirements.md) · [system-architecture.md](./system-architecture.md) · [database-design.md](../database/database-design.md) · [prisma-schema-plan.md](../database/prisma-schema-plan.md) · [backend-blueprint.md](./backend-blueprint.md)

---

## Quick Start (TL;DR)

```bash
# From repository root
cd control-room-attendance-portal
mkdir -p apps/api && cd apps/api

# 1. Initialize package (or copy package.json from Section 2)
npm init -y
npm install express cors helmet compression morgan dotenv bcrypt jsonwebtoken zod ioredis multer uuid
npm install @prisma/client
npm install -D typescript @types/node @types/express @types/bcrypt @types/jsonwebtoken @types/multer @types/morgan tsx prisma nodemon eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# 2. Copy configs from Sections 3–4
# 3. Copy prisma/schema.prisma from database/prisma-schema-plan.md
npx prisma generate
npx prisma migrate dev --name init

# 4. Scaffold src/ per Section 1
npm run dev
```

---

## Table of Contents

1. [Complete Backend Folder Structure](#1-complete-backend-folder-structure)
2. [package.json Dependencies](#2-packagejson-dependencies)
3. [TypeScript Configuration](#3-typescript-configuration)
4. [Environment Variables Structure](#4-environment-variables-structure)
5. [Database Connection Setup](#5-database-connection-setup)
6. [Prisma Setup Instructions](#6-prisma-setup-instructions)
7. [Authentication Module Setup](#7-authentication-module-setup)
8. [Employee Module Setup](#8-employee-module-setup)
9. [Attendance Module Setup](#9-attendance-module-setup)
10. [Leave Module Setup](#10-leave-module-setup)
11. [Salary Module Setup](#11-salary-module-setup)
12. [Notification Module Setup](#12-notification-module-setup)
13. [Docker Compose (Local Dev)](#13-docker-compose-local-dev)
14. [Verification Checklist](#14-verification-checklist)

---

## 1. Complete Backend Folder Structure

Create **`apps/api`** as the single backend application. Prisma lives at **`apps/api/prisma`** (copy schema from [prisma-schema-plan.md](../database/prisma-schema-plan.md)).

```
control-room-attendance-portal/
├── docker-compose.yml                    # Section 13
├── docs/
│   ├── backend-setup-plan.md             # This file
│   └── backend-blueprint.md
├── database/
│   ├── database-design.md
│   └── prisma-schema-plan.md
└── apps/
    └── api/
        ├── package.json
        ├── tsconfig.json
        ├── tsconfig.build.json
        ├── nodemon.json
        ├── .env
        ├── .env.example
        ├── .gitignore
        ├── prisma/
        │   ├── schema.prisma
        │   ├── migrations/
        │   ├── seed.ts
        │   └── seeds/
        │       ├── 01-company.ts
        │       ├── 02-shifts.ts
        │       ├── 03-leave-types.ts
        │       ├── 04-control-room.ts
        │       └── 05-hr-admin.ts
        └── src/
            ├── server.ts
            ├── app.ts
            ├── config/
            │   ├── index.ts
            │   ├── constants.ts
            │   └── env.schema.ts
            ├── core/
            │   ├── container.ts
            │   ├── prisma/
            │   │   ├── client.ts
            │   │   └── disconnect.ts
            │   ├── redis/
            │   │   └── client.ts
            │   ├── storage/
            │   │   ├── storage.interface.ts
            │   │   ├── local.storage.ts          # Dev fallback
            │   │   └── s3.storage.ts
            │   ├── face/
            │   │   ├── face-provider.interface.ts
            │   │   ├── mock.face-provider.ts     # Dev until AWS/etc.
            │   │   └── rekognition.face-provider.ts
            │   └── jobs/
            │       └── derived-days.job.ts
            ├── common/
            │   ├── errors/
            │   │   ├── AppError.ts
            │   │   ├── error-codes.ts
            │   │   └── error-handler.middleware.ts
            │   ├── http/
            │   │   ├── ApiResponse.ts
            │   │   └── async-handler.ts
            │   ├── middleware/
            │   │   ├── authenticate.middleware.ts
            │   │   ├── authorize.middleware.ts
            │   │   ├── validate.middleware.ts
            │   │   ├── rate-limit.middleware.ts
            │   │   ├── request-id.middleware.ts
            │   │   ├── upload-selfie.middleware.ts
            │   │   ├── upload-document.middleware.ts
            │   │   └── audit.middleware.ts
            │   ├── utils/
            │   │   ├── haversine.ts
            │   │   ├── shift-date.ts
            │   │   ├── pagination.ts
            │   │   └── identifier.ts
            │   └── types/
            │       ├── express.d.ts
            │       └── jwt-payload.ts
            ├── routes/
            │   └── index.ts
            └── modules/
                ├── auth/
                │   ├── auth.routes.ts
                │   ├── auth.controller.ts
                │   ├── auth.service.ts
                │   ├── auth.repository.ts
                │   ├── auth.validation.ts
                │   ├── jwt.service.ts
                │   └── otp.service.ts
                ├── employees/
                │   ├── employees.routes.ts
                │   ├── employees.controller.ts
                │   ├── employees.service.ts
                │   ├── employees.repository.ts
                │   └── employees.validation.ts
                ├── attendance/
                │   ├── attendance.routes.ts
                │   ├── attendance.controller.ts
                │   ├── attendance.service.ts
                │   ├── attendance.repository.ts
                │   ├── attendance.validation.ts
                │   └── engines/
                │       ├── punch.engine.ts
                │       ├── geofence.engine.ts
                │       └── derived-days.engine.ts
                ├── face/
                │   ├── face.routes.ts
                │   ├── face.controller.ts
                │   ├── face.service.ts
                │   └── face.repository.ts
                ├── geofence/
                │   ├── geofence.routes.ts
                │   ├── geofence.controller.ts
                │   ├── geofence.service.ts
                │   └── geofence.repository.ts
                ├── leave/
                │   ├── leave.routes.ts
                │   ├── leave.controller.ts
                │   ├── leave.service.ts
                │   ├── leave.repository.ts
                │   ├── leave.validation.ts
                │   └── engines/
                │       └── leave-approval.engine.ts
                ├── comp-off/
                │   ├── comp-off.routes.ts
                │   ├── comp-off.service.ts
                │   └── comp-off.repository.ts
                ├── payroll/
                │   ├── payroll.routes.ts
                │   ├── payroll.controller.ts
                │   ├── payroll.service.ts
                │   ├── payroll.repository.ts
                │   ├── payroll.validation.ts
                │   └── engines/
                │       └── salary.engine.ts
                ├── notifications/
                │   ├── notifications.routes.ts
                │   ├── notifications.controller.ts
                │   ├── notifications.service.ts
                │   ├── notifications.repository.ts
                │   ├── notifications.validation.ts
                │   └── providers/
                │       ├── email.provider.ts
                │       ├── whatsapp.provider.ts
                │       └── push.provider.ts
                ├── shifts/
                ├── weekly-off/
                ├── documents/
                ├── reports/
                └── audit/
                    └── audit.repository.ts
```

### 1.1 Bootstrap Commands

```bash
cd apps/api
mkdir -p prisma/seeds src/{config,core/{prisma,redis,storage,face,jobs},common/{errors,http,middleware,utils,types},routes,modules/{auth,employees,attendance/engines,face,geofence,leave/engines,payroll/engines,notifications/providers,comp-off,shifts,weekly-off,documents,reports,audit}}
```

---

## 2. package.json Dependencies

Create **`apps/api/package.json`**:

```json
{
  "name": "@avsoft/control-room-api",
  "version": "1.0.0",
  "private": true,
  "description": "AVSOFT Control Room Attendance Portal API",
  "engines": {
    "node": ">=22.0.0"
  },
  "main": "dist/server.js",
  "scripts": {
    "dev": "nodemon",
    "build": "tsc -p tsconfig.build.json",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:migrate:deploy": "prisma migrate deploy",
    "prisma:studio": "prisma studio",
    "prisma:seed": "tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset --force"
  },
  "dependencies": {
    "@prisma/client": "^6.8.0",
    "bcrypt": "^5.1.1",
    "compression": "^1.8.0",
    "cors": "^2.8.5",
    "dotenv": "^16.5.0",
    "express": "^4.21.2",
    "express-rate-limit": "^7.5.0",
    "helmet": "^8.1.0",
    "ioredis": "^5.6.1",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.2",
    "uuid": "^11.1.0",
    "zod": "^3.24.4"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/compression": "^1.7.5",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.9",
    "@types/morgan": "^1.9.9",
    "@types/multer": "^1.4.12",
    "@types/node": "^22.15.3",
    "@typescript-eslint/eslint-plugin": "^8.32.0",
    "@typescript-eslint/parser": "^8.32.0",
    "eslint": "^9.26.0",
    "nodemon": "^3.1.10",
    "prisma": "^6.8.0",
    "tsx": "^4.19.4",
    "typescript": "^5.8.3"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

### 2.1 Optional Production Dependencies (add when enabling)

| Package | Purpose |
|---------|---------|
| `@aws-sdk/client-s3` | Selfie & document storage |
| `@aws-sdk/client-rekognition` | Face recognition |
| `twilio` | WhatsApp / SMS OTP |
| `@sendgrid/mail` | Email OTP & notifications |
| `firebase-admin` | Mobile push |
| `bullmq` | Background jobs |
| `pino` / `pino-http` | Structured logging |

---

## 3. TypeScript Configuration

### 3.1 `apps/api/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3.2 `apps/api/tsconfig.build.json`

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### 3.3 `apps/api/nodemon.json`

```json
{
  "watch": ["src"],
  "ext": "ts",
  "ignore": ["src/**/*.test.ts"],
  "exec": "tsx src/server.ts"
}
```

### 3.4 `apps/api/src/common/types/express.d.ts`

```typescript
import type { JwtPayload } from './jwt-payload';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      user?: JwtPayload;
    }
  }
}

export {};
```

### 3.5 `apps/api/src/common/types/jwt-payload.ts`

```typescript
import type { UserRole } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  companyId: string;
  role: UserRole;
  employeeId?: string;
  hrAdminId?: string;
}
```

---

## 4. Environment Variables Structure

### 4.1 `apps/api/.env.example`

Copy to `.env` and fill values.

```env
# ─── Application ─────────────────────────────────────────────
NODE_ENV=development
PORT=3000
API_BASE_PATH=/api/v1
CORS_ORIGINS=http://localhost:5173,http://localhost:3001

# ─── Database (PostgreSQL) ───────────────────────────────────
DATABASE_URL=postgresql://cr_user:cr_pass@localhost:5432/control_room_attendance?schema=public

# ─── JWT ─────────────────────────────────────────────────────
JWT_ACCESS_SECRET=change-me-access-min-32-chars-long-secret
JWT_REFRESH_SECRET=change-me-refresh-min-32-chars-long-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ─── Redis (OTP + refresh tokens) ────────────────────────────
REDIS_URL=redis://localhost:6379

# ─── OTP ─────────────────────────────────────────────────────
OTP_LENGTH=6
OTP_TTL_SECONDS=300
OTP_MAX_ATTEMPTS=5

# ─── Attendance / Face / GPS ─────────────────────────────────
GEOFENCE_RADIUS_METERS=50
FACE_MATCH_THRESHOLD=80
GRACE_MINUTES=10
STANDARD_HOURS_PER_DAY=8
LATE_HALF_DAY_AFTER_MINUTES=120

# ─── File Upload (Multer) ────────────────────────────────────
UPLOAD_MAX_SELFIE_MB=5
UPLOAD_MAX_DOCUMENT_MB=10
UPLOAD_ALLOWED_SELFIE_MIME=image/jpeg,image/png,image/webp
UPLOAD_ALLOWED_DOCUMENT_MIME=application/pdf,image/jpeg,image/png

# ─── Storage ─────────────────────────────────────────────────
STORAGE_DRIVER=local
# local
LOCAL_UPLOAD_DIR=./uploads
LOCAL_PUBLIC_BASE_URL=http://localhost:3000/uploads
# s3 (production)
AWS_REGION=ap-south-1
AWS_S3_BUCKET=avsoft-cr-portal
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# ─── Face Recognition ─────────────────────────────────────────
FACE_PROVIDER=mock
# mock | rekognition
AWS_REKOGNITION_COLLECTION_ID=avsoft-employees

# ─── Notifications (optional in dev) ─────────────────────────
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@avsoft.com
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=

# ─── Seed (dev/staging only) ─────────────────────────────────
SEED_HR_EMAIL=hr@avsoft.local
SEED_HR_MOBILE=+919000000001
SEED_HR_PASSWORD=ChangeMe123!
SEED_HR_FULL_NAME=HR Administrator
```

### 4.2 `apps/api/src/config/env.schema.ts`

```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production', 'staging']).default('development'),
  PORT: z.coerce.number().default(3000),
  API_BASE_PATH: z.string().default('/api/v1'),
  CORS_ORIGINS: z.string().transform((s) => s.split(',').map((o) => o.trim())),

  DATABASE_URL: z.string().url().startsWith('postgresql'),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  REDIS_URL: z.string(),

  OTP_LENGTH: z.coerce.number().default(6),
  OTP_TTL_SECONDS: z.coerce.number().default(300),
  OTP_MAX_ATTEMPTS: z.coerce.number().default(5),

  GEOFENCE_RADIUS_METERS: z.coerce.number().default(50),
  FACE_MATCH_THRESHOLD: z.coerce.number().default(80),
  GRACE_MINUTES: z.coerce.number().default(10),
  STANDARD_HOURS_PER_DAY: z.coerce.number().default(8),
  LATE_HALF_DAY_AFTER_MINUTES: z.coerce.number().default(120),

  UPLOAD_MAX_SELFIE_MB: z.coerce.number().default(5),
  UPLOAD_MAX_DOCUMENT_MB: z.coerce.number().default(10),
  UPLOAD_ALLOWED_SELFIE_MIME: z.string(),
  UPLOAD_ALLOWED_DOCUMENT_MIME: z.string(),

  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  LOCAL_UPLOAD_DIR: z.string().default('./uploads'),
  LOCAL_PUBLIC_BASE_URL: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),

  FACE_PROVIDER: z.enum(['mock', 'rekognition']).default('mock'),
  AWS_REKOGNITION_COLLECTION_ID: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  return envSchema.parse(process.env);
}
```

### 4.3 `apps/api/src/config/index.ts`

```typescript
import dotenv from 'dotenv';
import { loadEnv } from './env.schema';

dotenv.config();
export const env = loadEnv();
```

### 4.4 `apps/api/src/config/constants.ts`

```typescript
import { env } from './index';

export const ATTENDANCE = {
  geofenceRadiusMeters: env.GEOFENCE_RADIUS_METERS,
  faceMatchThreshold: env.FACE_MATCH_THRESHOLD,
  graceMinutes: env.GRACE_MINUTES,
  lateHalfDayAfterMinutes: env.LATE_HALF_DAY_AFTER_MINUTES,
  standardHoursPerDay: env.STANDARD_HOURS_PER_DAY,
} as const;
```

### 4.5 `apps/api/.gitignore`

```
node_modules/
dist/
.env
uploads/
*.log
.DS_Store
```

---

## 5. Database Connection Setup

### 5.1 Prisma Client Singleton — `src/core/prisma/client.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { env } from '../../config';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### 5.2 Graceful Shutdown — `src/core/prisma/disconnect.ts`

```typescript
import { prisma } from './client';
import { redis } from '../redis/client';

export async function disconnectDatabases(): Promise<void> {
  await prisma.$disconnect();
  redis.disconnect();
}
```

### 5.3 Redis Client — `src/core/redis/client.ts`

```typescript
import Redis from 'ioredis';
import { env } from '../../config';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

export async function connectRedis(): Promise<void> {
  if (redis.status === 'wait') await redis.connect();
}
```

### 5.4 Server Bootstrap — `src/server.ts`

```typescript
import { app } from './app';
import { env } from './config';
import { connectRedis } from './core/redis/client';
import { prisma } from './core/prisma/client';
import { disconnectDatabases } from './core/prisma/disconnect';

async function main() {
  await connectRedis();
  await prisma.$connect();

  const server = app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}${env.API_BASE_PATH}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received, shutting down...`);
    server.close();
    await disconnectDatabases();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

### 5.5 Express App — `src/app.ts`

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { env } from './config';
import { buildApiRouter } from './routes';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';
import { errorHandler } from './common/errors/error-handler.middleware';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(requestIdMiddleware);

if (env.STORAGE_DRIVER === 'local') {
  app.use('/uploads', express.static(path.resolve(env.LOCAL_UPLOAD_DIR)));
}

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use(env.API_BASE_PATH, buildApiRouter());
app.use(errorHandler);
```

---

## 6. Prisma Setup Instructions

### 6.1 Step-by-Step

| Step | Command / action |
|------|------------------|
| 1 | Start PostgreSQL (Section 13 Docker) |
| 2 | Copy full `schema.prisma` from [prisma-schema-plan.md §2](../database/prisma-schema-plan.md) → `apps/api/prisma/schema.prisma` |
| 3 | Set `DATABASE_URL` in `.env` |
| 4 | `cd apps/api && npx prisma generate` |
| 5 | `npx prisma migrate dev --name init` |
| 6 | Add partial indexes (optional SQL migration per prisma-schema-plan §2.3) |
| 7 | `npm run prisma:seed` |
| 8 | `npx prisma studio` (optional UI) |

### 6.2 `prisma/schema.prisma` Header (verify)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 6.3 Seed Entry — `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { seedCompany } from './seeds/01-company';
import { seedShifts } from './seeds/02-shifts';
import { seedLeaveTypes } from './seeds/03-leave-types';
import { seedControlRoom } from './seeds/04-control-room';
import { seedHrAdmin } from './seeds/05-hr-admin';

const prisma = new PrismaClient();

async function main() {
  const company = await seedCompany(prisma);
  await seedShifts(prisma, company.id);
  await seedLeaveTypes(prisma, company.id);
  await seedControlRoom(prisma, company.id);
  await seedHrAdmin(prisma, company.id);
  console.log('Seed completed for AVSOFT CORPORATION');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

### 6.4 Post-Migrate Checklist

- [ ] `npx prisma validate` passes
- [ ] `@prisma/client` imports work in `src/`
- [ ] Seed creates company, 3 shifts, 4 leave types, 1 control room site, 1 HR admin
- [ ] Partial unique indexes applied for soft-deleted users

---

## 7. Authentication Module Setup

**Path:** `src/modules/auth/`  
**Routes base:** `/api/v1/auth`

### 7.1 Files to Create

| File | Purpose |
|------|---------|
| `jwt.service.ts` | Sign/verify access & refresh tokens |
| `otp.service.ts` | Generate OTP, store in Redis, verify |
| `auth.repository.ts` | UserAuth CRUD, find by email/mobile |
| `auth.service.ts` | loginPassword, requestOtp, verifyOtp, refresh, logout |
| `auth.validation.ts` | Zod schemas |
| `auth.controller.ts` | HTTP handlers |
| `auth.routes.ts` | Route definitions |

### 7.2 Routes — `auth.routes.ts`

```typescript
import { Router } from 'express';
import { validate } from '../../common/middleware/validate.middleware';
import { authenticate } from '../../common/middleware/authenticate.middleware';
import { authRateLimiter, otpRateLimiter } from '../../common/middleware/rate-limit.middleware';
import {
  loginPasswordSchema,
  otpRequestSchema,
  otpVerifySchema,
  refreshTokenSchema,
} from './auth.validation';
import { authController } from '../../core/container';

const router = Router();

router.post('/login/password', authRateLimiter, validate({ body: loginPasswordSchema }), authController.loginPassword);
router.post('/login/otp/request', otpRateLimiter, validate({ body: otpRequestSchema }), authController.requestOtp);
router.post('/login/otp/verify', authRateLimiter, validate({ body: otpVerifySchema }), authController.verifyOtp);
router.post('/refresh', validate({ body: refreshTokenSchema }), authController.refresh);
router.post('/logout', authenticate, authController.logout);

export const authRoutes = router;
```

### 7.3 Validation — `auth.validation.ts`

```typescript
import { z } from 'zod';

export const loginPasswordSchema = z.object({
  identifier: z.string().min(3), // email or mobile
  password: z.string().min(8),
});

export const otpRequestSchema = z.object({
  identifier: z.string().min(3),
});

export const otpVerifySchema = z.object({
  identifier: z.string().min(3),
  otp: z.string().length(6),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});
```

### 7.4 JWT Service — `jwt.service.ts`

```typescript
import jwt from 'jsonwebtoken';
import { env } from '../../config';
import type { JwtPayload } from '../../common/types/jwt-payload';

export class JwtService {
  signAccess(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      subject: payload.userId,
    });
  }

  signRefresh(userId: string, jti: string): string {
    return jwt.sign({ jti }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
      subject: userId,
    });
  }

  verifyAccess(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
  }

  verifyRefresh(token: string): { sub: string; jti: string } {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string; jti: string };
  }
}
```

### 7.5 OTP Service — `otp.service.ts`

```typescript
import { randomInt } from 'crypto';
import { redis } from '../../core/redis/client';
import { env } from '../../config';
import { AppError } from '../../common/errors/AppError';

const key = (identifier: string) => `otp:${identifier.toLowerCase()}`;

export class OtpService {
  async send(identifier: string): Promise<void> {
    const code = String(randomInt(100000, 999999)).padStart(env.OTP_LENGTH, '0');
    await redis.setex(key(identifier), env.OTP_TTL_SECONDS, code);
    // TODO: integrate Twilio/SendGrid based on email vs mobile
    if (env.NODE_ENV === 'development') console.log(`[DEV OTP] ${identifier}: ${code}`);
  }

  async verify(identifier: string, otp: string): Promise<void> {
    const stored = await redis.get(key(identifier));
    if (!stored) throw new AppError(401, 'OTP_EXPIRED');
    if (stored !== otp) throw new AppError(401, 'OTP_INVALID');
    await redis.del(key(identifier));
  }
}
```

### 7.6 Auth Service Login Flow — `auth.service.ts` (core)

```typescript
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { AuthRepository } from './auth.repository';
import { JwtService } from './jwt.service';
import { OtpService } from './otp.service';
import { redis } from '../../core/redis/client';
import { AppError } from '../../common/errors/AppError';

export class AuthService {
  constructor(
    private authRepo: AuthRepository,
    private jwt: JwtService,
    private otp: OtpService,
  ) {}

  async loginPassword(identifier: string, password: string) {
    const user = await this.authRepo.findByIdentifier(identifier);
    if (!user?.passwordHash) throw new AppError(401, 'INVALID_CREDENTIALS');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new AppError(401, 'INVALID_CREDENTIALS');
    return this.issueTokens(user);
  }

  async requestOtp(identifier: string) {
    const user = await this.authRepo.findByIdentifier(identifier);
    if (!user) throw new AppError(401, 'INVALID_CREDENTIALS'); // or generic in prod
    await this.otp.send(identifier);
  }

  async verifyOtp(identifier: string, otp: string) {
    await this.otp.verify(identifier, otp);
    const user = await this.authRepo.findByIdentifier(identifier);
    if (!user) throw new AppError(401, 'INVALID_CREDENTIALS');
    return this.issueTokens(user);
  }

  private async issueTokens(user: Awaited<ReturnType<AuthRepository['findByIdentifier']>>) {
    const jti = uuid();
    const payload = await this.authRepo.buildJwtPayload(user!);
    const accessToken = this.jwt.signAccess(payload);
    const refreshToken = this.jwt.signRefresh(user!.id, jti);
    await redis.setex(`refresh:${jti}`, 7 * 24 * 3600, user!.id);
    await this.authRepo.updateLastLogin(user!.id);
    return { accessToken, refreshToken, user: payload };
  }
}
```

### 7.7 Authenticate Middleware

```typescript
// src/common/middleware/authenticate.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { JwtService } from '../../modules/auth/jwt.service';
import { AppError } from '../errors/AppError';

const jwtService = new JwtService();

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new AppError(401, 'UNAUTHORIZED');
  req.user = jwtService.verifyAccess(header.slice(7));
  next();
}
```

### 7.8 Auth Module Checklist

- [ ] Password login with email or mobile
- [ ] OTP request + verify
- [ ] Refresh token in Redis
- [ ] Logout revokes `jti`
- [ ] Rate limits on login/OTP routes
- [ ] JWT includes `employeeId` / `hrAdminId` based on role

---

## 8. Employee Module Setup

**Path:** `src/modules/employees/`  
**Routes base:** `/api/v1/employees`

### 8.1 Routes

```typescript
import { Router } from 'express';
import { authenticate } from '../../common/middleware/authenticate.middleware';
import { authorize } from '../../common/middleware/authorize.middleware';
import { validate } from '../../common/middleware/validate.middleware';
import { createEmployeeSchema, updateEmployeeSchema, listEmployeesQuerySchema } from './employees.validation';
import { employeesController } from '../../core/container';

const router = Router();

router.use(authenticate);

router.get('/me', authorize('EMPLOYEE'), employeesController.getMe);
router.patch('/me', authorize('EMPLOYEE'), validate({ body: updateEmployeeSchema }), employeesController.updateMe);

router.get('/', authorize('HR_ADMIN'), validate({ query: listEmployeesQuerySchema }), employeesController.list);
router.post('/', authorize('HR_ADMIN'), validate({ body: createEmployeeSchema }), employeesController.create);
router.get('/:id', authorize('HR_ADMIN'), employeesController.getById);
router.patch('/:id', authorize('HR_ADMIN'), validate({ body: updateEmployeeSchema }), employeesController.update);
router.delete('/:id', authorize('HR_ADMIN'), employeesController.deactivate);

export const employeeRoutes = router;
```

### 8.2 Create Employee Transaction

On HR `POST /employees`, run single Prisma transaction:

1. `UserAuth` — role `EMPLOYEE`, email/mobile, `passwordHash`
2. `Employee` — code, name, department, joinDate
3. `EmployeeProfile` — empty defaults
4. `NotificationPreference` — email + mobile app enabled
5. `CompOffBalance` — balance `0`
6. `LeaveBalance` — current year for CASUAL, SICK, PAID (from HR input or defaults)
7. Optional: `ShiftAssignment` + `SalaryStructure` if provided in DTO

```typescript
// employees.service.ts — create excerpt
async create(dto: CreateEmployeeDto, hrAdminId: string) {
  const passwordHash = await bcrypt.hash(dto.password, 12);
  return this.prisma.$transaction(async (tx) => {
    const repo = this.employeesRepo.withTransaction(tx);
    return repo.createFullEmployee({ ...dto, passwordHash, createdByHrAdminId: hrAdminId });
  });
}
```

### 8.3 Validation — `createEmployeeSchema`

```typescript
export const createEmployeeSchema = z.object({
  email: z.string().email().optional(),
  mobile: z.string().min(10).optional(),
  password: z.string().min(8),
  employeeCode: z.string().min(1).max(32),
  fullName: z.string().min(1),
  department: z.string().optional(),
  designation: z.string().optional(),
  joinDate: z.string().date(),
  shiftId: z.string().uuid().optional(),
  fixedMonthlyGross: z.number().positive().optional(),
  leaveAllocation: z.object({
    CASUAL: z.number().default(12),
    SICK: z.number().default(10),
    PAID: z.number().default(15),
  }).optional(),
}).refine((d) => d.email || d.mobile, { message: 'email or mobile required' });
```

### 8.4 Employee Module Checklist

- [ ] `GET /me` returns employee + profile + current shift
- [ ] Soft delete sets `deletedAt` on User + Employee
- [ ] Unique `employeeCode` per company enforced
- [ ] HR cannot access another employee's `/me` routes

---

## 9. Attendance Module Setup

**Path:** `src/modules/attendance/` (+ `face/`, `geofence/`)  
**GPS ready · Face ready · Multer selfies**

### 9.1 Multer Selfie Upload — `upload-selfie.middleware.ts`

```typescript
import multer from 'multer';
import { env } from '../../config';
import { AppError } from '../errors/AppError';

const allowed = env.UPLOAD_ALLOWED_SELFIE_MIME.split(',');

export const uploadSelfie = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.UPLOAD_MAX_SELFIE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowed.includes(file.mimetype)) {
      return cb(new AppError(400, 'INVALID_FILE_TYPE'));
    }
    cb(null, true);
  },
});
```

### 9.2 Attendance Routes

```typescript
router.post(
  '/punch-in',
  authenticate,
  authorize('EMPLOYEE'),
  uploadSelfie.single('selfie'),
  validate({ body: punchBodySchema }),
  attendanceController.punchIn,
);

router.post(
  '/punch-out',
  authenticate,
  authorize('EMPLOYEE'),
  uploadSelfie.single('selfie'),
  validate({ body: punchBodySchema }),
  attendanceController.punchOut,
);
```

### 9.3 Punch Body Validation

```typescript
export const punchBodySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  accuracyMeters: z.coerce.number().positive().optional(),
  clientRequestId: z.string().min(8).max(64),
});
```

### 9.4 Geofence Engine — `geofence.engine.ts`

```typescript
import { haversineMeters } from '../../common/utils/haversine';
import { ATTENDANCE } from '../../config/constants';

export class GeofenceEngine {
  validate(
    lat: number,
    lng: number,
    site: { latitude: number; longitude: number; radiusMeters: number },
  ) {
    const distanceMeters = haversineMeters(lat, lng, Number(site.latitude), Number(site.longitude));
    const allowedRadius = site.radiusMeters ?? ATTENDANCE.geofenceRadiusMeters;
    return {
      distanceMeters,
      allowedRadiusMeters: allowedRadius,
      withinGeofence: distanceMeters <= allowedRadius,
    };
  }
}
```

### 9.5 Haversine Utility — `haversine.ts`

```typescript
const R = 6371000; // Earth radius meters

export function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
```

### 9.6 Face Provider Interface — `face-provider.interface.ts`

```typescript
export interface FaceMatchResult {
  matchScore: number;
  passed: boolean;
  providerName: string;
  providerRequestId?: string;
  rawResponse?: unknown;
}

export interface FaceProvider {
  enroll(employeeId: string, imageBuffer: Buffer): Promise<{ externalFaceId: string }>;
  compare(imageBuffer: Buffer, enrollment: { externalFaceId?: string; referenceImageUrl: string }): Promise<FaceMatchResult>;
}
```

### 9.7 Mock Face Provider (dev) — `mock.face-provider.ts`

```typescript
import { ATTENDANCE } from '../../config/constants';
import type { FaceProvider, FaceMatchResult } from './face-provider.interface';

export class MockFaceProvider implements FaceProvider {
  async enroll(employeeId: string) {
    return { externalFaceId: `mock-${employeeId}` };
  }

  async compare(): Promise<FaceMatchResult> {
    const matchScore = 95;
    return {
      matchScore,
      passed: matchScore >= ATTENDANCE.faceMatchThreshold,
      providerName: 'mock',
    };
  }
}
```

Wire in `core/container.ts`: `FACE_PROVIDER=mock` → `MockFaceProvider`, `rekognition` → `RekognitionFaceProvider`.

### 9.8 Punch Engine Pipeline

```
uploadSelfie → GeofenceEngine → FaceProvider → ShiftDateResolver → AttendanceRepository.createPunchBundle
```

Register in `routes/index.ts`:

```typescript
import { authRoutes } from '../modules/auth/auth.routes';
import { employeeRoutes } from '../modules/employees/employees.routes';
import { attendanceRoutes } from '../modules/attendance/attendance.routes';
import { faceRoutes } from '../modules/face/face.routes';
import { geofenceRoutes } from '../modules/geofence/geofence.routes';
// ...

export function buildApiRouter() {
  const router = Router();
  router.use('/auth', authRoutes);
  router.use('/employees', employeeRoutes);
  router.use('/attendance', attendanceRoutes);
  router.use('/face', faceRoutes);
  router.use('/geofence', geofenceRoutes);
  return router;
}
```

### 9.9 Attendance Module Checklist

- [ ] Idempotent `clientRequestId`
- [ ] Geofence 50 m enforced
- [ ] Face score ≥ 80 or HTTP 422
- [ ] Punch OUT requires open IN same `shiftDate`
- [ ] Selfie stored via StorageAdapter
- [ ] `GET /geofence/validate` for mobile pre-check

---

## 10. Leave Module Setup

**Path:** `src/modules/leave/` + `src/modules/comp-off/`

### 10.1 Leave Routes

```typescript
router.get('/types', authenticate, leaveController.getTypes);
router.get('/balances/me', authenticate, authorize('EMPLOYEE'), leaveController.getMyBalances);
router.post('/requests', authenticate, authorize('EMPLOYEE'), validate({ body: createLeaveRequestSchema }), leaveController.createRequest);
router.get('/requests/me', authenticate, authorize('EMPLOYEE'), leaveController.getMyRequests);
router.get('/requests', authenticate, authorize('HR_ADMIN'), leaveController.listRequests);
router.post('/requests/:id/approve', authenticate, authorize('HR_ADMIN'), validate({ body: approveRejectSchema }), leaveController.approve);
router.post('/requests/:id/reject', authenticate, authorize('HR_ADMIN'), validate({ body: approveRejectSchema }), leaveController.reject);
router.post('/requests/:id/cancel', authenticate, authorize('EMPLOYEE'), leaveController.cancel);
```

### 10.2 Create Leave Request Schema

```typescript
export const createLeaveRequestSchema = z.object({
  leaveTypeCode: z.enum(['CASUAL', 'SICK', 'PAID', 'COMP_OFF']),
  startDate: z.string().date(),
  endDate: z.string().date(),
  totalDays: z.number().positive(),
  isHalfDay: z.boolean().default(false),
  halfDayPeriod: z.enum(['FIRST_HALF', 'SECOND_HALF']).optional(),
  reason: z.string().max(2000).optional(),
}).refine((d) => d.startDate <= d.endDate, { message: 'startDate must be <= endDate' });
```

### 10.3 Leave Approval Engine

```typescript
// leave/engines/leave-approval.engine.ts
export class LeaveApprovalEngine {
  async approve(ctx: { tx: PrismaTransaction; requestId: string; hrAdminId: string; remarks?: string }) {
    const request = await ctx.leaveRepo.getForUpdate(ctx.requestId);
    if (request.status !== 'PENDING') throw new AppError(409, 'INVALID_STATE');
    if (request.leaveType.code === 'COMP_OFF') {
      await ctx.compOffRepo.debit(request.employeeId, Number(request.totalDays), request.id, ctx.tx);
    } else {
      await ctx.leaveRepo.deductBalance(request.employeeId, request.leaveTypeId, request.totalDays, ctx.tx);
    }
    await ctx.leaveRepo.markApproved(request.id, ctx.hrAdminId, ctx.remarks, ctx.tx);
  }
}
```

### 10.4 Comp-Off Routes (`/api/v1/comp-off`)

```typescript
router.get('/balance/me', authenticate, authorize('EMPLOYEE'), compOffController.getMyBalance);
router.get('/balance/:employeeId', authenticate, authorize('HR_ADMIN'), compOffController.getBalance);
router.get('/logs', authenticate, authorize('HR_ADMIN'), compOffController.getLedger);
```

### 10.5 Leave Module Checklist

- [ ] Overlap check for approved leave
- [ ] COMP_OFF debits ledger; others debit `LeaveBalance`
- [ ] Cancel only when PENDING
- [ ] Notification on approve/reject

---

## 11. Salary Module Setup

**Path:** `src/modules/payroll/`  
**Routes base:** `/api/v1/payroll`

### 11.1 Routes

```typescript
router.post('/calculate', authenticate, authorize('HR_ADMIN'), validate({ body: calculatePayrollSchema }), payrollController.calculate);
router.get('/', authenticate, authorize('HR_ADMIN'), payrollController.list);
router.get('/me', authenticate, authorize('EMPLOYEE'), payrollController.getMySlips);
router.get('/:id', authenticate, payrollController.getById);
router.post('/:id/finalize', authenticate, authorize('HR_ADMIN'), payrollController.finalize);
router.get('/export', authenticate, authorize('HR_ADMIN'), payrollController.export);
```

### 11.2 Calculate Schema

```typescript
export const calculatePayrollSchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100),
  month: z.coerce.number().int().min(1).max(12),
  employeeIds: z.array(z.string().uuid()).optional(),
});
```

### 11.3 Salary Engine — `salary.engine.ts`

```typescript
import { Decimal } from '@prisma/client/runtime/library';
import { ATTENDANCE } from '../../config/constants';

export class SalaryEngine {
  build(input: {
    gross: Decimal;
    workingDaysInMonth: number;
    derivedDays: Array<{ status: string; lateMinutes?: number | null; workDate: Date }>;
    standardHoursPerDay: number;
  }) {
    const dailyRate = input.gross.div(input.workingDaysInMonth);
    const hourlyRate = dailyRate.div(input.standardHoursPerDay);
    const deductions: Array<{ type: string; amount: Decimal; workDate?: Date; lateHours?: number }> = [];

    for (const day of input.derivedDays) {
      if (day.status === 'ABSENT') {
        deductions.push({ type: 'ABSENT', amount: dailyRate, workDate: day.workDate });
      } else if (day.status === 'LATE' && day.lateMinutes != null) {
        if (day.lateMinutes > ATTENDANCE.lateHalfDayAfterMinutes) {
          deductions.push({ type: 'LATE_HALF_DAY', amount: dailyRate.div(2), workDate: day.workDate });
        } else {
          const lateHours = day.lateMinutes / 60;
          deductions.push({ type: 'LATE_HOURLY', amount: hourlyRate.mul(lateHours), workDate: day.workDate, lateHours });
        }
      }
    }

    const totalDeductions = deductions.reduce((s, d) => s.add(d.amount), new Decimal(0));
    return {
      deductions,
      totalDeductions,
      netSalary: input.gross.sub(totalDeductions),
    };
  }
}
```

### 11.4 Payroll Service Calculate Flow

1. Resolve employee list (all active or `employeeIds`).
2. Load `SalaryStructure` effective for month.
3. Load `AttendanceDerivedDay[]` for month (run job first if empty).
4. `SalaryEngine.build` → upsert `SalarySlip` status `DRAFT` + `SalaryDeduction` rows.
5. Return summary `{ processed, errors }`.

### 11.5 Salary Module Checklist

- [ ] One slip per employee per month (unique constraint)
- [ ] FINALIZED slips immutable
- [ ] Employee sees only FINALIZED/PAID via `GET /me`
- [ ] HR `canRunPayroll` permission check

---

## 12. Notification Module Setup

**Path:** `src/modules/notifications/`  
**Channels:** WhatsApp, Email, Mobile App, Web Portal (per requirements)

### 12.1 Routes

```typescript
router.get('/preferences/me', authenticate, authorize('EMPLOYEE'), notificationsController.getPreferences);
router.patch('/preferences/me', authenticate, authorize('EMPLOYEE'), validate({ body: updatePreferencesSchema }), notificationsController.updatePreferences);
router.get('/history/me', authenticate, authorize('EMPLOYEE'), notificationsController.getHistory);
```

### 12.2 Preferences Schema

```typescript
export const updatePreferencesSchema = z.object({
  whatsappEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  mobileAppEnabled: z.boolean().optional(),
  webPortalEnabled: z.boolean().optional(),
}).refine(
  (d) => Object.values(d).some((v) => v === true),
  { message: 'At least one channel must be enabled' },
);
```

### 12.3 Notification Service

```typescript
export class NotificationService {
  constructor(
    private repo: NotificationsRepository,
    private email: EmailProvider,
    private whatsapp: WhatsAppProvider,
    private push: PushProvider,
  ) {}

  async notifyEmployee(eventCode: string, employeeId: string, payload: { subject?: string; body: string }) {
    const prefs = await this.repo.getPreferences(employeeId);
    const user = await this.repo.getEmployeeContact(employeeId);

    const tasks: Promise<void>[] = [];
    if (prefs.emailEnabled && user.email) {
      tasks.push(this.dispatch('EMAIL', employeeId, user.email, eventCode, payload));
    }
    if (prefs.whatsappEnabled && user.mobile) {
      tasks.push(this.dispatch('WHATSAPP', employeeId, user.mobile, eventCode, payload));
    }
    if (prefs.mobileAppEnabled) {
      tasks.push(this.dispatch('MOBILE_APP', employeeId, user.userId, eventCode, payload));
    }
    // WEB_PORTAL: write in-app notification log only
    if (prefs.webPortalEnabled) {
      tasks.push(this.dispatch('WEB_PORTAL', employeeId, user.userId, eventCode, payload));
    }
    await Promise.allSettled(tasks);
  }

  private async dispatch(channel: NotificationChannel, employeeId: string, to: string, eventCode: string, payload: { subject?: string; body: string }) {
    const log = await this.repo.createLog({ employeeId, channel, eventCode, recipientAddress: to, deliveryStatus: 'QUEUED' });
    try {
      // switch channel → provider
      await this.repo.markSent(log.id);
    } catch (err) {
      await this.repo.markFailed(log.id, String(err));
    }
  }
}
```

### 12.4 Event Codes (standardize)

| eventCode | Trigger |
|-----------|---------|
| `LEAVE_APPROVED` | Leave approved |
| `LEAVE_REJECTED` | Leave rejected |
| `WEEKLY_OFF_APPROVED` | Weekly off approved |
| `PAYSLIP_FINALIZED` | Salary slip finalized |
| `COMP_OFF_CREDITED` | Weekly off work credit |
| `ATTENDANCE_PUNCH_SUCCESS` | Optional punch confirmation |

### 12.5 Integration Points

Call `notificationService.notifyEmployee` from:

- `LeaveApprovalEngine.approve/reject`
- `PayrollService.finalize`
- `AttendanceService.markWeeklyOffWork`
- `CompOffService.credit`

### 12.6 Notification Module Checklist

- [ ] Preferences created on employee onboarding
- [ ] All sends logged in `NotificationLog`
- [ ] Dev mode: log to console instead of real providers
- [ ] Failed sends recorded with `errorMessage`

---

## 13. Docker Compose (Local Dev)

Create **`docker-compose.yml`** at repository root:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: cr-postgres
    environment:
      POSTGRES_USER: cr_user
      POSTGRES_PASSWORD: cr_pass
      POSTGRES_DB: control_room_attendance
    ports:
      - "5432:5432"
    volumes:
      - cr_pg_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: cr-redis
    ports:
      - "6379:6379"

volumes:
  cr_pg_data:
```

```bash
docker compose up -d
cd apps/api && cp .env.example .env && npm run prisma:migrate && npm run prisma:seed && npm run dev
```

---

## 14. Verification Checklist

### 14.1 Infrastructure

- [ ] Node.js 22+ (`node -v`)
- [ ] PostgreSQL reachable
- [ ] Redis reachable
- [ ] `GET /health` returns 200

### 14.2 Auth

- [ ] `POST /auth/login/password` (HR seed user)
- [ ] `POST /auth/login/otp/request` + verify (dev OTP in console)
- [ ] `POST /auth/refresh`
- [ ] Protected route returns 401 without token

### 14.3 Modules

- [ ] HR creates employee
- [ ] Employee punch-in with selfie + GPS (mock face passes)
- [ ] Employee submits leave → HR approves
- [ ] HR runs payroll calculate → finalize
- [ ] Notification logs created

### 14.4 Production Readiness (before deploy)

- [ ] `STORAGE_DRIVER=s3`, `FACE_PROVIDER=rekognition`
- [ ] Strong JWT secrets in vault
- [ ] `prisma migrate deploy` in CI/CD
- [ ] Rate limits enabled
- [ ] CORS restricted to production domains

---

## Appendix — `core/container.ts` Skeleton

```typescript
import { prisma } from './prisma/client';
import { AuthRepository } from '../modules/auth/auth.repository';
import { AuthService } from '../modules/auth/auth.service';
import { AuthController } from '../modules/auth/auth.controller';
import { JwtService } from '../modules/auth/jwt.service';
import { OtpService } from '../modules/auth/otp.service';
// ... import other modules

const authRepo = new AuthRepository(prisma);
const jwtService = new JwtService();
const otpService = new OtpService();
export const authService = new AuthService(authRepo, jwtService, otpService);
export const authController = new AuthController(authService);

// Repeat for employees, attendance, leave, payroll, notifications
```

---

*Follow this plan sequentially: Sections 1–6 (foundation) → 7 (auth) → 8–12 (domain modules). Domain logic details: [backend-blueprint.md](./backend-blueprint.md).*
