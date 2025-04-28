// WebdriverIO global types
declare namespace WebdriverIO {
    interface Browser {
        url(path: string): Promise<void>;
        getUrl(): Promise<string>;
        getTitle(): Promise<string>;
        pause(ms: number): Promise<void>;
        saveScreenshot(path: string): Promise<Buffer>;
    }
    
    interface Element {
        parentElement(): Promise<Element>;
        waitForExist(options?: { timeout?: number, reverse?: boolean, timeoutMsg?: string, interval?: number }): Promise<boolean>;
        isExisting(): Promise<boolean>;
        getText(): Promise<string>;
        click(): Promise<void>;
        $$(selector: string): Promise<Element[]>;
        $(selector: string): Promise<Element>;
    }
}

// Declare global variables used by WebdriverIO
declare const browser: WebdriverIO.Browser;
declare function $(selector: string): WebdriverIO.Element;
declare function $$<T extends WebdriverIO.Element>(selector: string): Promise<T[]>;

// Declare Mocha hooks
declare function before(fn: () => void | Promise<void>): void;
declare function beforeEach(fn: () => void | Promise<void>): void;
declare function after(fn: () => void | Promise<void>): void;
declare function afterEach(fn: () => void | Promise<void>): void;
declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: () => void | Promise<void>): void;

// Declare expect for WebdriverIO assertions
declare namespace Chai {
    interface Assertion {
        toContain(expected: string): void;
        toBe(expected: any): void;
        toBeGreaterThan(expected: number): void;
    }
}

declare function expect<T>(actual: T): Chai.Assertion;
