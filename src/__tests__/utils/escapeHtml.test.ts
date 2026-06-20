import { describe, it, expect } from 'vitest';
import { escapeHtml } from '@/lib/utils';

describe('escapeHtml', () => {
  it('should return an empty string for null or undefined input', () => {
    // @ts-expect-error testing invalid input
    expect(escapeHtml(null)).toBe('');
    // @ts-expect-error testing invalid input
    expect(escapeHtml(undefined)).toBe('');
  });

  it('should return an empty string for empty string input', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('should return the same string if there are no special characters', () => {
    expect(escapeHtml('Hello World!')).toBe('Hello World!');
    expect(escapeHtml('12345')).toBe('12345');
  });

  it('should escape & (ampersand)', () => {
    expect(escapeHtml('Me & You')).toBe('Me &amp; You');
  });

  it('should escape < (less than)', () => {
    expect(escapeHtml('1 < 2')).toBe('1 &lt; 2');
  });

  it('should escape > (greater than)', () => {
    expect(escapeHtml('2 > 1')).toBe('2 &gt; 1');
  });

  it('should escape " (double quote)', () => {
    expect(escapeHtml('She said "Hello"')).toBe('She said &quot;Hello&quot;');
  });

  it('should escape \' (single quote)', () => {
    expect(escapeHtml("It's a beautiful day")).toBe('It&#039;s a beautiful day');
  });

  it('should escape multiple special characters in the same string', () => {
    expect(escapeHtml('<script>alert("XSS") & \'Hack\'</script>')).toBe(
      '&lt;script&gt;alert(&quot;XSS&quot;) &amp; &#039;Hack&#039;&lt;/script&gt;'
    );
  });
});
