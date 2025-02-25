-- CreateTable
CREATE TABLE "Applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user" UUID NOT NULL DEFAULT auth.uid(),
    "program" UUID NOT NULL,
    "status" VARCHAR,
    "submission_date" DATE,

    CONSTRAINT "Applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Programs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "university" UUID,
    "degree_type" VARCHAR,
    "name" VARCHAR,
    "description" TEXT,
    "website" VARCHAR,
    "deadline" DATE,
    "application_fee" REAL,
    "avg_gpa_admit" REAL,
    "avg_gre_admit" REAL,

    CONSTRAINT "Programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Universities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "location" TEXT,
    "website" VARCHAR,
    "description" TEXT,

    CONSTRAINT "Universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User_Program_Preferences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user" UUID NOT NULL DEFAULT auth.uid(),
    "program" UUID NOT NULL,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "preference_level" SMALLINT,

    CONSTRAINT "User_Program_Preference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" UUID NOT NULL DEFAULT auth.uid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" VARCHAR,
    "first_name" VARCHAR,
    "last_name" VARCHAR,
    "dob" DATE,
    "country" VARCHAR,
    "education_level" VARCHAR,
    "major" VARCHAR,
    "gpa" REAL,
    "gre_score" BIGINT,
    "toefl_score" BIGINT,
    "ielts_score" BIGINT,
    "profile_description" TEXT,
    "chat_response" JSON,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "University_university_name_key" ON "Universities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "Users"("id");

-- AddForeignKey
ALTER TABLE "Applications" ADD CONSTRAINT "Applications_program_fkey" FOREIGN KEY ("program") REFERENCES "Programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Programs" ADD CONSTRAINT "Programs_university_fkey" FOREIGN KEY ("university") REFERENCES "Universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Program_Preferences" ADD CONSTRAINT "User_Program_Preferences_program_fkey" FOREIGN KEY ("program") REFERENCES "Programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

