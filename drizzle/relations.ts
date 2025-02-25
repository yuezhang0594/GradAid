import { relations } from "drizzle-orm/relations";
import { Universities, Programs, User_Program_Preferences, Applications } from "./schema";

export const ProgramsRelations = relations(Programs, ({one, many}) => ({
	University: one(Universities, {
		fields: [Programs.university],
		references: [Universities.id]
	}),
	User_Program_Preferences: many(User_Program_Preferences),
	Applications: many(Applications),
}));

export const UniversitiesRelations = relations(Universities, ({many}) => ({
	Programs: many(Programs),
}));

export const User_Program_PreferencesRelations = relations(User_Program_Preferences, ({one}) => ({
	Program: one(Programs, {
		fields: [User_Program_Preferences.program],
		references: [Programs.id]
	}),
}));

export const ApplicationsRelations = relations(Applications, ({one}) => ({
	Program: one(Programs, {
		fields: [Applications.program],
		references: [Programs.id]
	}),
}));