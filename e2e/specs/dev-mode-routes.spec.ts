/**
 * Development mode route testing for GradAid
 * Tests navigation to the main routes in development mode
 */
import { navigateWithAuthBypass } from '../helpers/auth.helper';

describe('GradAid Development Mode Routes', () => {
    beforeEach(async () => {
        // Navigate to the base URL before each test
        await browser.url('/');
        await browser.pause(2000);
    });

    it('should capture screenshots of all main routes for verification', async () => {
        // List of routes to test based on the application structure
        const routes = [
            '/dashboard',
            '/applications',
            '/documents',
            '/credits',
            '/activity',
            '/timeline'
        ];

        // Navigate to each route and take a screenshot
        for (const route of routes) {
            console.log(`Testing route: ${route}`);
            
            // Navigate to the route
            await browser.url(route);
            await browser.pause(3000);
            
            // Take a screenshot for manual verification
            await browser.saveScreenshot(`./e2e-${route.replace('/', '')}.png`);
            
            // Verify we're on the expected URL (even if auth screen)
            const currentUrl = await browser.getUrl();
            expect(currentUrl).toContain(route);
        }
    });

    it('should verify the title on all pages', async () => {
        // List of routes to test
        const routes = [
            '/dashboard',
            '/applications',
            '/documents',
            '/credits',
            '/activity',
            '/timeline'
        ];

        // Navigate to each route and check the title
        for (const route of routes) {
            await browser.url(route);
            await browser.pause(2000);
            
            // Check the title
            const title = await browser.getTitle();
            expect(title).toContain('GradAid');
        }
    });

    // Test for dev routes that might be accessible without authentication
    it('should test development-specific routes', async () => {
        // List of development routes from the application structure
        const devRoutes = [
            '/dev/application-detail',
            '/dev/dashboard-chat',
            '/dev/resend-dashboard',
            '/dev/document-editor'
        ];

        // Navigate to each route and take a screenshot
        for (const route of devRoutes) {
            console.log(`Testing dev route: ${route}`);
            
            // Navigate to the route
            await browser.url(route);
            await browser.pause(3000);
            
            // Take a screenshot for manual verification
            await browser.saveScreenshot(`./e2e-${route.replace(/\//g, '-')}.png`);
            
            // Verify we're on the expected URL (even if auth screen)
            const currentUrl = await browser.getUrl();
            expect(currentUrl).toContain(route);
        }
    });
});
