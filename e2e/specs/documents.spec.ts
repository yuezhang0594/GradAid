import documentsPage from '../pageObjects/documents.page';

describe('Documents Page', () => {
    before(async () => {
        // Navigate to the documents page
        await documentsPage.open();
        // Wait for page to load
        await browser.pause(2000);
    });

    it('should display document cards', async () => {
        // Check that we have document cards
        const cards = await documentsPage.documentCards;
        expect(cards.length).toBeGreaterThan(0);
    });

    it('should display document progress correctly', async () => {
        // Check progress of the first document (if available)
        const cards = await documentsPage.documentCards;
        if (cards.length > 0) {
            const progress = await documentsPage.getDocumentProgress(0);
            // We expect some percentage value
            expect(progress).toContain('%');
        }
    });

    it('should display document status correctly', async () => {
        // Check status of the first document (if available)
        const cards = await documentsPage.documentCards;
        if (cards.length > 0) {
            const status = await documentsPage.getDocumentStatus(0);
            // We expect some status text
            expect(status.length).toBeGreaterThan(0);
        }
    });

    it('should navigate to document editor when clicking on a document card', async () => {
        // Navigate back to documents page first (in case previous test navigated away)
        await documentsPage.open();
        await browser.pause(1000);
        
        // Click on the first document card (if available)
        const cards = await documentsPage.documentCards;
        if (cards.length > 0) {
            await documentsPage.clickDocumentCard(0);
            
            // Verify URL contains document editor path
            const url = await browser.getUrl();
            expect(url).toContain('/documents/');
        }
    });
});
