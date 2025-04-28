/**
 * Basic structure tests for GradAid
 * Tests the basic structure and navigation of the application
 */
describe('GradAid Basic Structure', () => {
    beforeEach(async () => {
        // Navigate to the base URL before each test
        await browser.url('/');
        await browser.pause(2000);
    });

    it('should have the correct title', async () => {
        const title = await browser.getTitle();
        expect(title).toContain('GradAid');
    });

    it('should redirect to authentication when accessing protected routes', async () => {
        // List of protected routes
        const routes = [
            '/dashboard',
            '/applications',
            '/documents',
            '/credits',
            '/activity',
            '/timeline'
        ];
        
        // Check each route
        for (const route of routes) {
            await browser.url(route);
            await browser.pause(2000);
            
            // Check if we're on the authentication page
            const pageContent = await $('body').getText();
            const isAuthPage = pageContent.includes('Continue to GradAid') || 
                              pageContent.includes('Secured by') ||
                              pageContent.includes('Development mode');
            
            expect(isAuthPage).toBe(true);
        }
    });

    it('should have Clerk authentication components', async () => {
        await browser.url('/dashboard');
        await browser.pause(2000);
        
        // Check for Clerk branding
        const securedByText = await $('*=Secured by');
        expect(await securedByText.isExisting()).toBe(true);
        
        // Check for development mode indication
        const devModeText = await $('*=Development mode');
        expect(await devModeText.isExisting()).toBe(true);
    });

    it('should verify the structure of the authentication page', async () => {
        await browser.url('/dashboard');
        await browser.pause(2000);
        
        // Take a screenshot for verification
        await browser.saveScreenshot('./e2e-auth-structure.png');
        
        // Check for authentication page elements
        const pageContent = await $('body').getText();
        expect(pageContent).toContain('Continue to GradAid');
    });
});
