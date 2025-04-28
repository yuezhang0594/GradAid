import Page from './page';

/**
 * Documents page object containing specific selectors and methods for the documents page
 */
class DocumentsPage extends Page {
    /**
     * Define selectors using getter methods
     */
    public get pageTitle() { return $('h1'); }
    public get documentCards() { return $$('.grid.gap-4 .clickable-card'); }
    public get documentProgressBars() { return $$('.progress'); }
    public get documentStatuses() { return $$('.badge'); }
    public get editButtons() { return $$('button*=Edit'); }
    public get backButton() { return $('button*=Back'); }

    /**
     * Methods for documents page interactions
     */
    public async open(): Promise<string> {
        return super.open('/documents');
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

    /**
     * Click on edit button for a document
     * @param index Index of the edit button (0-based)
     */
    public async clickEditButton(index: number): Promise<void> {
        const buttons = await this.editButtons;
        if (index >= buttons.length) {
            throw new Error(`Edit button at index ${index} does not exist`);
        }
        await buttons[index].click();
    }

    /**
     * Get document title for a specific document
     * @param index Index of the document card (0-based)
     */
    public async getDocumentTitle(index: number): Promise<string> {
        const cards = await this.documentCards;
        if (index >= cards.length) {
            throw new Error(`Document card at index ${index} does not exist`);
        }
        const title = await cards[index].$('.text-sm');
        return title.getText();
    }
}

export default new DocumentsPage();
