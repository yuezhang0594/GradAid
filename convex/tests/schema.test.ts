import { test, expect } from "vitest";
import schema from "../schema";
import { describe } from "node:test";

describe("Schema", () => {
  test("schema is defined correctly", () => {
    expect(schema).toBeDefined();
    expect(schema.tables).toBeDefined();
  });

  test("users table exists with expected structure", () => {
    expect(schema.tables.users).toBeDefined();
  });

  test("userProfiles table exists with expected structure", () => {
    expect(schema.tables.userProfiles).toBeDefined();
  });

  test("universities table exists with expected structure", () => {
    expect(schema.tables.universities).toBeDefined();
  });

  test("programs table exists with expected structure", () => {
    expect(schema.tables.programs).toBeDefined();
  });

  test("applications table exists with expected structure", () => {
    expect(schema.tables.applications).toBeDefined();
  });

  test("applicationDocuments table exists with expected structure", () => {
    expect(schema.tables.applicationDocuments).toBeDefined();
  });

  test("aiCredits table exists with expected structure", () => {
    expect(schema.tables.aiCredits).toBeDefined();
  });

  test("aiCreditUsage table exists with expected structure", () => {
    expect(schema.tables.aiCreditUsage).toBeDefined();
  });

  test("userActivity table exists with expected structure", () => {
    expect(schema.tables.userActivity).toBeDefined();
  });

  test("favorites table exists with expected structure", () => {
    expect(schema.tables.favorites).toBeDefined();
  });

  test("feedback table exists with expected structure", () => {
    expect(schema.tables.feedback).toBeDefined();
  });

  // Test overall schema composition
  test("all expected tables are present", () => {
    const expectedTables = [
      "users",
      "userProfiles",
      "universities",
      "programs",
      "applications",
      "applicationDocuments",
      "aiCredits",
      "aiCreditUsage",
      "userActivity",
      "favorites",
      "feedback",
    ];

    expectedTables.forEach((tableName) => {
      expect(schema.tables).toHaveProperty(tableName);
    });
  });
});
