/*
  Warnings:

  - Made the column `date_of_birth` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "date_of_birth" SET NOT NULL;
