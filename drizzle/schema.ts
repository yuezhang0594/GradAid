import { pgTable, unique, pgPolicy, timestamp, varchar, date, real, bigint, text, json, uuid, foreignKey, smallint, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const Users = pgTable("Users", {
	created_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	email: varchar(),
	first_name: varchar(),
	last_name: varchar(),
	dob: date(),
	country: varchar(),
	education_level: varchar(),
	major: varchar(),
	gpa: real(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	gre_score: bigint({ mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	toefl_score: bigint({ mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	ielts_score: bigint({ mode: "number" }),
	profile_description: text(),
	chat_response: json(),
	id: uuid().default(sql`auth.uid()`).primaryKey().notNull(),
}, (table) => [
	unique("User_id_key").on(table.id),
	pgPolicy("Users can access their own profile", { as: "permissive", for: "all", to: ["public"], using: sql`(( SELECT auth.uid() AS uid) = id)`, withCheck: sql`(( SELECT auth.uid() AS uid) = id)`  }),
	pgPolicy("Enable update for users based on email", { as: "permissive", for: "update", to: ["public"] }),
]);

export const Universities = pgTable("Universities", {
	name: text().notNull(),
	location: text(),
	website: varchar(),
	description: text(),
	id: uuid().defaultRandom().primaryKey().notNull(),
}, (table) => [
	unique("University_university_name_key").on(table.name),
]);

export const Programs = pgTable("Programs", {
	name: varchar(),
	website: varchar(),
	degree_type: varchar(),
	description: text(),
	deadline: date(),
	application_fee: real(),
	avg_gpa_admit: real(),
	avg_gre_admit: real(),
	id: uuid().defaultRandom().primaryKey().notNull(),
	university: uuid(),
}, (table) => [
	foreignKey({
			columns: [table.university],
			foreignColumns: [Universities.id],
			name: "Programs_university_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const User_Program_Preferences = pgTable("User_Program_Preferences", {
	preference_level: smallint(),
	user: uuid().default(sql`auth.uid()`).notNull(),
	id: uuid().defaultRandom().primaryKey().notNull(),
	favorite: boolean().default(false).notNull(),
	program: uuid().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.program],
			foreignColumns: [Programs.id],
			name: "User_Program_Preferences_program_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const Applications = pgTable("Applications", {
	status: varchar(),
	submission_date: date(),
	user: uuid().default(sql`auth.uid()`).notNull(),
	id: uuid().defaultRandom().primaryKey().notNull(),
	program: uuid().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.program],
			foreignColumns: [Programs.id],
			name: "Applications_program_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);
