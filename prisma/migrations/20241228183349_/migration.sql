-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_admin" BOOLEAN,
ADD COLUMN     "is_customer" BOOLEAN,
ADD COLUMN     "is_customer_first_login" BOOLEAN,
ADD COLUMN     "status" "AccountStatus" DEFAULT 'ACTIVE';
