/**
 * Navigation test for GradAid
 */
describe('GradAid Navigation', () => {
    beforeEach(async () => {
        // Navigate to the base URL before each test
        await browser.url('/');
        await browser.pause(2000);
    });

    it('should have the correct title', async () => {
        const title = await browser.getTitle();
        expect(title).toContain('GradAid');
    });

    it('should have navigation elements', async () => {
        // Look for navigation elements
        const navElements = await $$('nav a, nav button');
        expect(navElements.length).toBeGreaterThan(0);
    });

    it('should have a main content area', async () => {
        // Look for main content
        const mainContent = await $('main');
        await mainContent.waitForExist({ timeout: 5000 });
        expect(await mainContent.isExisting()).toBe(true);
    });

    it('should have clickable cards or buttons', async () => {
        // Look for clickable elements
        const clickableElements = await $$('button, .clickable-card, a');
        expect(clickableElements.length).toBeGreaterThan(0);
    });

    it('should take screenshots of key pages', async () => {
        // Take a screenshot of the home page
        await browser.saveScreenshot('./e2e-home.png');
        
        // Try to find and click a navigation element
        const navElements = await $$('nav a, nav button');
        if (navElements.length > 0) {
            // Click the first navigation element
            await navElements[0].click();
            await browser.pause(2000);
            
            // Take a screenshot of the navigated page
            await browser.saveScreenshot('./e2e-navigated.png');
        }
    });
});
