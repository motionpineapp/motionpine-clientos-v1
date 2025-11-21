// Password hashing and verification utilities using Web Crypto API
const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16; // 128 bits
const HASH_ALGORITHM = 'SHA-256';
 // Utility to convert ArrayBuffer or Uint8Array to hex string
function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
 // Utility to convert hex string to Uint8Array (ArrayBufferView)
function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}
/**
 * Hashes a password with a random salt.
 * @param password The password to hash.
 * @returns A string containing the salt and hash, separated by a dot.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: HASH_ALGORITHM,
    },
    key,
    256 // 256 bits
  );
  const hash = bufferToHex(hashBuffer);
  const saltHex = bufferToHex(salt);
  return `${saltHex}.${hash}`;
}
/**
 * Verifies a password against a stored hash.
 * @param password The password to verify.
 * @param storedHash The stored hash (including salt).
 * @returns True if the password is correct, false otherwise.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split('.');
  if (!saltHex || !hashHex) {
    return false;
  }
  const salt = hexToBuffer(saltHex);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: HASH_ALGORITHM,
    },
    key,
    256
  );
  const newHash = bufferToHex(hashBuffer);
  return newHash === hashHex;
}