/**
 * Content verification tests for GradAid
 * Tests that the expected content is displayed on each page
 */
describe('GradAid Content Verification', () => {
    it('should verify dashboard content', async () => {
        await browser.url('/dashboard');
        await browser.pause(2000);
        
        // Look for elements that might contain application stats
        const pageContent = await $('body').getText();
        
        // Verify application stats are present (based on mock data)
        expect(pageContent).toContain('Applications');
        
        // Take a screenshot for verification
        await browser.saveScreenshot('./e2e-dashboard-content.png');
    });

    it('should verify applications content', async () => {
        await browser.url('/applications');
        await browser.pause(2000);
        
        // Look for elements that might contain application information
        const pageContent = await $('body').getText();
        
        // Verify some universities are present (based on mock data)
        const hasUniversities = pageContent.includes('Stanford') || 
                               pageContent.includes('MIT') || 
                               pageContent.includes('Berkeley') ||
                               pageContent.includes('CMU') ||
                               pageContent.includes('Georgia Tech');
        
        expect(hasUniversities).toBe(true);
        
        // Take a screenshot for verification
        await browser.saveScreenshot('./e2e-applications-content.png');
    });

    it('should verify documents content', async () => {
        await browser.url('/documents');
        await browser.pause(2000);
        
        // Look for elements that might contain document information
        const pageContent = await $('body').getText();
        
        // Verify some document types are present (based on mock data)
        const hasDocuments = pageContent.includes('Statement of Purpose') || 
                            pageContent.includes('Research Statement') || 
                            pageContent.includes('CV');
        
        expect(hasDocuments).toBe(true);
        
        // Take a screenshot for verification
        await browser.saveScreenshot('./e2e-documents-content.png');
    });

    it('should verify credits content', async () => {
        await browser.url('/credits');
        await browser.pause(2000);
        
        // Look for elements that might contain credit information
        const pageContent = await $('body').getText();
        
        // Verify credit information is present
        expect(pageContent).toContain('Credits');
        
        // Take a screenshot for verification
        await browser.saveScreenshot('./e2e-credits-content.png');
    });

    it('should verify activity content', async () => {
        await browser.url('/activity');
        await browser.pause(2000);
        
        // Look for elements that might contain activity information
        const pageContent = await $('body').getText();
        
        // Verify activity information is present
        expect(pageContent).toContain('Activity');
        
        // Take a screenshot for verification
        await browser.saveScreenshot('./e2e-activity-content.png');
    });

    it('should verify timeline content', async () => {
        await browser.url('/timeline');
        await browser.pause(2000);
        
        // Look for elements that might contain timeline information
        const pageContent = await $('body').getText();
        
        // Verify timeline information is present
        expect(pageContent).toContain('Timeline');
        
        // Take a screenshot for verification
        await browser.saveScreenshot('./e2e-timeline-content.png');
    });
});
