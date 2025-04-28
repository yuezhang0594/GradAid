# GradAid End-to-End Testing with WebdriverIO

This directory contains end-to-end tests for the GradAid application using WebdriverIO.

## Structure

- `pageObjects/`: Contains page object classes that encapsulate page-specific selectors and methods
- `specs/`: Contains test specifications organized by feature
- `wdio.d.ts`: TypeScript definitions for WebdriverIO
- `wdio.conf.ts`: WebdriverIO configuration file

## Running Tests

To run the end-to-end tests, make sure your application is running locally, then use one of the following commands:

```bash
# Run tests in a visible browser
npm run test:e2e

# Run tests in headless mode (without visible browser)
npm run test:e2e:headless
```

## Page Objects

Page objects help organize test code by encapsulating page-specific selectors and actions. We have created the following page objects:

- `page.ts`: Base page object with common methods
- `dashboard.page.ts`: Dashboard page specific selectors and methods
- `applications.page.ts`: Applications page specific selectors and methods
- `documents.page.ts`: Documents page specific selectors and methods

## Test Specifications

Tests are organized by feature and follow this pattern:

- `dashboard.spec.ts`: Tests for the dashboard page
- `applications.spec.ts`: Tests for the applications page
- `documents.spec.ts`: Tests for the documents page

## Writing New Tests

To write a new test:

1. Create a new page object in `pageObjects/` if needed
2. Create a new test specification in `specs/`
3. Use the page objects to interact with the application
4. Write assertions to verify the expected behavior

Example:

```typescript
import dashboardPage from '../pageObjects/dashboard.page';

describe('New Feature', () => {
  before(async () => {
    await dashboardPage.open();
  });

  it('should display the correct data', async () => {
    await dashboardPage.waitForDisplayed('[data-testid="feature-element"]');
    const text = await $('[data-testid="feature-element"]').getText();
    expect(text).toContain('Expected Text');
  });
});
```

## Best Practices

1. Use data-testid attributes in your components for stable selectors
2. Keep tests independent of each other
3. Use page objects to encapsulate page-specific logic
4. Write descriptive test names that explain what is being tested
5. Keep tests focused on user behavior, not implementation details
