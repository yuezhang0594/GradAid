import dashboardPage from '../pageObjects/dashboard.page';

describe('Dashboard Page', () => {
    before(async () => {
        // Navigate to the dashboard page
        await dashboardPage.open();
        // Wait for page to load
        await browser.pause(2000);
    });

    it('should display application stats cards', async () => {
        // Check that we have 4 application stats cards
        const cards = await dashboardPage.applicationStatsCards;
        expect(cards.length).toBe(4);
    });

    it('should display active applications count', async () => {
        // Based on your mock data, you should have 5 applications
        const count = await dashboardPage.getActiveApplicationsCount();
        expect(count).toContain('5');
    });

    it('should display next deadline information', async () => {
        // Based on your mock data, Stanford deadline is May 15, 2025
        const deadline = await dashboardPage.getNextDeadline();
        expect(deadline).toContain('Stanford');
    });

    it('should display AI credits information', async () => {
        // Based on your mock data, you have used 250 out of 500 credits
        const credits = await dashboardPage.getAiCreditsUsed();
        expect(credits).toContain('250');
    });

    it('should display document cards', async () => {
        // Wait for document cards to load
        await browser.pause(1000);
        
        // Check that we have document cards
        const cards = await dashboardPage.documentCards;
        expect(cards.length).toBeGreaterThan(0);
    });

    it('should display document progress correctly', async () => {
        // Check progress of the first document (if available)
        const cards = await dashboardPage.documentCards;
        if (cards.length > 0) {
            const progress = await dashboardPage.getDocumentProgress(0);
            // We expect some percentage value
            expect(progress).toContain('%');
        }
    });

    it('should navigate to documents page when clicking View All', async () => {
        // Navigate back to dashboard first (in case previous test navigated away)
        await dashboardPage.open();
        await browser.pause(1000);
        
        // Click on View All button
        await dashboardPage.navigateToDocuments();
        
        // Verify URL contains /documents
        const url = await browser.getUrl();
        expect(url).toContain('/documents');
    });
});
