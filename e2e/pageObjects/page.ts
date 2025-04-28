/**
 * Base page object with common methods for all pages
 */
export default class Page {
    /**
     * Opens a sub page of the page
     * @param path path of the sub page (e.g. /dashboard)
     */
    public open(path: string): Promise<void> {
        return browser.url(`${path}`);
    }

    /**
     * Wait for an element to be displayed
     * @param selector element selector
     * @param timeout timeout in milliseconds
     */
    public async waitForDisplayed(selector: string, timeout = 10000): Promise<boolean> {
        const element = $(selector);
        return element.waitForExist({ timeout });
    }

    /**
     * Get page title
     */
    public async getTitle(): Promise<string> {
        return browser.getTitle();
    }

    /**
     * Check if element exists
     * @param selector element selector
     */
    public async isExisting(selector: string): Promise<boolean> {
        const element = $(selector);
        return element.isExisting();
    }
}
