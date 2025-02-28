import db from "../index";
import * as t from "../schema";
import { eq } from "drizzle-orm";

// Update a user by ID
export async function updateUser(userId, user) {
	return await db.update(t.Users).set(user).where(eq(t.Users.id, userId)).returning();
}

// Update a university by ID
export async function updateUniversity(universityId, university) {
	return await db.update(t.Universities).set(university).where(eq(t.Universities.id, universityId)).returning();
}

// Update a program by ID
export async function updateProgram(programId, program) {
	return await db.update(t.Programs).set(program).where(eq(t.Programs.id, programId)).returning();
}

// Update a user program preference by ID
export async function updateUserProgramPreference(userProgramPreferenceId, userProgramPreference) {
	return await db.update(t.User_Program_Preferences).set(userProgramPreference).where(eq(t.User_Program_Preferences.id, userProgramPreferenceId)).returning();
}

// Update an application by ID
export async function updateApplication(applicationId, application) {
	return await db.update(t.Applications).set(application).where(eq(t.Applications.id, applicationId)).returning();
}
