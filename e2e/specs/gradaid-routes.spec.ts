/**
 * Route testing for GradAid
 * Tests navigation to the main routes defined in the application
 */
describe('GradAid Routes', () => {
    beforeEach(async () => {
        // Navigate to the base URL before each test
        await browser.url('/');
        await browser.pause(2000);
    });

    it('should have the correct title', async () => {
        const title = await browser.getTitle();
        expect(title).toContain('GradAid');
    });

    it('should navigate to dashboard route', async () => {
        await browser.url('/dashboard');
        await browser.pause(2000);
        
        // Take a screenshot of the dashboard
        await browser.saveScreenshot('./e2e-dashboard.png');
        
        // Check if URL contains dashboard
        const url = await browser.getUrl();
        expect(url).toContain('/dashboard');
    });

    it('should navigate to applications route', async () => {
        await browser.url('/applications');
        await browser.pause(2000);
        
        // Take a screenshot of the applications page
        await browser.saveScreenshot('./e2e-applications.png');
        
        // Check if URL contains applications
        const url = await browser.getUrl();
        expect(url).toContain('/applications');
    });

    it('should navigate to documents route', async () => {
        await browser.url('/documents');
        await browser.pause(2000);
        
        // Take a screenshot of the documents page
        await browser.saveScreenshot('./e2e-documents.png');
        
        // Check if URL contains documents
        const url = await browser.getUrl();
        expect(url).toContain('/documents');
    });

    it('should navigate to credits route', async () => {
        await browser.url('/credits');
        await browser.pause(2000);
        
        // Take a screenshot of the credits page
        await browser.saveScreenshot('./e2e-credits.png');
        
        // Check if URL contains credits
        const url = await browser.getUrl();
        expect(url).toContain('/credits');
    });

    it('should navigate to activity route', async () => {
        await browser.url('/activity');
        await browser.pause(2000);
        
        // Take a screenshot of the activity page
        await browser.saveScreenshot('./e2e-activity.png');
        
        // Check if URL contains activity
        const url = await browser.getUrl();
        expect(url).toContain('/activity');
    });

    it('should navigate to timeline route', async () => {
        await browser.url('/timeline');
        await browser.pause(2000);
        
        // Take a screenshot of the timeline page
        await browser.saveScreenshot('./e2e-timeline.png');
        
        // Check if URL contains timeline
        const url = await browser.getUrl();
        expect(url).toContain('/timeline');
    });
});
