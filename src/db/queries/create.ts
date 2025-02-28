import db from "../index";
import * as t from "../schema";
import { InsertUser, InsertUniversity, InsertProgram, InsertApplication, InsertPreferences } from "../schema";

// Insert a new user
export async function createUser(data: InsertUser) {
	return await db.insert(t.Users).values(data);
}

// Insert a new university
export async function createUniversity(data: InsertUniversity) {
	return await db.insert(t.Universities).values(data);
}

// Insert a new program
export async function createProgram(data: InsertProgram) {
	return await db.insert(t.Programs).values(data);
}

// Insert a new user program preference
export async function createUserProgramPreference(data: InsertPreferences) {
	return await db.insert(t.User_Program_Preferences).values(data);
}

// Insert a new application
export async function createApplication(data: InsertApplication) {
	return await db.insert(t.Applications).values(data);
}

