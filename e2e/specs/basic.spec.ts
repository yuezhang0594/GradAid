/**
 * Basic navigation test for GradAid
 */
describe('GradAid Basic Navigation', () => {
    it('should load the application', async () => {
        // Navigate to the base URL
        await browser.url('/');
        
        // Wait for page to load
        await browser.pause(3000);
        
        // Get the title
        const title = await browser.getTitle();
        
        // Log the title for debugging
        console.log('Page title:', title);
        
        // Verify we're on a page (any page)
        const body = await $('body');
        await body.waitForExist({ timeout: 5000 });
        
        // Take a screenshot for debugging
        await browser.saveScreenshot('./e2e-screenshot.png');
    });
});
