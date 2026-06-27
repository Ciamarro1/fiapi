const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Encodes a Uint8Array to base64 string in a chunked/safe manner
 * to avoid stack overflow for large arrays.
 * @param {Uint8Array} bytes 
 * @returns {string}
 */
export function encodeBase64(bytes) {
  const len = bytes.length;
  let result = '';
  const chunkLimit = 30000; // Must be a multiple of 3
  
  for (let offset = 0; offset < len; offset += chunkLimit) {
    const end = Math.min(offset + chunkLimit, len);
    let chunkStr = '';
    let i;
    for (i = offset + 2; i < end; i += 3) {
      chunkStr += chars[bytes[i - 2] >> 2];
      chunkStr += chars[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
      chunkStr += chars[((bytes[i - 1] & 0x0f) << 2) | (bytes[i] >> 6)];
      chunkStr += chars[bytes[i] & 0x3f];
    }
    
    if (end === len) {
      if (i === len + 1) {
        chunkStr += chars[bytes[i - 2] >> 2];
        chunkStr += chars[(bytes[i - 2] & 0x03) << 4];
        chunkStr += '==';
      } else if (i === len) {
        chunkStr += chars[bytes[i - 2] >> 2];
        chunkStr += chars[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
        chunkStr += chars[(bytes[i - 1] & 0x0f) << 2];
        chunkStr += '=';
      }
    }
    result += chunkStr;
  }
  return result;
}
