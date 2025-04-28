/**
 * Authentication tests for GradAid
 * Tests the authentication flow
 */
describe('GradAid Authentication', () => {
    beforeEach(async () => {
        // Navigate to the base URL before each test
        await browser.url('/');
        await browser.pause(2000);
    });

    it('should show authentication screen when accessing protected routes', async () => {
        // Navigate to a protected route
        await browser.url('/dashboard');
        await browser.pause(2000);
        
        // Take a screenshot of the auth screen
        await browser.saveScreenshot('./e2e-auth-screen.png');
        
        // Check if we're on the authentication page
        const pageContent = await $('body').getText();
        expect(pageContent).toContain('Continue to GradAid');
        
        // Check for authentication elements
        const emailInput = await $('input[type="email"]');
        expect(await emailInput.isExisting()).toBe(true);
        
        const continueButton = await $('button=Continue');
        expect(await continueButton.isExisting()).toBe(true);
    });

    it('should display Clerk authentication UI', async () => {
        // Navigate to a protected route
        await browser.url('/dashboard');
        await browser.pause(2000);
        
        // Check for Clerk branding
        const clerkBranding = await $('*=Secured by');
        expect(await clerkBranding.isExisting()).toBe(true);
        
        // Check for development mode indication
        const devMode = await $('*=Development mode');
        expect(await devMode.isExisting()).toBe(true);
    });
});
