-- AlterTable
ALTER TABLE "Module" ADD COLUMN "learningObjectives" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Module" ADD COLUMN "keyTakeaways" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Module" ADD COLUMN "lessonContent" TEXT NOT NULL DEFAULT '';
