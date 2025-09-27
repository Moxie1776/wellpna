-- CreateTable
CREATE TABLE "public"."Casing" (
    "id" TEXT NOT NULL,
    "api" TEXT NOT NULL,
    "casingEnumId" TEXT NOT NULL,
    "topDepth" INTEGER NOT NULL,
    "bottomDepth" INTEGER NOT NULL,
    "joints" INTEGER,
    "centralizer" BOOLEAN,
    "shortJtTop" BOOLEAN,

    CONSTRAINT "Casing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CasingEnum" (
    "id" TEXT NOT NULL,
    "internalDiameter" DOUBLE PRECISION NOT NULL,
    "externalDiameter" DOUBLE PRECISION NOT NULL,
    "tocDepth" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION,
    "grade" TEXT,

    CONSTRAINT "CasingEnum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Geology" (
    "id" TEXT NOT NULL,
    "sandName" TEXT,
    "formationCommonName" TEXT,
    "usableWaterStrata" TEXT NOT NULL,
    "shallowestProducingZone" TEXT,
    "saltwaterDisposalZone" TEXT,

    CONSTRAINT "Geology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Location" (
    "id" TEXT NOT NULL,
    "api" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "sectionNo" TEXT,
    "blockNo" TEXT,
    "survey" TEXT,
    "abstractNo" TEXT,
    "distanceFromTown" TEXT NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MechanicalIsolation" (
    "id" TEXT NOT NULL,
    "api" TEXT NOT NULL,
    "mechanicalIsolationEnumId" TEXT NOT NULL,
    "topDepth" INTEGER NOT NULL,
    "bottomDepth" INTEGER,
    "dateSet" TIMESTAMP(3),

    CONSTRAINT "MechanicalIsolation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MechanicalIsolationEnum" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "MechanicalIsolationEnum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Operator" (
    "id" TEXT NOT NULL,
    "operatorNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rrcOperatorNo" TEXT NOT NULL,

    CONSTRAINT "Operator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OperatorContact" (
    "id" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "OperatorContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Perforation" (
    "id" TEXT NOT NULL,
    "api" TEXT NOT NULL,
    "stage" INTEGER NOT NULL,
    "formation" TEXT,
    "topDepth" INTEGER NOT NULL,
    "bottomDepth" INTEGER NOT NULL,
    "datePerforated" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "Perforation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlugCement" (
    "id" TEXT NOT NULL,
    "plugScheduleId" TEXT NOT NULL,
    "cementEnumType" TEXT NOT NULL,
    "bbl" DOUBLE PRECISION NOT NULL,
    "sacks" DOUBLE PRECISION NOT NULL,
    "yield" DOUBLE PRECISION NOT NULL,
    "excessPercent" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PlugCement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlugCementEnum" (
    "type" TEXT NOT NULL,

    CONSTRAINT "PlugCementEnum_pkey" PRIMARY KEY ("type")
);

-- CreateTable
CREATE TABLE "public"."PlugSchedule" (
    "id" TEXT NOT NULL,
    "api" TEXT NOT NULL,
    "mechanicalIsolationEnumId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "topDepth" INTEGER NOT NULL,
    "bottomDepth" INTEGER,
    "dateSet" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "wocDetails" TEXT,
    "notes" TEXT,

    CONSTRAINT "PlugSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Rods" (
    "id" TEXT NOT NULL,
    "api" TEXT NOT NULL,
    "joints" INTEGER NOT NULL,
    "rodEnumId" TEXT NOT NULL,

    CONSTRAINT "Rods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RodEnum" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "RodEnum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tubing" (
    "id" TEXT NOT NULL,
    "api" TEXT NOT NULL,
    "tubingEnumId" TEXT NOT NULL,
    "depth" INTEGER NOT NULL,
    "joints" INTEGER NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "grade" TEXT NOT NULL,

    CONSTRAINT "Tubing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TubingEnum" (
    "id" TEXT NOT NULL,
    "internalDiameter" DOUBLE PRECISION NOT NULL,
    "externalDiameter" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "grade" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TubingEnum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roleId" TEXT NOT NULL DEFAULT 'user',
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validatedAt" TIMESTAMP(3),
    "verificationCode" TEXT,
    "verificationCodeExpiresAt" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetTokenExpiresAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserRole" (
    "role" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("role")
);

-- CreateTable
CREATE TABLE "public"."Well" (
    "api" TEXT NOT NULL,
    "operatorId" TEXT,
    "wellInfoId" TEXT,
    "locationId" TEXT,
    "geologyId" TEXT,

    CONSTRAINT "Well_pkey" PRIMARY KEY ("api")
);

-- CreateTable
CREATE TABLE "public"."WellInfo" (
    "id" TEXT NOT NULL,
    "api" TEXT NOT NULL,
    "districtNo" TEXT NOT NULL,
    "drillingPermitNo" TEXT NOT NULL,
    "wellNo" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "lease" TEXT NOT NULL,
    "completionType" TEXT NOT NULL,
    "totalDepth" INTEGER NOT NULL,
    "wellType" TEXT NOT NULL,

    CONSTRAINT "WellInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_api_key" ON "public"."Location"("api");

-- CreateIndex
CREATE UNIQUE INDEX "Operator_operatorNo_key" ON "public"."Operator"("operatorNo");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Well_api_key" ON "public"."Well"("api");

-- CreateIndex
CREATE UNIQUE INDEX "Well_wellInfoId_key" ON "public"."Well"("wellInfoId");

-- CreateIndex
CREATE UNIQUE INDEX "Well_locationId_key" ON "public"."Well"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "WellInfo_api_key" ON "public"."WellInfo"("api");

-- AddForeignKey
ALTER TABLE "public"."Casing" ADD CONSTRAINT "Casing_casingEnumId_fkey" FOREIGN KEY ("casingEnumId") REFERENCES "public"."CasingEnum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Casing" ADD CONSTRAINT "Casing_api_fkey" FOREIGN KEY ("api") REFERENCES "public"."Well"("api") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Location" ADD CONSTRAINT "Location_api_fkey" FOREIGN KEY ("api") REFERENCES "public"."Well"("api") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MechanicalIsolation" ADD CONSTRAINT "MechanicalIsolation_mechanicalIsolationEnumId_fkey" FOREIGN KEY ("mechanicalIsolationEnumId") REFERENCES "public"."MechanicalIsolationEnum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MechanicalIsolation" ADD CONSTRAINT "MechanicalIsolation_api_fkey" FOREIGN KEY ("api") REFERENCES "public"."Well"("api") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OperatorContact" ADD CONSTRAINT "OperatorContact_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "public"."Operator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Perforation" ADD CONSTRAINT "Perforation_api_fkey" FOREIGN KEY ("api") REFERENCES "public"."Well"("api") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlugCement" ADD CONSTRAINT "PlugCement_cementEnumType_fkey" FOREIGN KEY ("cementEnumType") REFERENCES "public"."PlugCementEnum"("type") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlugCement" ADD CONSTRAINT "PlugCement_plugScheduleId_fkey" FOREIGN KEY ("plugScheduleId") REFERENCES "public"."PlugSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlugSchedule" ADD CONSTRAINT "PlugSchedule_mechanicalIsolationEnumId_fkey" FOREIGN KEY ("mechanicalIsolationEnumId") REFERENCES "public"."MechanicalIsolationEnum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlugSchedule" ADD CONSTRAINT "PlugSchedule_api_fkey" FOREIGN KEY ("api") REFERENCES "public"."Well"("api") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rods" ADD CONSTRAINT "Rods_rodEnumId_fkey" FOREIGN KEY ("rodEnumId") REFERENCES "public"."RodEnum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rods" ADD CONSTRAINT "Rods_api_fkey" FOREIGN KEY ("api") REFERENCES "public"."Well"("api") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Tubing" ADD CONSTRAINT "Tubing_tubingEnumId_fkey" FOREIGN KEY ("tubingEnumId") REFERENCES "public"."TubingEnum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Tubing" ADD CONSTRAINT "Tubing_api_fkey" FOREIGN KEY ("api") REFERENCES "public"."Well"("api") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."UserRole"("role") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Well" ADD CONSTRAINT "Well_geologyId_fkey" FOREIGN KEY ("geologyId") REFERENCES "public"."Geology"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Well" ADD CONSTRAINT "Well_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "public"."Operator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WellInfo" ADD CONSTRAINT "WellInfo_api_fkey" FOREIGN KEY ("api") REFERENCES "public"."Well"("api") ON DELETE CASCADE ON UPDATE CASCADE;
