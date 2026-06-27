import { describe, it, expect } from 'vitest';
import { encodeBase64 } from '../../src/utils/base64.js';

describe('Base64 Encoder', () => {
  it('should encode empty Uint8Array', () => {
    const bytes = new Uint8Array([]);
    expect(encodeBase64(bytes)).toBe('');
  });

  it('should encode standard strings correctly', () => {
    // "hello" -> aGVsbG8=
    const bytes = new Uint8Array([104, 101, 108, 108, 111]);
    expect(encodeBase64(bytes)).toBe('aGVsbG8=');
  });

  it('should handle padding correctly (1 byte remainder)', () => {
    // "a" -> YQ==
    const bytes = new Uint8Array([97]);
    expect(encodeBase64(bytes)).toBe('YQ==');
  });

  it('should handle padding correctly (2 bytes remainder)', () => {
    // "ab" -> YWI=
    const bytes = new Uint8Array([97, 98]);
    expect(encodeBase64(bytes)).toBe('YWI=');
  });

  it('should handle large arrays without stack overflow', () => {
    const size = 100000;
    const bytes = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      bytes[i] = i % 256;
    }
    const encoded = encodeBase64(bytes);
    expect(encoded).toBeDefined();
    expect(encoded.length).toBeGreaterThan(0);
    const expected = Buffer.from(bytes).toString('base64');
    expect(encoded).toBe(expected);
  });
});
