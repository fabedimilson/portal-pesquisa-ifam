-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "campus" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "orientador" TEXT NOT NULL,
    "fomento" TEXT NOT NULL,
    "discente" TEXT,
    "status" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Frequency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "hours" INTEGER NOT NULL,
    "activityType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "feedback" TEXT,
    "banco" TEXT,
    "agencia" TEXT,
    "conta" TEXT,
    CONSTRAINT "Frequency_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
