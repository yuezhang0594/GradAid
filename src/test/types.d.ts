import '@testing-library/jest-dom';

declare global {
  namespace Vi {
    interface Assertion {
      toBeInTheDocument(): void;
      toHaveValue(value: string): void;
      toBeDisabled(): void;
      toBeEnabled(): void;
      toBeChecked(): void;
      toBeVisible(): void;
      toHaveClass(className: string): void;
      toHaveAttribute(attr: string, value?: string): void;
      toHaveTextContent(text: string | RegExp): void;
    }
  }
}
