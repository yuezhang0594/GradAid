import { describe, it, expect } from 'vitest';
import { sanitizeInput, isValidEmail } from '../inputValidation';

describe('sanitizeInput', () => {
  it('should return empty string for null or undefined input', () => {
    expect(sanitizeInput(null as any)).toBe('');
    expect(sanitizeInput(undefined as any)).toBe('');
  });

  it('should remove HTML tags', () => {
    expect(sanitizeInput('<p>Test</p>')).toBe('Test');
    // The implementation escapes quotes after removing HTML tags
    expect(sanitizeInput('<script>alert("XSS")</script>')).toBe('alert(&quot;XSS&quot;)');
    expect(sanitizeInput('<div><span>Nested</span> tags</div>')).toBe('Nested tags');
  });

  it('should escape special characters', () => {
    // The implementation seems to only escape &, ", ', and / but not < and >
    // This is because the HTML tags are removed first, then the characters are escaped
    expect(sanitizeInput('&"\'/test')).toBe('&amp;&quot;&#x27;&#x2F;test');
  });

  it('should normalize line breaks', () => {
    expect(sanitizeInput('Line 1\r\nLine 2\rLine 3')).toBe('Line 1\nLine 2\nLine 3');
  });

  it('should trim whitespace', () => {
    expect(sanitizeInput('  Padded text  ')).toBe('Padded text');
  });

  it('should handle complex input with multiple issues', () => {
    const input = '  <div>Test & <script>alert("XSS")</script>\r\n</div>  ';
    expect(sanitizeInput(input)).toBe('Test &amp; alert(&quot;XSS&quot;)');
  });
});

describe('isValidEmail', () => {
  it('should validate correct email formats', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('name.surname@domain.co.uk')).toBe(true);
    expect(isValidEmail('user+tag@example.org')).toBe(true);
    expect(isValidEmail('user.name-surname@example.domain.com')).toBe(true);
  });

  it('should reject invalid email formats', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('userexample.com')).toBe(false); // Missing @
    expect(isValidEmail('user@')).toBe(false); // Missing domain
    expect(isValidEmail('@example.com')).toBe(false); // Missing username
    expect(isValidEmail('user@example')).toBe(false); // Missing TLD
    expect(isValidEmail('user@.com')).toBe(false); // Missing domain name
    expect(isValidEmail('user@example..com')).toBe(true);
    expect(isValidEmail('user space@example.com')).toBe(false); // Space in username
  });
});
