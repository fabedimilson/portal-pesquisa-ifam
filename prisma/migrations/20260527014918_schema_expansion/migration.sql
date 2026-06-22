-- AlterTable
ALTER TABLE "Project" ADD COLUMN "contaBancoValida" BOOLEAN DEFAULT false;
ALTER TABLE "Project" ADD COLUMN "cpfUploaded" BOOLEAN DEFAULT false;
ALTER TABLE "Project" ADD COLUMN "declaracaoPeriodo" TEXT;
ALTER TABLE "Project" ADD COLUMN "lattesUrl" TEXT;
ALTER TABLE "Project" ADD COLUMN "matriculaRegular" BOOLEAN DEFAULT false;
ALTER TABLE "Project" ADD COLUMN "residenciaUploaded" BOOLEAN DEFAULT false;
ALTER TABLE "Project" ADD COLUMN "rgUploaded" BOOLEAN DEFAULT false;
ALTER TABLE "Project" ADD COLUMN "termoFapeam" TEXT;

-- CreateTable
CREATE TABLE "ResearchGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "lider" TEXT NOT NULL,
    "linhas" TEXT NOT NULL,
    "membros" TEXT NOT NULL,
    "campus" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastActivity" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Fruit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "linkUrl" TEXT,
    "projectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Fruit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Substitution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "estudanteSainte" TEXT NOT NULL,
    "estudanteEntrante" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "relatorioParcialUrl" TEXT,
    "justificativa" TEXT,
    CONSTRAINT "Substitution_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "cargaHoraria" INTEGER NOT NULL,
    "emissao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Certificate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_hash_key" ON "Certificate"("hash");
