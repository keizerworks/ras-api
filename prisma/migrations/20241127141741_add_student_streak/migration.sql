-- CreateTable
CREATE TABLE "student_streaks" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "streakCount" INTEGER NOT NULL DEFAULT 0,
    "lastVisit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_streaks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_streaks_studentId_key" ON "student_streaks"("studentId");

-- AddForeignKey
ALTER TABLE "student_streaks" ADD CONSTRAINT "student_streaks_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
