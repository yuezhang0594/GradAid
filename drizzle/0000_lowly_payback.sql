-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "Users" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"dob" date,
	"country" varchar,
	"education_level" varchar,
	"major" varchar,
	"gpa" real,
	"gre_score" bigint,
	"toefl_score" bigint,
	"ielts_score" bigint,
	"profile_description" text,
	"chat_response" json,
	"id" uuid PRIMARY KEY DEFAULT auth.uid() NOT NULL,
	CONSTRAINT "User_id_key" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "Users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "Universities" (
	"name" text NOT NULL,
	"location" text,
	"website" varchar,
	"description" text,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	CONSTRAINT "University_university_name_key" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "Universities" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "Programs" (
	"name" varchar,
	"website" varchar,
	"degree_type" varchar,
	"description" text,
	"deadline" date,
	"application_fee" real,
	"avg_gpa_admit" real,
	"avg_gre_admit" real,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"university" uuid
);
--> statement-breakpoint
ALTER TABLE "Programs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "User_Program_Preferences" (
	"preference_level" smallint,
	"user" uuid DEFAULT auth.uid() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"favorite" boolean DEFAULT false NOT NULL,
	"program" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "User_Program_Preferences" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "Applications" (
	"status" varchar,
	"submission_date" date,
	"user" uuid DEFAULT auth.uid() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Applications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "Programs" ADD CONSTRAINT "Programs_university_fkey" FOREIGN KEY ("university") REFERENCES "public"."Universities"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "User_Program_Preferences" ADD CONSTRAINT "User_Program_Preferences_program_fkey" FOREIGN KEY ("program") REFERENCES "public"."Programs"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Applications" ADD CONSTRAINT "Applications_program_fkey" FOREIGN KEY ("program") REFERENCES "public"."Programs"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE POLICY "Users can access their own profile" ON "Users" AS PERMISSIVE FOR ALL TO public USING ((( SELECT auth.uid() AS uid) = id)) WITH CHECK ((( SELECT auth.uid() AS uid) = id));--> statement-breakpoint
CREATE POLICY "Enable update for users based on email" ON "Users" AS PERMISSIVE FOR UPDATE TO public;
*/