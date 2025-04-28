import Page from './page';

/**
 * Applications page object containing selectors and methods for the applications page
 */
class ApplicationsPage extends Page {
    /**
     * Define selectors using getter methods
     */
    public get applicationsTitle() { return $('h1=Applications'); }
    public get applicationsList() { return $('.applications-list'); }
    public get applicationItems() { return $$('.application-item'); }
    
    // Application details selectors
    public get stanfordApplication() { return $('.application-item=Stanford'); }
    public get mitApplication() { return $('.application-item=MIT'); }
    public get berkeleyApplication() { return $('.application-item=Berkeley'); }
    public get cmuApplication() { return $('.application-item=CMU'); }
    public get georgiatechApplication() { return $('.application-item=Georgia Tech'); }
    
    /**
     * Open applications page
     */
    public open(): Promise<void> {
        return super.open('/applications');
    }
    
    /**
     * Get applications list text
     */
    public async getApplicationsListText(): Promise<string> {
        const element = await this.applicationsList;
        return element.getText();
    }
    
    /**
     * Get number of application items
     */
    public async getApplicationCount(): Promise<number> {
        const elements = await this.applicationItems;
        return elements.length;
    }
}

export default new ApplicationsPage();
