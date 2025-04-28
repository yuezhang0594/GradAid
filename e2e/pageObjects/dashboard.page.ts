import Page from './page';

/**
 * Dashboard page object containing specific selectors and methods for the dashboard page
 */
class DashboardPage extends Page {
    /**
     * Define selectors using getter methods
     */
    // Application Stats Cards
    public get applicationStatsCards() { return $$('.grid.gap-6 .clickable-card'); }
    public get activeApplicationsCard() { return $('.grid.gap-6 .clickable-card:first-child'); }
    public get nextDeadlineCard() { return $('.grid.gap-6 .clickable-card:nth-child(2)'); }
    public get recentActivityCard() { return $('.grid.gap-6 .clickable-card:nth-child(3)'); }
    public get aiCreditsCard() { return $('.grid.gap-6 .clickable-card:nth-child(4)'); }
    
    // Document Progress Section
    public get documentProgressHeading() { return $('h2'); }
    public get documentCards() { return $$('.grid.gap-4 .clickable-card'); }
    public get showMoreDocumentsButton() { return $('button=Show More'); }
    
    // Application Timeline
    public get applicationTimelineHeading() { return $('h2~h2'); }
    public get timelineItems() { return $$('.timeline-item'); }
    public get viewAllButton() { return $('button=View all'); }

    /**
     * Methods for dashboard page interactions
     */
    public async open(): Promise<void> {
        return super.open('/dashboard');
    }

    /**
     * Get application count from dashboard
     */
    public async getActiveApplicationsCount(): Promise<string> {
        const card = await this.activeApplicationsCard;
        const valueElement = await card.$('.text-xl.font-bold');
        return valueElement.getText();
    }

    /**
     * Get next deadline information
     */
    public async getNextDeadline(): Promise<string> {
        const card = await this.nextDeadlineCard;
        const valueElement = await card.$('.text-xl.font-bold');
        return valueElement.getText();
    }

    /**
     * Get AI credits information
     */
    public async getAiCreditsUsed(): Promise<string> {
        const card = await this.aiCreditsCard;
        const valueElement = await card.$('.text-xl.font-bold');
        return valueElement.getText();
    }

    /**
     * Get document progress for a specific document
     * @param index Index of the document card (0-based)
     */
    public async getDocumentProgress(index: number): Promise<string> {
        const cards = await this.documentCards;
        if (index >= cards.length) {
            throw new Error(`Document card at index ${index} does not exist`);
        }
        const progressText = await cards[index].$('.flex.justify-between span:last-child');
        return progressText.getText();
    }

    /**
     * Get document status for a specific document
     * @param index Index of the document card (0-based)
     */
    public async getDocumentStatus(index: number): Promise<string> {
        const cards = await this.documentCards;
        if (index >= cards.length) {
            throw new Error(`Document card at index ${index} does not exist`);
        }
        const badge = await cards[index].$('.badge');
        return badge.getText();
    }

    /**
     * Navigate to applications page from dashboard
     */
    public async navigateToApplications(): Promise<void> {
        const applicationsLink = await $('a[href="/applications"]');
        await applicationsLink.click();
    }

    /**
     * Navigate to documents page from dashboard
     */
    public async navigateToDocuments(): Promise<void> {
        const viewAllButton = await this.viewAllButton;
        await viewAllButton.click();
    }

    /**
     * Click on a document card
     * @param index Index of the document card (0-based)
     */
    public async clickDocumentCard(index: number): Promise<void> {
        const cards = await this.documentCards;
        if (index >= cards.length) {
            throw new Error(`Document card at index ${index} does not exist`);
        }
        await cards[index].click();
    }
}

export default new DashboardPage();
