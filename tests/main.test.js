import { describe, it, expect } from 'vitest';
import { escapeHTML } from './main.js';

describe('Utility Functions - Security (XSS Prevention)', () => {
    it('should escape dangerous characters', () => {
        const unsafeInput = '<script>alert("XSS")</script>';
        const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;';
        expect(escapeHTML(unsafeInput)).toBe(expected);
    });

    it('should escape single quotes', () => {
        const unsafeInput = "O'Neill";
        const expected = "O&#039;Neill";
        expect(escapeHTML(unsafeInput)).toBe(expected);
    });

    it('should handle undefined or null', () => {
        expect(escapeHTML(null)).toBe('');
        expect(escapeHTML(undefined)).toBe('');
    });

    it('should pass harmless text unchanged', () => {
        const safeInput = 'Hello World';
        expect(escapeHTML(safeInput)).toBe('Hello World');
    });
});
