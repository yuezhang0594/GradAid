import { describe, test, expect, vi } from "vitest";
import authConfig from "../auth.config";
const configWithoutEnv = require("../auth.config.ts").default;

describe("Auth Configuration", () => {
    test("should export a configuration object", () => {
        expect(authConfig).toBeTypeOf("object");
        expect(authConfig).not.toBeNull();
    });

    test("should have providers array", () => {
        expect(Array.isArray(authConfig.providers)).toBe(true);
    });

    test("should have exactly one provider", () => {
        expect(authConfig.providers.length).toBe(1);
    });

    test("provider should have correct structure", () => {
        const provider = authConfig.providers[0];
        expect(provider).toHaveProperty("domain");
        expect(provider).toHaveProperty("applicationID");
    });

    test("provider applicationID should be 'convex'", () => {
        expect(authConfig.providers[0].applicationID).toBe("convex");
    });
    
    test("should handle undefined environment variables gracefully", () => {
        const originalDomain = process.env.CLERK_JWT_ISSUER_DOMAIN;
        
        try {
            delete process.env.CLERK_JWT_ISSUER_DOMAIN;
            vi.resetModules();
            
            expect(configWithoutEnv.providers[0].domain).toBeUndefined();
        } finally {
            if (originalDomain !== undefined) {
                process.env.CLERK_JWT_ISSUER_DOMAIN = originalDomain;
            }
            vi.resetModules();
        }
    });
    
    test("config should not have unexpected properties", () => {
        const configKeys = Object.keys(authConfig);
        expect(configKeys).toHaveLength(1);
        expect(configKeys).toContain("providers");
    });
});