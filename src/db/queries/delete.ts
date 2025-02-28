import db from "../index";
import * as t from "../schema";
import { eq } from "drizzle-orm";

// Delete a user by ID
export async function deleteUser(userId) {
	return await db.delete(t.Users).where(eq(t.Users.id, userId)).returning();
}

// Delete a university by ID
export async function deleteUniversity(universityId) {
	return await db.delete(t.Universities).where(eq(t.Universities.id, universityId)).returning();
}

// Delete a program by ID
export async function deleteProgram(programId) {
	return await db.delete(t.Programs).where(eq(t.Programs.id, programId)).returning();
}

// Delete a user program preference by ID
export async function deleteUserProgramPreference(userProgramPreferenceId) {
	return await db.delete(t.User_Program_Preferences).where(eq(t.User_Program_Preferences.id, userProgramPreferenceId)).returning();
}

// Delete an application by ID
export async function deleteApplication(applicationId) {
	return await db.delete(t.Applications).where(eq(t.Applications.id, applicationId)).returning();
}
