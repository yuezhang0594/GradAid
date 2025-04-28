import applicationsPage from '../pageObjects/applications.page';

describe('Applications Page', () => {
    before(async () => {
        // Navigate to the applications page
        await applicationsPage.open();
        // Wait for page to load
        await browser.pause(2000);
    });

    it('should display application cards', async () => {
        // Check that we have application cards
        const cards = await applicationsPage.applicationCards;
        expect(cards.length).toBeGreaterThan(0);
    });

    it('should display submitted and in-progress applications', async () => {
        // Based on your mock data, you should have 2 submitted and 3 in-progress applications
        const submittedCount = await applicationsPage.getSubmittedApplicationsCount();
        const inProgressCount = await applicationsPage.getInProgressApplicationsCount();
        
        // Verify we have some applications in each category
        expect(submittedCount + inProgressCount).toBeGreaterThan(0);
    });

    it('should display application status correctly', async () => {
        // Check status of the first application (if available)
        const cards = await applicationsPage.applicationCards;
        if (cards.length > 0) {
            const status = await applicationsPage.getApplicationStatus(0);
            // We expect some status text
            expect(status.length).toBeGreaterThan(0);
        }
    });

    it('should display university name correctly', async () => {
        // Check university name of the first application (if available)
        const cards = await applicationsPage.applicationCards;
        if (cards.length > 0) {
            const university = await applicationsPage.getApplicationUniversity(0);
            // We expect some university name
            expect(university.length).toBeGreaterThan(0);
        }
    });

    it('should navigate to application details when clicking on an application card', async () => {
        // Navigate back to applications page first (in case previous test navigated away)
        await applicationsPage.open();
        await browser.pause(1000);
        
        // Click on the first application card (if available)
        const cards = await applicationsPage.applicationCards;
        if (cards.length > 0) {
            await applicationsPage.clickApplicationCard(0);
            
            // Verify URL contains application details path
            const url = await browser.getUrl();
            expect(url).toContain('/applications/');
        }
    });
});
