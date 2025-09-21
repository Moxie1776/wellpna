-- CreateTable
CREATE TABLE "Casing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "api" TEXT NOT NULL,
    "casingEnumId" TEXT NOT NULL,
    "topDepth" INTEGER NOT NULL,
    "bottomDepth" INTEGER NOT NULL,
    "joints" INTEGER,
    "centralizer" BOOLEAN,
    "shortJtTop" BOOLEAN,
    CONSTRAINT "Casing_casingEnumId_fkey" FOREIGN KEY ("casingEnumId") REFERENCES "CasingEnum" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Casing_api_fkey" FOREIGN KEY ("api") REFERENCES "Well" ("api") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CasingEnum" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "internalDiameter" REAL NOT NULL,
    "externalDiameter" REAL NOT NULL,
    "tocDepth" INTEGER NOT NULL,
    "weight" REAL,
    "grade" TEXT
);

-- CreateTable
CREATE TABLE "Geology" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sandName" TEXT,
    "formationCommonName" TEXT,
    "usableWaterStrata" TEXT NOT NULL,
    "shallowestProducingZone" TEXT,
    "saltwaterDisposalZone" TEXT
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "api" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "sectionNo" TEXT,
    "blockNo" TEXT,
    "survey" TEXT,
    "abstractNo" TEXT,
    "distanceFromTown" TEXT NOT NULL,
    CONSTRAINT "Location_api_fkey" FOREIGN KEY ("api") REFERENCES "Well" ("api") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MechanicalIsolation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "api" TEXT NOT NULL,
    "mechanicalIsolationEnumId" TEXT NOT NULL,
    "topDepth" INTEGER NOT NULL,
    "bottomDepth" INTEGER,
    "dateSet" DATETIME,
    CONSTRAINT "MechanicalIsolation_mechanicalIsolationEnumId_fkey" FOREIGN KEY ("mechanicalIsolationEnumId") REFERENCES "MechanicalIsolationEnum" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MechanicalIsolation_api_fkey" FOREIGN KEY ("api") REFERENCES "Well" ("api") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MechanicalIsolationEnum" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Operator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "operatorNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rrcOperatorNo" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "OperatorContact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "operatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    CONSTRAINT "OperatorContact_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Perforation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "api" TEXT NOT NULL,
    "stage" INTEGER NOT NULL,
    "formation" TEXT,
    "topDepth" INTEGER NOT NULL,
    "bottomDepth" INTEGER NOT NULL,
    "datePerforated" DATETIME,
    "notes" TEXT,
    CONSTRAINT "Perforation_api_fkey" FOREIGN KEY ("api") REFERENCES "Well" ("api") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlugCement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plugScheduleId" TEXT NOT NULL,
    "cementEnumType" TEXT NOT NULL,
    "bbl" REAL NOT NULL,
    "sacks" REAL NOT NULL,
    "yield" REAL NOT NULL,
    "excessPercent" REAL NOT NULL,
    CONSTRAINT "PlugCement_cementEnumType_fkey" FOREIGN KEY ("cementEnumType") REFERENCES "PlugCementEnum" ("type") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlugCement_plugScheduleId_fkey" FOREIGN KEY ("plugScheduleId") REFERENCES "PlugSchedule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlugCementEnum" (
    "type" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "PlugSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "api" TEXT NOT NULL,
    "mechanicalIsolationEnumId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "topDepth" INTEGER NOT NULL,
    "bottomDepth" INTEGER,
    "dateSet" DATETIME,
    "description" TEXT NOT NULL,
    "wocDetails" TEXT,
    "notes" TEXT,
    CONSTRAINT "PlugSchedule_mechanicalIsolationEnumId_fkey" FOREIGN KEY ("mechanicalIsolationEnumId") REFERENCES "MechanicalIsolationEnum" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlugSchedule_api_fkey" FOREIGN KEY ("api") REFERENCES "Well" ("api") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Rods" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "api" TEXT NOT NULL,
    "joints" INTEGER NOT NULL,
    "rodEnumId" TEXT NOT NULL,
    CONSTRAINT "Rods_rodEnumId_fkey" FOREIGN KEY ("rodEnumId") REFERENCES "RodEnum" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Rods_api_fkey" FOREIGN KEY ("api") REFERENCES "Well" ("api") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RodEnum" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Tubing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "api" TEXT NOT NULL,
    "tubingEnumId" TEXT NOT NULL,
    "depth" INTEGER NOT NULL,
    "joints" INTEGER NOT NULL,
    "size" REAL NOT NULL,
    "grade" TEXT NOT NULL,
    CONSTRAINT "Tubing_tubingEnumId_fkey" FOREIGN KEY ("tubingEnumId") REFERENCES "TubingEnum" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Tubing_api_fkey" FOREIGN KEY ("api") REFERENCES "Well" ("api") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TubingEnum" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "internalDiameter" REAL NOT NULL,
    "externalDiameter" REAL NOT NULL,
    "weight" REAL NOT NULL,
    "grade" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roleId" TEXT NOT NULL DEFAULT 'default_role_id',
    "code" TEXT,
    "registeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validatedAt" DATETIME,
    CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole" ("role") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserRole" (
    "role" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "Well" (
    "api" TEXT NOT NULL PRIMARY KEY,
    "operatorId" TEXT,
    "wellInfoId" TEXT,
    "locationId" TEXT,
    "geologyId" TEXT,
    CONSTRAINT "Well_geologyId_fkey" FOREIGN KEY ("geologyId") REFERENCES "Geology" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Well_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WellInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "api" TEXT NOT NULL,
    "districtNo" TEXT NOT NULL,
    "drillingPermitNo" TEXT NOT NULL,
    "wellNo" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "lease" TEXT NOT NULL,
    "completionType" TEXT NOT NULL,
    "totalDepth" INTEGER NOT NULL,
    "wellType" TEXT NOT NULL,
    CONSTRAINT "WellInfo_api_fkey" FOREIGN KEY ("api") REFERENCES "Well" ("api") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_api_key" ON "Location"("api");

-- CreateIndex
CREATE UNIQUE INDEX "Operator_operatorNo_key" ON "Operator"("operatorNo");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Well_api_key" ON "Well"("api");

-- CreateIndex
CREATE UNIQUE INDEX "Well_wellInfoId_key" ON "Well"("wellInfoId");

-- CreateIndex
CREATE UNIQUE INDEX "Well_locationId_key" ON "Well"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "WellInfo_api_key" ON "WellInfo"("api");
