import { pgTable, unique, pgPolicy, timestamp, varchar, date, real, bigint, text, json, uuid, foreignKey, smallint, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { authUsers } from "drizzle-orm/supabase"

export const Users = pgTable("Users", {
	id: uuid().default(sql`auth.uid()`).primaryKey().notNull(),
	email: varchar().default(sql`(SELECT email FROM auth.users WHERE id = auth.uid())`),
	first_name: varchar().default(sql`(SELECT raw_user_meta_data->>'first_name' FROM auth.users WHERE id = auth.uid())`),
	last_name: varchar().default(sql`(SELECT raw_user_meta_data->>'last_name' FROM auth.users WHERE id = auth.uid())`),
	dob: date(),
	country: varchar(),
	education_level: varchar(),
	major: varchar(),
	gpa: real(),
	gre_score: bigint({ mode: "number" }),
	toefl_score: bigint({ mode: "number" }),
	ielts_score: bigint({ mode: "number" }),
	profile_description: text(),
	chat_response: json(),
	created_at: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updated_at: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
	unique("User_id_key").on(table.id),
	pgPolicy("Users can access their own profile", { as: "permissive", for: "all", to: ["public"], using: sql`(( SELECT auth.uid() AS uid) = id)`, withCheck: sql`(( SELECT auth.uid() AS uid) = id)`  }),
	pgPolicy("Enable update for users based on email", { as: "permissive", for: "update", to: ["public"] }),
]);

export type InsertUser = typeof Users.$inferInsert;
export type SelectUser = typeof Users.$inferSelect;

export const Universities = pgTable("Universities", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	location: text(),
	website: varchar(),
	description: text(),
	created_at: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updated_at: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
	unique("University_university_name_key").on(table.name),
]);

export type InsertUniversity = typeof Universities.$inferInsert;
export type SelectUniversity = typeof Universities.$inferSelect;

export const Programs = pgTable("Programs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	degree_type: varchar().notNull(),
	name: varchar().notNull(),
	website: varchar(),
	description: text(),
	deadline: date(),
	application_fee: real(),
	avg_gpa_admit: real(),
	avg_gre_admit: real(),
	university: uuid().notNull(),
	created_at: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updated_at: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
	foreignKey({
			columns: [table.university],
			foreignColumns: [Universities.id],
			name: "Programs_university_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export type InsertProgram = typeof Programs.$inferInsert;
export type SelectProgram = typeof Programs.$inferSelect;

export const User_Program_Preferences = pgTable("User_Program_Preferences", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	user: uuid().default(sql`auth.uid()`).notNull(),
	program: uuid().notNull(),
	favorite: boolean().default(false).notNull(),
	preference_level: smallint(),
	created_at: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updated_at: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
	foreignKey({
			columns: [table.program],
			foreignColumns: [Programs.id],
			name: "User_Program_Preferences_program_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export type InsertPreferences = typeof User_Program_Preferences.$inferInsert;
export type SelectPreferences = typeof User_Program_Preferences.$inferSelect;

export const Applications = pgTable("Applications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	user: uuid().default(sql`auth.uid()`).notNull(),
	program: uuid().notNull(),
	status: varchar(),
	submission_date: date(),
	created_at: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updated_at: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
	foreignKey({
			columns: [table.program],
			foreignColumns: [Programs.id],
			name: "Applications_program_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export type InsertApplication = typeof Applications.$inferInsert;
export type SelectApplication = typeof Applications.$inferSelect;