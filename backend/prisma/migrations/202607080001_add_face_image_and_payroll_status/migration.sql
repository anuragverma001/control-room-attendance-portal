-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'PayrollStatus'
    ) THEN
        CREATE TYPE "PayrollStatus" AS ENUM (
            'GENERATED',
            'PAID',
            'CANCELLED'
        );
    END IF;
END $$;

-- Employee.faceImage
ALTER TABLE "Employee"
ADD COLUMN IF NOT EXISTS "faceImage" TEXT;

-- Payroll.status
ALTER TABLE "Payroll"
ADD COLUMN IF NOT EXISTS "status" "PayrollStatus"
NOT NULL DEFAULT 'GENERATED';
