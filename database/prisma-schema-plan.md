# Control Room Attendance Portal — Prisma ORM Schema Plan

**Database:** PostgreSQL 15+  
**ORM:** Prisma 5.x / 6.x  
**Document version:** 1.0  
**Sources:** [project-requirements.md](../docs/project-requirements.md), [system-architecture.md](../docs/system-architecture.md), [database-design.md](./database-design.md)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Prisma Schema Design](#2-prisma-schema-design)
3. [Model Relationships](#3-model-relationships)
4. [Migration Strategy](#4-migration-strategy)
5. [Seed Data Strategy](#5-seed-data-strategy)
6. [Implementation Checklist](#6-implementation-checklist)

---

## 1. Overview

### 1.1 Goals

| Goal | Approach |
|------|----------|
| Align with SQL design | Table names via `@@map`; columns via `@map` where snake_case |
| Required domain models | 21 named models + supporting reference/approval models |
| Audit fields | `createdAt` / `updatedAt` on mutable entities |
| Soft delete | `deletedAt` on `UserAuth`, `Employee`, `HRAdmin` |
| Type safety | Native Prisma `enum` for all PostgreSQL enums |
| Production indexes | `@@index`, `@@unique`; partial uniques via raw migration SQL |

### 1.2 File Layout

```
control-room-attendance-portal/
├── prisma/
│   ├── schema.prisma          # Generated from Section 2
│   ├── migrations/            # prisma migrate
│   └── seed.ts                # Seed orchestrator
├── database/
│   ├── database-design.md
│   └── prisma-schema-plan.md  # This document
└── package.json               # prisma, @prisma/client
```

### 1.3 Generator & Datasource

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 1.4 Naming Conventions

| SQL (database-design) | Prisma model | Notes |
|----------------------|--------------|-------|
| `users` | `UserAuth` | Auth identity; `@@map("users")` |
| `employees` | `Employee` | |
| `hr_admins` | `HRAdmin` | |
| `shift_definitions` | `Shift` | |
| `employee_shift_assignments` | `ShiftAssignment` | |
| `weekly_off_preferences` | `WeeklyOff` | |
| `attendance_records` | `Attendance` | |
| `gps_location_logs` | `GPSLog` | |
| `face_verification_records` | `FaceVerification` | |

---

## 2. Prisma Schema Design

Copy the following into `prisma/schema.prisma`. Supporting models (`Company`, `ControlRoomSite`, `FaceEnrollment`, etc.) are required for relations defined in [database-design.md](./database-design.md).

```prisma
// prisma/schema.prisma
// Control Room Attendance Portal — AVSOFT CORPORATION

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

enum UserRole {
  HR_ADMIN
  EMPLOYEE

  @@map("user_role")
}

enum AccountStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  PENDING_ACTIVATION

  @@map("account_status")
}

enum PunchType {
  IN
  OUT

  @@map("punch_type")
}

enum AttendanceRecordStatus {
  VALID
  REJECTED_GEOFENCE
  REJECTED_FACE
  REJECTED_POLICY
  SUPERSEDED

  @@map("attendance_record_status")
}

enum DerivedDayStatus {
  PRESENT
  ABSENT
  LATE
  HALF_DAY
  ON_LEAVE
  WEEKLY_OFF
  HOLIDAY

  @@map("derived_day_status")
}

enum DayOfWeek {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY

  @@map("day_of_week")
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED

  @@map("approval_status")
}

enum LeaveRequestStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED

  @@map("leave_request_status")
}

enum HalfDayPeriod {
  FIRST_HALF
  SECOND_HALF

  @@map("half_day_period")
}

enum CompOffEntryType {
  CREDIT_WEEKLY_OFF_WORK
  DEBIT_LEAVE
  ADJUSTMENT

  @@map("comp_off_entry_type")
}

enum SalarySlipStatus {
  DRAFT
  FINALIZED
  PAID

  @@map("salary_slip_status")
}

enum DeductionType {
  ABSENT
  LATE_HOURLY
  LATE_HALF_DAY
  OTHER

  @@map("deduction_type")
}

enum DocumentType {
  AADHAAR
  PAN
  BANK_PASSBOOK
  EDUCATION_CERT
  OFFER_LETTER
  APPOINTMENT_LETTER
  EXPERIENCE_LETTER

  @@map("document_type")
}

enum DocumentVerificationStatus {
  PENDING
  VERIFIED
  REJECTED

  @@map("document_verification_status")
}

enum NotificationChannel {
  WHATSAPP
  EMAIL
  MOBILE_APP
  WEB_PORTAL

  @@map("notification_channel")
}

enum NotificationDeliveryStatus {
  QUEUED
  SENT
  FAILED
  SKIPPED

  @@map("notification_delivery_status")
}

enum FaceEnrollmentStatus {
  ACTIVE
  EXPIRED
  REVOKED

  @@map("face_enrollment_status")
}

enum AuditAction {
  INSERT
  UPDATE
  DELETE
  APPROVE
  REJECT
  LOGIN
  LOGOUT
  EXPORT
  CALCULATE

  @@map("audit_action")
}

// ─────────────────────────────────────────────────────────────────────────────
// ORGANIZATION
// ─────────────────────────────────────────────────────────────────────────────

model Company {
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name         String   @db.VarChar(255)
  timezone     String   @default("Asia/Kolkata") @db.VarChar(64)
  settingsJson Json     @default("{}") @map("settings_json")
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt    DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)

  users            UserAuth[]
  employees        Employee[]
  hrAdmins         HRAdmin[]
  controlRoomSites ControlRoomSite[]
  shifts           Shift[]
  leaveTypes       LeaveType[]
  attendances      Attendance[]
  auditLogs        AuditLog[]

  @@map("companies")
}

model ControlRoomSite {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyId     String   @map("company_id") @db.Uuid
  name          String   @db.VarChar(255)
  latitude      Decimal  @db.Decimal(10, 7)
  longitude     Decimal  @db.Decimal(10, 7)
  radiusMeters  Int      @default(50) @map("radius_meters") @db.SmallInt
  isActive      Boolean  @default(true) @map("is_active")
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt     DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)

  company    Company      @relation(fields: [companyId], references: [id], onDelete: Restrict)
  attendances Attendance[]
  gpsLogs    GPSLog[]

  @@index([companyId, isActive])
  @@map("control_room_sites")
}

// ─────────────────────────────────────────────────────────────────────────────
// IDENTITY (UserAuth = users table)
// ─────────────────────────────────────────────────────────────────────────────

model UserAuth {
  id               String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyId        String        @map("company_id") @db.Uuid
  email            String?       @db.VarChar(255)
  mobile           String?       @db.VarChar(20)
  passwordHash     String?       @map("password_hash") @db.VarChar(255)
  role             UserRole
  status           AccountStatus @default(ACTIVE)
  emailVerifiedAt  DateTime?     @map("email_verified_at") @db.Timestamptz(6)
  mobileVerifiedAt DateTime?     @map("mobile_verified_at") @db.Timestamptz(6)
  lastLoginAt      DateTime?     @map("last_login_at") @db.Timestamptz(6)
  createdAt        DateTime      @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt        DateTime      @updatedAt @map("updated_at") @db.Timestamptz(6)
  deletedAt        DateTime?     @map("deleted_at") @db.Timestamptz(6)

  company          Company           @relation(fields: [companyId], references: [id], onDelete: Restrict)
  employee         Employee?
  hrAdmin          HRAdmin?
  notificationLogs NotificationLog[]
  auditLogs        AuditLog[]        @relation("AuditActorUser")

  @@index([companyId, role, status])
  @@index([companyId, email])
  @@index([companyId, mobile])
  @@map("users")
}

model HRAdmin {
  id                 String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId             String        @unique @map("user_id") @db.Uuid
  companyId          String        @map("company_id") @db.Uuid
  employeeCode       String?       @map("employee_code") @db.VarChar(32)
  fullName           String        @map("full_name") @db.VarChar(255)
  designation        String?       @db.VarChar(128)
  department         String?       @db.VarChar(128)
  canApproveLeave    Boolean       @default(true) @map("can_approve_leave")
  canRunPayroll      Boolean       @default(true) @map("can_run_payroll")
  canManageEmployees Boolean       @default(true) @map("can_manage_employees")
  createdAt          DateTime      @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt          DateTime      @updatedAt @map("updated_at") @db.Timestamptz(6)
  deletedAt          DateTime?     @map("deleted_at") @db.Timestamptz(6)

  user                    UserAuth              @relation(fields: [userId], references: [id], onDelete: Restrict)
  company                 Company               @relation(fields: [companyId], references: [id], onDelete: Restrict)
  verifiedDocuments       EmployeeDocument[]
  enrolledFaces           FaceEnrollment[]
  shiftAssignments        ShiftAssignment[]
  weeklyOffApprovals      WeeklyOffApproval[]
  weeklyOffWorkLogs       WeeklyOffWorkLog[]
  leaveApprovals          LeaveApproval[]
  compOffLedgerEntries    CompOffLedger[]
  salaryStructuresCreated SalaryStructure[]
  salarySlipsFinalized    SalarySlip[]
  auditLogs               AuditLog[]            @relation("AuditActorHRAdmin")

  @@index([companyId])
  @@map("hr_admins")
}

model Employee {
  id           String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId       String        @unique @map("user_id") @db.Uuid
  companyId    String        @map("company_id") @db.Uuid
  employeeCode String        @map("employee_code") @db.VarChar(32)
  fullName     String        @map("full_name") @db.VarChar(255)
  department   String?       @db.VarChar(128)
  designation  String?       @db.VarChar(128)
  joinDate     DateTime      @map("join_date") @db.Date
  exitDate     DateTime?     @map("exit_date") @db.Date
  status       AccountStatus @default(ACTIVE)
  createdAt    DateTime      @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt    DateTime      @updatedAt @map("updated_at") @db.Timestamptz(6)
  deletedAt    DateTime?     @map("deleted_at") @db.Timestamptz(6)

  user                   UserAuth                @relation(fields: [userId], references: [id], onDelete: Restrict)
  company                Company                 @relation(fields: [companyId], references: [id], onDelete: Restrict)
  profile                EmployeeProfile?
  documents              EmployeeDocument[]
  faceEnrollments        FaceEnrollment[]
  shiftAssignments       ShiftAssignment[]
  weeklyOffs             WeeklyOff[]
  weeklyOffWorkLogs      WeeklyOffWorkLog[]
  attendances            Attendance[]
  derivedDays            AttendanceDerivedDay[]
  leaveBalances          LeaveBalance[]
  leaveRequests          LeaveRequest[]
  compOffLedger          CompOffLedger[]
  compOffBalance         CompOffBalance?
  salaryStructures       SalaryStructure[]
  salarySlips            SalarySlip[]
  notificationPreference NotificationPreference?
  notificationLogs       NotificationLog[]

  @@unique([companyId, employeeCode])
  @@index([companyId, status])
  @@map("employees")
}

model EmployeeProfile {
  id                       String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  employeeId               String    @unique @map("employee_id") @db.Uuid
  dateOfBirth              DateTime? @map("date_of_birth") @db.Date
  gender                   String?   @db.VarChar(32)
  bloodGroup               String?   @map("blood_group") @db.VarChar(8)
  personalEmail            String?   @map("personal_email") @db.VarChar(255)
  emergencyContactName     String?   @map("emergency_contact_name") @db.VarChar(255)
  emergencyContactMobile   String?   @map("emergency_contact_mobile") @db.VarChar(20)
  currentAddress           String?   @map("current_address") @db.Text
  permanentAddress         String?   @map("permanent_address") @db.Text
  aadhaarMasked            String?   @map("aadhaar_masked") @db.VarChar(20)
  panMasked                String?   @map("pan_masked") @db.VarChar(16)
  bankAccountHolder        String?   @map("bank_account_holder") @db.VarChar(255)
  bankAccountNumberMasked  String?   @map("bank_account_number_masked") @db.VarChar(32)
  bankIfsc                 String?   @map("bank_ifsc") @db.VarChar(11)
  bankName                 String?   @map("bank_name") @db.VarChar(255)
  profilePhotoUrl          String?   @map("profile_photo_url") @db.Text
  metadataJson             Json      @default("{}") @map("metadata_json")
  createdAt                DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt                DateTime  @updatedAt @map("updated_at") @db.Timestamptz(6)

  employee Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  @@map("employee_profiles")
}

model EmployeeDocument {
  id                   String                     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  employeeId           String                     @map("employee_id") @db.Uuid
  documentType         DocumentType               @map("document_type")
  fileName             String                     @map("file_name") @db.VarChar(512)
  fileUrl              String                     @map("file_url") @db.Text
  fileSizeBytes        BigInt?                    @map("file_size_bytes")
  mimeType             String?                    @map("mime_type") @db.VarChar(128)
  verificationStatus   DocumentVerificationStatus @default(PENDING) @map("verification_status")
  verifiedByHrAdminId  String?                    @map("verified_by_hr_admin_id") @db.Uuid
  verifiedAt           DateTime?                  @map("verified_at") @db.Timestamptz(6)
  rejectionReason      String?                    @map("rejection_reason") @db.Text
  uploadedAt           DateTime                   @default(now()) @map("uploaded_at") @db.Timestamptz(6)
  createdAt            DateTime                   @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt            DateTime                   @updatedAt @map("updated_at") @db.Timestamptz(6)

  employee         Employee @relation(fields: [employeeId], references: [id], onDelete: Restrict)
  verifiedByHrAdmin HRAdmin? @relation(fields: [verifiedByHrAdminId], references: [id], onDelete: SetNull)

  @@index([employeeId, documentType])
  @@map("employee_documents")
}

model FaceEnrollment {
  id                  String               @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  employeeId          String               @map("employee_id") @db.Uuid
  referenceImageUrl   String               @map("reference_image_url") @db.Text
  externalFaceId      String?              @map("external_face_id") @db.VarChar(255)
  status              FaceEnrollmentStatus @default(ACTIVE)
  enrolledByHrAdminId String?              @map("enrolled_by_hr_admin_id") @db.Uuid
  enrolledAt          DateTime             @default(now()) @map("enrolled_at") @db.Timestamptz(6)
  revokedAt           DateTime?            @map("revoked_at") @db.Timestamptz(6)
  createdAt           DateTime             @default(now()) @map("created_at") @db.Timestamptz(6)

  employee          Employee           @relation(fields: [employeeId], references: [id], onDelete: Restrict)
  enrolledByHrAdmin HRAdmin?           @relation(fields: [enrolledByHrAdminId], references: [id], onDelete: SetNull)
  faceVerifications FaceVerification[]

  @@index([employeeId, status])
  @@map("face_enrollments")
}

// ─────────────────────────────────────────────────────────────────────────────
// SHIFTS & WEEKLY OFF
// ─────────────────────────────────────────────────────────────────────────────

model Shift {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyId       String   @map("company_id") @db.Uuid
  code            String   @db.VarChar(32)
  name            String   @db.VarChar(128)
  startTime       DateTime @map("start_time") @db.Time(0)
  endTime         DateTime @map("end_time") @db.Time(0)
  crossesMidnight Boolean  @default(false) @map("crosses_midnight")
  isActive        Boolean  @default(true) @map("is_active")
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt       DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)

  company     Company           @relation(fields: [companyId], references: [id], onDelete: Restrict)
  assignments ShiftAssignment[]

  @@unique([companyId, code])
  @@map("shift_definitions")
}

model ShiftAssignment {
  id                  String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  employeeId          String    @map("employee_id") @db.Uuid
  shiftId             String    @map("shift_id") @db.Uuid
  effectiveFrom       DateTime  @map("effective_from") @db.Date
  effectiveTo         DateTime? @map("effective_to") @db.Date
  assignedByHrAdminId String?   @map("assigned_by_hr_admin_id") @db.Uuid
  createdAt           DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt           DateTime  @updatedAt @map("updated_at") @db.Timestamptz(6)

  employee          Employee     @relation(fields: [employeeId], references: [id], onDelete: Restrict)
  shift             Shift        @relation(fields: [shiftId], references: [id], onDelete: Restrict)
  assignedByHrAdmin HRAdmin?     @relation(fields: [assignedByHrAdminId], references: [id], onDelete: SetNull)
  attendances       Attendance[]

  @@index([employeeId, effectiveFrom])
  @@index([employeeId, effectiveTo])
  @@map("employee_shift_assignments")
}

model WeeklyOff {
  id          String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  employeeId  String         @map("employee_id") @db.Uuid
  dayOfWeek   DayOfWeek      @map("day_of_week")
  status      ApprovalStatus @default(PENDING)
  requestedAt DateTime       @default(now()) @map("requested_at") @db.Timestamptz(6)
  createdAt   DateTime       @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt   DateTime       @updatedAt @map("updated_at") @db.Timestamptz(6)

  employee Employee           @relation(fields: [employeeId], references: [id], onDelete: Restrict)
  approval WeeklyOffApproval?

  @@index([employeeId, status])
  @@index([status])
  @@map("weekly_off_preferences")
}

model WeeklyOffApproval {
  id           String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  preferenceId String         @unique @map("preference_id") @db.Uuid
  hrAdminId    String         @map("hr_admin_id") @db.Uuid
  status       ApprovalStatus
  remarks      String?        @db.Text
  decidedAt    DateTime       @map("decided_at") @db.Timestamptz(6)
  createdAt    DateTime       @default(now()) @map("created_at") @db.Timestamptz(6)

  preference WeeklyOff @relation(fields: [preferenceId], references: [id], onDelete: Restrict)
  hrAdmin    HRAdmin   @relation(fields: [hrAdminId], references: [id], onDelete: Restrict)

  @@map("weekly_off_approvals")
}

model WeeklyOffWorkLog {
  id                    String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  employeeId            String   @map("employee_id") @db.Uuid
  workDate              DateTime @map("work_date") @db.Date
  markedByHrAdminId     String   @map("marked_by_hr_admin_id") @db.Uuid
  compOffLedgerEntryId  String?  @unique @map("comp_off_ledger_entry_id") @db.Uuid
  remarks               String?  @db.Text
  createdAt             DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  employee           Employee       @relation(fields: [employeeId], references: [id], onDelete: Restrict)
  markedByHrAdmin    HRAdmin        @relation(fields: [markedByHrAdminId], references: [id], onDelete: Restrict)
  compOffLedgerEntry CompOffLedger? @relation(fields: [compOffLedgerEntryId], references: [id], onDelete: SetNull)

  @@unique([employeeId, workDate])
  @@map("weekly_off_work_logs")
}

// ─────────────────────────────────────────────────────────────────────────────
// ATTENDANCE
// ─────────────────────────────────────────────────────────────────────────────

model Attendance {
  id                 String                 @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  employeeId         String                 @map("employee_id") @db.Uuid
  companyId          String                 @map("company_id") @db.Uuid
  shiftAssignmentId  String?                @map("shift_assignment_id") @db.Uuid
  controlRoomSiteId  String?                @map("control_room_site_id") @db.Uuid
  punchType          PunchType              @map("punch_type")
  punchedAt          DateTime               @map("punched_at") @db.Timestamptz(6)
  shiftDate          DateTime               @map("shift_date") @db.Date
  clientRequestId    String                 @map("client_request_id") @db.VarChar(64)
  status             AttendanceRecordStatus @default(VALID)
  lateMinutes        Int?                   @map("late_minutes")
  derivedDayStatus   DerivedDayStatus?      @map("derived_day_status")
  createdAt          DateTime               @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt          DateTime               @updatedAt @map("updated_at") @db.Timestamptz(6)

  employee        Employee         @relation(fields: [employeeId], references: [id], onDelete: Restrict)
  company         Company          @relation(fields: [companyId], references: [id], onDelete: Restrict)
  shiftAssignment ShiftAssignment? @relation(fields: [shiftAssignmentId], references: [id], onDelete: SetNull)
  controlRoomSite ControlRoomSite? @relation(fields: [controlRoomSiteId], references: [id], onDelete: SetNull)
  selfie          AttendanceSelfie?
  faceVerification FaceVerification?
  gpsLog          GPSLog?

  @@unique([employeeId, clientRequestId])
  @@index([employeeId, shiftDate(sort: Desc)])
  @@index([companyId, punchedAt(sort: Desc)])
  @@index([employeeId, punchType, shiftDate])
  @@map("attendance_records")
}

model AttendanceSelfie {
  id                 String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  attendanceRecordId String   @unique @map("attendance_record_id") @db.Uuid
  storageBucket      String   @map("storage_bucket") @db.VarChar(128)
  storageKey         String   @map("storage_key") @db.Text
  fileUrl            String   @map("file_url") @db.Text
  capturedAt         DateTime @map("captured_at") @db.Timestamptz(6)
  deviceInfoJson     Json?    @map("device_info_json")
  createdAt          DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt          DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)

  attendance Attendance @relation(fields: [attendanceRecordId], references: [id], onDelete: Cascade)

  @@map("attendance_selfies")
}

model FaceVerification {
  id                    String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  attendanceRecordId    String   @unique @map("attendance_record_id") @db.Uuid
  faceEnrollmentId      String   @map("face_enrollment_id") @db.Uuid
  matchScore            Decimal  @map("match_score") @db.Decimal(5, 2)
  thresholdUsed         Decimal  @default(80.00) @map("threshold_used") @db.Decimal(5, 2)
  passed                Boolean
  providerName          String?  @map("provider_name") @db.VarChar(64)
  providerRequestId     String?  @map("provider_request_id") @db.VarChar(255)
  providerResponseJson  Json?    @map("provider_response_json")
  verifiedAt            DateTime @map("verified_at") @db.Timestamptz(6)
  createdAt             DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  attendance     Attendance     @relation(fields: [attendanceRecordId], references: [id], onDelete: Cascade)
  faceEnrollment FaceEnrollment @relation(fields: [faceEnrollmentId], references: [id], onDelete: Restrict)

  @@index([passed, verifiedAt])
  @@map("face_verification_records")
}

model GPSLog {
  id                      String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  attendanceRecordId      String   @unique @map("attendance_record_id") @db.Uuid
  controlRoomSiteId       String   @map("control_room_site_id") @db.Uuid
  latitude                Decimal  @db.Decimal(10, 7)
  longitude               Decimal  @db.Decimal(10, 7)
  accuracyMeters          Decimal? @map("accuracy_meters") @db.Decimal(8, 2)
  distanceFromSiteMeters  Decimal  @map("distance_from_site_meters") @db.Decimal(10, 2)
  allowedRadiusMeters     Int      @map("allowed_radius_meters") @db.SmallInt
  withinGeofence          Boolean  @map("within_geofence")
  altitudeMeters          Decimal? @map("altitude_meters") @db.Decimal(8, 2)
  recordedAt              DateTime @map("recorded_at") @db.Timestamptz(6)
  createdAt               DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  attendance      Attendance      @relation(fields: [attendanceRecordId], references: [id], onDelete: Cascade)
  controlRoomSite ControlRoomSite @relation(fields: [controlRoomSiteId], references: [id], onDelete: Restrict)

  @@index([withinGeofence, recordedAt])
  @@map("gps_location_logs")
}

model AttendanceDerivedDay {
  id              String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  employeeId      String           @map("employee_id") @db.Uuid
  workDate        DateTime         @map("work_date") @db.Date
  status          DerivedDayStatus
  lateMinutes     Int?             @map("late_minutes")
  firstPunchInAt  DateTime?        @map("first_punch_in_at") @db.Timestamptz(6)
  lastPunchOutAt  DateTime?        @map("last_punch_out_at") @db.Timestamptz(6)
  computedAt      DateTime         @map("computed_at") @db.Timestamptz(6)
  createdAt       DateTime         @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt       DateTime         @updatedAt @map("updated_at") @db.Timestamptz(6)

  employee          Employee           @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  salaryDeductions  SalaryDeduction[]

  @@unique([employeeId, workDate])
  @@index([employeeId, workDate])
  @@map("attendance_derived_days")
}

// ─────────────────────────────────────────────────────────────────────────────
// LEAVE & COMP OFF
// ─────────────────────────────────────────────────────────────────────────────

model LeaveType {
  id              String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyId       String  @map("company_id") @db.Uuid
  code            String  @db.VarChar(32)
  name            String  @db.VarChar(128)
  requiresBalance Boolean @default(true) @map("requires_balance")
  isActive        Boolean @default(true) @map("is_active")
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt       DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)

  company       Company        @relation(fields: [companyId], references: [id], onDelete: Restrict)
  leaveBalances LeaveBalance[]
  leaveRequests LeaveRequest[]

  @@unique([companyId, code])
  @@map("leave_types")
}

model LeaveBalance {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  employeeId     String   @map("employee_id") @db.Uuid
  leaveTypeId    String   @map("leave_type_id") @db.Uuid
  calendarYear   Int      @map("calendar_year") @db.SmallInt
  allocatedDays  Decimal  @map("allocated_days") @db.Decimal(5, 2)
  usedDays       Decimal  @default(0) @map("used_days") @db.Decimal(5, 2)
  remainingDays  Decimal  @map("remaining_days") @db.Decimal(5, 2)
  createdAt      DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt      DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)

  employee  Employee  @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  leaveType LeaveType @relation(fields: [leaveTypeId], references: [id], onDelete: Restrict)

  @@unique([employeeId, leaveTypeId, calendarYear])
  @@map("leave_balances")
}

model LeaveRequest {
  id            String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  employeeId    String             @map("employee_id") @db.Uuid
  leaveTypeId   String             @map("leave_type_id") @db.Uuid
  startDate     DateTime           @map("start_date") @db.Date
  endDate       DateTime           @map("end_date") @db.Date
  totalDays     Decimal            @map("total_days") @db.Decimal(5, 2)
  isHalfDay     Boolean            @default(false) @map("is_half_day")
  halfDayPeriod HalfDayPeriod?     @map("half_day_period")
  reason        String?            @db.Text
  status        LeaveRequestStatus @default(PENDING)
  submittedAt   DateTime           @default(now()) @map("submitted_at") @db.Timestamptz(6)
  createdAt     DateTime           @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt     DateTime           @updatedAt @map("updated_at") @db.Timestamptz(6)

  employee         Employee         @relation(fields: [employeeId], references: [id], onDelete: Restrict)
  leaveType        LeaveType        @relation(fields: [leaveTypeId], references: [id], onDelete: Restrict)
  approval         LeaveApproval?
  compOffLedger    CompOffLedger[]

  @@index([employeeId, createdAt(sort: Desc)])
  @@index([status, startDate])
  @@map("leave_requests")
}

model LeaveApproval {
  id             String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  leaveRequestId String         @unique @map("leave_request_id") @db.Uuid
  hrAdminId      String         @map("hr_admin_id") @db.Uuid
  status         ApprovalStatus
  remarks        String?        @db.Text
  decidedAt      DateTime       @map("decided_at") @db.Timestamptz(6)
  createdAt      DateTime       @default(now()) @map("created_at") @db.Timestamptz(6)

  leaveRequest LeaveRequest @relation(fields: [leaveRequestId], references: [id], onDelete: Restrict)
  hrAdmin      HRAdmin      @relation(fields: [hrAdminId], references: [id], onDelete: Restrict)

  @@map("leave_approvals")
}

model CompOffLedger {
  id                   String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  employeeId           String           @map("employee_id") @db.Uuid
  entryType            CompOffEntryType @map("entry_type")
  quantity             Int              @db.SmallInt
  balanceAfter         Int              @map("balance_after") @db.SmallInt
  referenceDate        DateTime         @map("reference_date") @db.Date
  leaveRequestId       String?          @map("leave_request_id") @db.Uuid
  weeklyOffWorkLogId   String?          @map("weekly_off_work_log_id") @db.Uuid
  createdByHrAdminId   String?          @map("created_by_hr_admin_id") @db.Uuid
  description          String?          @db.Text
  createdAt            DateTime         @default(now()) @map("created_at") @db.Timestamptz(6)

  employee         Employee          @relation(fields: [employeeId], references: [id], onDelete: Restrict)
  leaveRequest     LeaveRequest?     @relation(fields: [leaveRequestId], references: [id], onDelete: SetNull)
  weeklyOffWorkLog WeeklyOffWorkLog?
  createdByHrAdmin HRAdmin?          @relation(fields: [createdByHrAdminId], references: [id], onDelete: SetNull)

  @@index([employeeId, createdAt(sort: Desc)])
  @@map("comp_off_ledger")
}

model CompOffBalance {
  employeeId String   @id @map("employee_id") @db.Uuid
  balance    Int      @default(0) @db.SmallInt
  updatedAt  DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)

  employee Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  @@map("comp_off_balances")
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYROLL
// ─────────────────────────────────────────────────────────────────────────────

model SalaryStructure {
  id                    String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  employeeId            String    @map("employee_id") @db.Uuid
  fixedMonthlyGross     Decimal   @map("fixed_monthly_gross") @db.Decimal(12, 2)
  currencyCode          String    @default("INR") @map("currency_code") @db.Char(3)
  standardHoursPerDay   Decimal   @default(8) @map("standard_hours_per_day") @db.Decimal(4, 2)
  effectiveFrom         DateTime  @map("effective_from") @db.Date
  effectiveTo           DateTime? @map("effective_to") @db.Date
  createdByHrAdminId    String?   @map("created_by_hr_admin_id") @db.Uuid
  createdAt             DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt             DateTime  @updatedAt @map("updated_at") @db.Timestamptz(6)

  employee          Employee     @relation(fields: [employeeId], references: [id], onDelete: Restrict)
  createdByHrAdmin  HRAdmin?     @relation(fields: [createdByHrAdminId], references: [id], onDelete: SetNull)
  salarySlips       SalarySlip[]

  @@index([employeeId, effectiveFrom])
  @@map("salary_structures")
}

model SalarySlip {
  id                    String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  employeeId            String           @map("employee_id") @db.Uuid
  salaryStructureId     String           @map("salary_structure_id") @db.Uuid
  payPeriodYear         Int              @map("pay_period_year") @db.SmallInt
  payPeriodMonth        Int              @map("pay_period_month") @db.SmallInt
  grossSalary           Decimal          @map("gross_salary") @db.Decimal(12, 2)
  workingDaysInMonth    Int              @map("working_days_in_month") @db.SmallInt
  presentDays           Decimal          @map("present_days") @db.Decimal(5, 2)
  absentDays            Decimal          @map("absent_days") @db.Decimal(5, 2)
  totalDeductions       Decimal          @map("total_deductions") @db.Decimal(12, 2)
  netSalary             Decimal          @map("net_salary") @db.Decimal(12, 2)
  status                SalarySlipStatus @default(DRAFT)
  calculatedAt          DateTime         @map("calculated_at") @db.Timestamptz(6)
  finalizedAt           DateTime?        @map("finalized_at") @db.Timestamptz(6)
  finalizedByHrAdminId  String?          @map("finalized_by_hr_admin_id") @db.Uuid
  paidAt                DateTime?        @map("paid_at") @db.Timestamptz(6)
  payslipPdfUrl         String?          @map("payslip_pdf_url") @db.Text
  createdAt             DateTime         @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt             DateTime         @updatedAt @map("updated_at") @db.Timestamptz(6)

  employee           Employee          @relation(fields: [employeeId], references: [id], onDelete: Restrict)
  salaryStructure    SalaryStructure   @relation(fields: [salaryStructureId], references: [id], onDelete: Restrict)
  finalizedByHrAdmin HRAdmin?          @relation(fields: [finalizedByHrAdminId], references: [id], onDelete: SetNull)
  deductions         SalaryDeduction[]

  @@unique([employeeId, payPeriodYear, payPeriodMonth])
  @@index([payPeriodYear, payPeriodMonth, status])
  @@map("salary_slips")
}

model SalaryDeduction {
  id                      String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  salarySlipId            String         @map("salary_slip_id") @db.Uuid
  deductionType           DeductionType  @map("deduction_type")
  workDate                DateTime?      @map("work_date") @db.Date
  attendanceDerivedDayId  String?        @map("attendance_derived_day_id") @db.Uuid
  description             String         @db.VarChar(512)
  lateHours               Decimal?       @map("late_hours") @db.Decimal(5, 2)
  amount                  Decimal        @db.Decimal(12, 2)
  createdAt               DateTime       @default(now()) @map("created_at") @db.Timestamptz(6)

  salarySlip           SalarySlip            @relation(fields: [salarySlipId], references: [id], onDelete: Cascade)
  attendanceDerivedDay AttendanceDerivedDay? @relation(fields: [attendanceDerivedDayId], references: [id], onDelete: SetNull)

  @@index([salarySlipId])
  @@map("salary_deductions")
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS & AUDIT
// ─────────────────────────────────────────────────────────────────────────────

model NotificationPreference {
  employeeId         String   @id @map("employee_id") @db.Uuid
  whatsappEnabled    Boolean  @default(false) @map("whatsapp_enabled")
  emailEnabled       Boolean  @default(true) @map("email_enabled")
  mobileAppEnabled   Boolean  @default(true) @map("mobile_app_enabled")
  webPortalEnabled   Boolean  @default(true) @map("web_portal_enabled")
  createdAt          DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt          DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)

  employee Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  @@map("notification_preferences")
}

model NotificationLog {
  id                String                     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  employeeId        String?                    @map("employee_id") @db.Uuid
  userId            String?                    @map("user_id") @db.Uuid
  channel           NotificationChannel
  eventCode         String                     @map("event_code") @db.VarChar(64)
  subject           String?                    @db.VarChar(512)
  bodyPreview       String?                    @map("body_preview") @db.Text
  recipientAddress  String?                    @map("recipient_address") @db.VarChar(255)
  deliveryStatus    NotificationDeliveryStatus @map("delivery_status")
  providerMessageId String?                    @map("provider_message_id") @db.VarChar(255)
  errorMessage      String?                    @map("error_message") @db.Text
  queuedAt          DateTime                   @map("queued_at") @db.Timestamptz(6)
  sentAt            DateTime?                  @map("sent_at") @db.Timestamptz(6)
  createdAt         DateTime                   @default(now()) @map("created_at") @db.Timestamptz(6)

  employee Employee? @relation(fields: [employeeId], references: [id], onDelete: SetNull)
  user     UserAuth? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([employeeId, createdAt(sort: Desc)])
  @@index([deliveryStatus, queuedAt])
  @@map("notification_logs")
}

model AuditLog {
  id              String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyId       String      @map("company_id") @db.Uuid
  actorUserId     String?     @map("actor_user_id") @db.Uuid
  actorHrAdminId  String?     @map("actor_hr_admin_id") @db.Uuid
  action          AuditAction
  entitySchema    String      @map("entity_schema") @db.VarChar(64)
  entityId        String      @map("entity_id") @db.Uuid
  oldValuesJson   Json?       @map("old_values_json")
  newValuesJson   Json?       @map("new_values_json")
  ipAddress       String?     @map("ip_address") @db.Inet
  userAgent       String?     @map("user_agent") @db.Text
  requestId       String?     @map("request_id") @db.VarChar(64)
  createdAt       DateTime    @default(now()) @map("created_at") @db.Timestamptz(6)

  company      Company  @relation(fields: [companyId], references: [id], onDelete: Restrict)
  actorUser    UserAuth? @relation("AuditActorUser", fields: [actorUserId], references: [id], onDelete: SetNull)
  actorHrAdmin HRAdmin?  @relation("AuditActorHRAdmin", fields: [actorHrAdminId], references: [id], onDelete: SetNull)

  @@index([entitySchema, entityId, createdAt(sort: Desc)])
  @@index([companyId, createdAt(sort: Desc)])
  @@index([actorUserId, createdAt(sort: Desc)])
  @@map("audit_logs")
}
```

### 2.1 Audit & Soft-Delete Summary

| Model | `createdAt` | `updatedAt` | `deletedAt` | Notes |
|-------|:-----------:|:-----------:|:-----------:|-------|
| UserAuth | ✓ | ✓ | ✓ | Soft delete |
| HRAdmin | ✓ | ✓ | ✓ | Soft delete |
| Employee | ✓ | ✓ | ✓ | Soft delete |
| EmployeeProfile | ✓ | ✓ | — | |
| EmployeeDocument | ✓ | ✓ | — | |
| Attendance | ✓ | ✓ | — | |
| AttendanceSelfie | ✓ | ✓ | — | |
| FaceVerification | ✓ | — | — | Immutable verification snapshot |
| GPSLog | ✓ | — | — | Immutable GPS snapshot |
| Shift | ✓ | ✓ | — | |
| ShiftAssignment | ✓ | ✓ | — | |
| WeeklyOff | ✓ | ✓ | — | |
| CompOffLedger | ✓ | — | — | Append-only |
| LeaveRequest | ✓ | ✓ | — | |
| LeaveBalance | ✓ | ✓ | — | |
| SalaryStructure | ✓ | ✓ | — | |
| SalarySlip | ✓ | ✓ | — | |
| SalaryDeduction | ✓ | — | — | Append-only line |
| NotificationPreference | ✓ | ✓ | — | |
| NotificationLog | ✓ | — | — | Append-only |
| AuditLog | ✓ | — | — | Append-only |

### 2.2 Prisma Client Middleware (Soft Delete)

```typescript
// src/prisma/soft-delete.middleware.ts
const SOFT_DELETE_MODELS = ['UserAuth', 'Employee', 'HRAdmin'] as const;

export function softDeleteMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    if (SOFT_DELETE_MODELS.includes(params.model as typeof SOFT_DELETE_MODELS[number])) {
      if (params.action === 'findMany' || params.action === 'findFirst') {
        params.args.where = { ...params.args.where, deletedAt: null };
      }
      if (params.action === 'delete') {
        params.action = 'update';
        params.args.data = { deletedAt: new Date() };
      }
      if (params.action === 'deleteMany') {
        params.action = 'updateMany';
        params.args.data = { deletedAt: new Date() };
      }
    }
    return next(params);
  };
}
```

### 2.3 Partial Unique Indexes (Raw SQL Migration)

Prisma cannot express `WHERE deleted_at IS NULL` uniques natively. Add after `prisma migrate dev`:

```sql
-- migration: partial_unique_active_users.sql
CREATE UNIQUE INDEX uq_users_company_email_active
  ON users (company_id, email)
  WHERE email IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX uq_users_company_mobile_active
  ON users (company_id, mobile)
  WHERE mobile IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX uq_employees_company_code_active
  ON employees (company_id, employee_code)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uq_face_enrollment_active
  ON face_enrollments (employee_id)
  WHERE status = 'ACTIVE';
```

---

## 3. Model Relationships

### 3.1 Relationship Diagram

```mermaid
flowchart TB
    subgraph Identity
        Company --> UserAuth
        UserAuth -->|1:1 EMPLOYEE| Employee
        UserAuth -->|1:1 HR_ADMIN| HRAdmin
        Employee --> EmployeeProfile
    end

    subgraph Attendance
        Employee --> Attendance
        Attendance --> AttendanceSelfie
        Attendance --> FaceVerification
        Attendance --> GPSLog
        FaceEnrollment --> FaceVerification
        ControlRoomSite --> GPSLog
    end

    subgraph Workforce
        Employee --> ShiftAssignment
        Shift --> ShiftAssignment
        Employee --> WeeklyOff
        WeeklyOff --> WeeklyOffApproval
        HRAdmin --> WeeklyOffApproval
    end

    subgraph LeavePay
        Employee --> LeaveRequest
        Employee --> LeaveBalance
        Employee --> CompOffLedger
        Employee --> SalaryStructure
        SalaryStructure --> SalarySlip
        SalarySlip --> SalaryDeduction
    end

    subgraph Comms
        Employee --> NotificationPreference
        Employee --> NotificationLog
        Company --> AuditLog
        UserAuth --> AuditLog
        HRAdmin --> AuditLog
    end
```

### 3.2 Cardinality Reference

| Parent | Child | Relation | FK on child |
|--------|-------|----------|-------------|
| UserAuth | Employee | 1 : 0..1 | `employee.userId` |
| UserAuth | HRAdmin | 1 : 0..1 | `hrAdmin.userId` |
| Employee | EmployeeProfile | 1 : 1 | `employeeProfile.employeeId` |
| Employee | Attendance | 1 : N | `attendance.employeeId` |
| Attendance | AttendanceSelfie | 1 : 1 | `attendanceSelfie.attendanceRecordId` |
| Attendance | FaceVerification | 1 : 1 | `faceVerification.attendanceRecordId` |
| Attendance | GPSLog | 1 : 1 | `gpsLog.attendanceRecordId` |
| Employee | ShiftAssignment | 1 : N | `shiftAssignment.employeeId` |
| Shift | ShiftAssignment | 1 : N | `shiftAssignment.shiftId` |
| Employee | WeeklyOff | 1 : N | `weeklyOff.employeeId` |
| WeeklyOff | WeeklyOffApproval | 1 : 1 | `weeklyOffApproval.preferenceId` |
| Employee | CompOffLedger | 1 : N | `compOffLedger.employeeId` |
| Employee | CompOffBalance | 1 : 1 | `compOffBalance.employeeId` |
| Employee | LeaveRequest | 1 : N | `leaveRequest.employeeId` |
| LeaveRequest | LeaveApproval | 1 : 1 | `leaveApproval.leaveRequestId` |
| Employee | SalarySlip | 1 : N | `salarySlip.employeeId` |
| SalarySlip | SalaryDeduction | 1 : N | `salaryDeduction.salarySlipId` |
| Employee | NotificationPreference | 1 : 1 | `notificationPreference.employeeId` |

### 3.3 Required Model Mapping (User Request)

| Requested model | Prisma model | SQL table |
|-----------------|--------------|-----------|
| UserAuth | `UserAuth` | `users` |
| HRAdmin | `HRAdmin` | `hr_admins` |
| Employee | `Employee` | `employees` |
| EmployeeProfile | `EmployeeProfile` | `employee_profiles` |
| EmployeeDocument | `EmployeeDocument` | `employee_documents` |
| Attendance | `Attendance` | `attendance_records` |
| AttendanceSelfie | `AttendanceSelfie` | `attendance_selfies` |
| FaceVerification | `FaceVerification` | `face_verification_records` |
| GPSLog | `GPSLog` | `gps_location_logs` |
| Shift | `Shift` | `shift_definitions` |
| ShiftAssignment | `ShiftAssignment` | `employee_shift_assignments` |
| WeeklyOff | `WeeklyOff` | `weekly_off_preferences` |
| CompOffLedger | `CompOffLedger` | `comp_off_ledger` |
| LeaveRequest | `LeaveRequest` | `leave_requests` |
| LeaveBalance | `LeaveBalance` | `leave_balances` |
| SalaryStructure | `SalaryStructure` | `salary_structures` |
| SalaryDeduction | `SalaryDeduction` | `salary_deductions` |
| SalarySlip | `SalarySlip` | `salary_slips` |
| NotificationPreference | `NotificationPreference` | `notification_preferences` |
| NotificationLog | `NotificationLog` | `notification_logs` |
| AuditLog | `AuditLog` | `audit_logs` |

---

## 4. Migration Strategy

### 4.1 Phased Migrations

| Phase | Migration name | Contents |
|-------|----------------|----------|
| 0 | `00_init_extensions` | `pgcrypto`, optional `btree_gist` |
| 1 | `01_enums` | All PostgreSQL enums (or let Prisma create via schema) |
| 2 | `02_organization` | Company, ControlRoomSite |
| 3 | `03_identity` | UserAuth, HRAdmin, Employee, EmployeeProfile |
| 4 | `04_documents_face` | EmployeeDocument, FaceEnrollment |
| 5 | `05_shifts_weekly_off` | Shift, ShiftAssignment, WeeklyOff, approvals, work logs |
| 6 | `06_attendance` | Attendance, Selfie, FaceVerification, GPSLog, DerivedDay |
| 7 | `07_leave_comp_off` | LeaveType, LeaveBalance, LeaveRequest, CompOffLedger, CompOffBalance |
| 8 | `08_payroll` | SalaryStructure, SalarySlip, SalaryDeduction |
| 9 | `09_notifications_audit` | NotificationPreference, NotificationLog, AuditLog |
| 10 | `10_partial_indexes` | Raw SQL partial uniques (Section 2.3) |
| 11 | `11_triggers` | Comp-off balance sync, optional audit trigger |

### 4.2 Commands

```bash
# Initialize Prisma in API app
cd apps/api
npm install prisma @prisma/client --save-dev
npx prisma init

# Copy schema from Section 2 → prisma/schema.prisma
# Set DATABASE_URL in .env

# Create and apply first migration
npx prisma migrate dev --name init

# Apply partial indexes (custom SQL)
npx prisma migrate dev --name partial_indexes --create-only
# Edit migration SQL, then:
npx prisma migrate dev

# Generate client
npx prisma generate

# Production deploy
npx prisma migrate deploy
```

### 4.3 Environment Strategy

| Environment | Database | Migration |
|-------------|----------|-----------|
| Local | Docker PostgreSQL | `migrate dev` + `db seed` |
| CI | Ephemeral Postgres | `migrate deploy` + test seed |
| Staging | Managed Postgres | `migrate deploy` |
| Production | Managed Postgres + backups | `migrate deploy` (no `db push`) |

### 4.4 Rules

- Never use `prisma db push` in production; use versioned migrations only.
- Review generated SQL for enum renames (destructive).
- Keep `comp_off_ledger` and `audit_logs` append-only at application layer.
- Run `prisma migrate diff` before release to compare schema vs database.

### 4.5 Rollback Policy

- Forward-only migrations in production.
- Roll back application version, not schema, unless a down migration is written and tested.
- For bad data migrations, ship a corrective `migrate` script instead of reverting DDL.

---

## 5. Seed Data Strategy

### 5.1 Seed File Structure

```
prisma/
├── seed.ts                 # Entry: orchestrates all seeders
└── seeds/
    ├── 01-company.ts
    ├── 02-shifts.ts
    ├── 03-leave-types.ts
    ├── 04-control-room.ts
    ├── 05-hr-admin.ts
    └── 06-demo-employees.ts   # Optional dev-only
```

### 5.2 `package.json` Configuration

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

### 5.3 Seed Order & Idempotency

| Order | Seeder | Idempotency key | Data |
|-------|--------|-----------------|------|
| 1 | Company | `name = 'AVSOFT CORPORATION'` | 1 company, timezone, settings JSON |
| 2 | Shifts | `companyId + code` | MORNING, EVENING, NIGHT |
| 3 | Leave types | `companyId + code` | CASUAL, SICK, PAID, COMP_OFF |
| 4 | Control room | `companyId + name` | Default site, lat/lng TBD, radius 50 |
| 5 | HR admin | `email` | 1 admin user + HRAdmin row |
| 6 | Demo employees | `employeeCode` | Dev/staging only (5–10 samples) |

Use `upsert` for all reference data:

```typescript
// prisma/seeds/02-shifts.ts
export async function seedShifts(prisma: PrismaClient, companyId: string) {
  const shifts = [
    { code: 'MORNING', name: 'Morning Shift', startTime: '06:00:00', endTime: '14:00:00', crossesMidnight: false },
    { code: 'EVENING', name: 'Evening Shift', startTime: '14:00:00', endTime: '22:00:00', crossesMidnight: false },
    { code: 'NIGHT',   name: 'Night Shift',   startTime: '22:00:00', endTime: '06:00:00', crossesMidnight: true },
  ];
  for (const s of shifts) {
    await prisma.shift.upsert({
      where: { companyId_code: { companyId, code: s.code } },
      create: { companyId, ...s, startTime: new Date(`1970-01-01T${s.startTime}`), endTime: new Date(`1970-01-01T${s.endTime}`) },
      update: { name: s.name, crossesMidnight: s.crossesMidnight },
    });
  }
}
```

### 5.4 Company Settings Seed

```typescript
settingsJson: {
  grace_minutes: 10,
  standard_hours_per_day: 8,
  face_match_threshold: 80,
  geofence_radius_meters: 50,
  late_half_day_after_minutes: 120,
}
```

### 5.5 Leave Type Seed

| code | name | requiresBalance |
|------|------|-----------------|
| CASUAL | Casual Leave | true |
| SICK | Sick Leave | true |
| PAID | Paid Leave | true |
| COMP_OFF | Comp Off Leave | false |

### 5.6 HR Admin Seed (Staging/Prod)

- Create via secure script with env vars: `SEED_HR_EMAIL`, `SEED_HR_MOBILE`, `SEED_HR_PASSWORD`.
- Hash password with bcrypt before insert.
- Do not commit real credentials.

### 5.7 Demo Employee Seed (Dev Only)

```typescript
if (process.env.NODE_ENV !== 'production') {
  await seedDemoEmployees(prisma, companyId, {
    count: 5,
    defaultShiftCode: 'MORNING',
    defaultSalary: 30000,
    annualLeave: { CASUAL: 12, SICK: 10, PAID: 15 },
  });
}
```

Each demo employee creates in one transaction:

1. `UserAuth` (role EMPLOYEE)
2. `Employee` + `EmployeeProfile`
3. `NotificationPreference` (all channels per requirements defaults)
4. `CompOffBalance` (balance 0)
5. `ShiftAssignment` (current)
6. `SalaryStructure` (effective_from = join_date)
7. `LeaveBalance` rows for current year

### 5.8 Running Seeds

```bash
# Full seed
npx prisma db seed

# Reset local DB and reseed
npx prisma migrate reset

# Seed staging (no demo employees)
NODE_ENV=staging npx prisma db seed
```

### 5.9 Test Fixtures

- Use separate `prisma/test-seed.ts` with minimal rows for integration tests.
- Wrap tests in transactions or use `prisma migrate reset` in CI before suite.

---

## 6. Implementation Checklist

- [ ] Create `prisma/schema.prisma` from Section 2
- [ ] Add `DATABASE_URL` to `.env.example`
- [ ] Run `prisma migrate dev --name init`
- [ ] Add partial unique indexes migration (Section 2.3)
- [ ] Implement `prisma/seed.ts` and reference seeders
- [ ] Register soft-delete middleware
- [ ] Export `PrismaClient` singleton with extensions
- [ ] Validate schema: `npx prisma validate`
- [ ] Generate ER diagram: `npx prisma generate` + optional `prisma-erd-generator`
- [ ] Align API DTOs with Prisma types (`@prisma/client` exports)

---

## Appendix — Index & Unique Quick Reference

| Model | `@@unique` | `@@index` |
|-------|------------|-----------|
| UserAuth | — | companyId+role+status; email; mobile |
| Employee | companyId+employeeCode | companyId+status |
| Attendance | employeeId+clientRequestId | employeeId+shiftDate; companyId+punchedAt |
| AttendanceDerivedDay | employeeId+workDate | employeeId+workDate |
| LeaveBalance | employeeId+leaveTypeId+calendarYear | — |
| LeaveRequest | — | status+startDate; employeeId+createdAt |
| SalarySlip | employeeId+year+month | payPeriod+status |
| Shift | companyId+code | — |
| LeaveType | companyId+code | — |
| WeeklyOffWorkLog | employeeId+workDate | — |

---

*This plan implements [database-design.md](./database-design.md) in Prisma. Next step: copy Section 2 into `prisma/schema.prisma` and run migrations.*
