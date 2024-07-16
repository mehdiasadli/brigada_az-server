/*
  Warnings:

  - Made the column `location` on table `Game` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `first_name` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "location" SET NOT NULL;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;
