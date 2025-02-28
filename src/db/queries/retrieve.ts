import db from "../index";
import * as t from "../schema";
import { SelectUser, SelectUniversity, SelectProgram, SelectApplication, SelectPreferences } from "../schema";
import { eq } from "drizzle-orm";

// Retrieve a user by ID
export async function getUserById(id: SelectUser['id']): Promise<
	Array<{
		id: string,
		email: string | null,
		first_name: string | null,
		last_name: string | null,
		dob: string | null,
		country: string | null,
		education_level: string | null,
		major: string | null,
		gpa: number | null,
		gre_score: number | null,
		toefl_score: number | null,
		ielts_score: number | null,
		profile_description: string | null,
		chat_response: unknown,
	}>
> {
	return await db.select().from(t.Users).where(eq(t.Users.id, id));
}

// Retrieve all users
export async function getAllUsers(): Promise<SelectUser[]> {
	return await db.query.Users.findMany();
}

// Retrieve a university by ID
export async function getUniversityById(id: SelectUniversity['id']): Promise<
	Array<{
		id: string;
		name: string;
		location: string | null;
		website: string | null;
		description: string | null;
	}>
> {
	return await db.select().from(t.Universities).where(eq(t.Universities.id, id));
}

// Retrieve all universities
export async function getAllUniversities(): Promise<SelectUniversity[]> {
	return await db.query.Universities.findMany();
}

// Retrieve a program by ID
export async function getProgramById(id: SelectProgram['id']): Promise<
	Array<{
		id: string;
		degree_type: string;
		name: string;
		website: string | null;
		description: string | null;
		deadline: string | null;
		application_fee: number | null;
		avg_gpa_admit: number | null;
		avg_gre_admit: number | null;
		university: string;
	}>
> {
	return await db.select().from(t.Programs).where(eq(t.Programs.id, id));
}

// Retrieve all programs
export async function getAllPrograms(): Promise<SelectProgram[]> {
	return await db.query.Programs.findMany();
}

// Retrieve a user program preference by ID
export async function getUserProgramPreferenceById(id: SelectPreferences['id']): Promise<
	Array<{
		id: string;
		user: string;
		program: string;
		preference_level: number | null;
		favorite: boolean;
	}>
> {
	return await db.select().from(t.User_Program_Preferences).where(eq(t.User_Program_Preferences.id, id));
}

// Retrieve all user program preferences
export async function getAllUserProgramPreferences(): Promise<SelectPreferences[]> {
	return await db.query.User_Program_Preferences.findMany();
}

// Retrieve an application by ID
export async function getApplicationById(id: SelectApplication['id']): Promise<
	Array<{
		id: string;
		user: string;
		program: string;
		status: string | null;
		submission_date: string | null;
		created_at: Date;
		updated_at: Date;
	}>
> {
	return await db.select().from(t.Applications).where(eq(t.Applications.id, id));
}

// Retrieve all applications
export async function getAllApplications(): Promise<SelectApplication[]> {
	return await db.query.Applications.findMany();
}
