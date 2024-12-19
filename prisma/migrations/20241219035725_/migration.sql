-- AlterTable
ALTER TABLE "brands" ADD COLUMN     "deleted_at" TIMESTAMP;

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "deleted_at" TIMESTAMP;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "deleted_at" TIMESTAMP;
