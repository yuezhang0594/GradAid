/**
 * Authentication helper for E2E tests
 * Provides methods to handle authentication in development mode
 */

/**
 * Attempts to bypass authentication in development mode
 * Note: This is only for testing purposes and will only work in development mode
 */
export async function bypassAuthInDevMode(): Promise<boolean> {
    // Check if we're on an auth page
    const pageContent = await $('body').getText();
    const isAuthPage = pageContent.includes('Continue to GradAid') || 
                       pageContent.includes('Secured by') ||
                       pageContent.includes('Development mode');
    
    if (!isAuthPage) {
        console.log('Not on auth page, no bypass needed');
        return true;
    }
    
    console.log('On auth page, attempting to bypass auth...');
    
    try {
        // In development mode, we can try to use the development bypass if available
        // Look for development mode elements
        const devModeText = await $('*=Development mode');
        if (await devModeText.isExisting()) {
            console.log('Development mode detected');
            
            // Take a screenshot for debugging
            await browser.saveScreenshot('./e2e-auth-bypass-attempt.png');
            
            // Try to find any continue or sign-in buttons
            const continueButtons = await $$('button');
            if (continueButtons.length > 0) {
                // Click the first button that might be a continue button
                await continueButtons[0].click();
                await browser.pause(3000);
                
                // Check if we've moved past the auth page
                const newPageContent = await $('body').getText();
                const stillOnAuthPage = newPageContent.includes('Continue to GradAid') || 
                                       newPageContent.includes('Secured by');
                
                if (!stillOnAuthPage) {
                    console.log('Successfully bypassed auth');
                    return true;
                }
            }
        }
        
        console.log('Could not bypass auth automatically');
        return false;
    } catch (error) {
        console.error('Error during auth bypass:', error);
        return false;
    }
}

/**
 * Navigates to a route and attempts to bypass authentication
 * @param route The route to navigate to
 */
export async function navigateWithAuthBypass(route: string): Promise<boolean> {
    await browser.url(route);
    await browser.pause(2000);
    
    return await bypassAuthInDevMode();
}
