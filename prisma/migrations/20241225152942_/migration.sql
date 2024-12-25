-- CreateTable
CREATE TABLE "accounts" (
    "id" VARCHAR(36) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" TEXT NOT NULL,
    "access_token" VARCHAR(255),
    "reset_code" VARCHAR(255),
    "reset_code_expires" TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staffs" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(17) NOT NULL,

    CONSTRAINT "staffs_pkey" PRIMARY KEY ("id")
);
