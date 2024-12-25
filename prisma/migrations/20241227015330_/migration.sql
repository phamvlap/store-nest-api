-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(36) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "phone_number" VARCHAR(17),
    "password" TEXT NOT NULL,
    "reset_code" VARCHAR(255),
    "reset_code_expires_at" TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
