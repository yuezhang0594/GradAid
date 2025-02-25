import { pgTable, unique, pgPolicy, timestamp, varchar, date, real, bigint, text, json, uuid, foreignKey, smallint, boolean } from "drizzle-orm/pg-core"
import { ne, sql } from "drizzle-orm"

export const Users = pgTable("Users", {
	id: uuid().default(sql`auth.uid()`).primaryKey().notNull(),
	email: varchar(),
	first_name: varchar(),
	last_name: varchar(),
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

export const Programs = pgTable("Programs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar(),
	website: varchar(),
	degree_type: varchar(),
	description: text(),
	deadline: date(),
	application_fee: real(),
	avg_gpa_admit: real(),
	avg_gre_admit: real(),
	university: uuid(),
	created_at: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updated_at: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
	foreignKey({
			columns: [table.university],
			foreignColumns: [Universities.id],
			name: "Programs_university_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const User_Program_Preferences = pgTable("User_Program_Preferences", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	user: uuid().default(sql`auth.uid()`).notNull(),
	program: uuid().notNull(),
	preference_level: smallint(),
	favorite: boolean().default(false).notNull(),
	created_at: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updated_at: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
	foreignKey({
			columns: [table.program],
			foreignColumns: [Programs.id],
			name: "User_Program_Preferences_program_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

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
