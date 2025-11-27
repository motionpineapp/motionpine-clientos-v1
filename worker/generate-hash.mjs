/**
 * Password Hash Generator for Seed Data
 * Run this script to generate a valid password hash for "password"
 * Usage: node --experimental-modules generate-hash.mjs
 */

import { webcrypto } from 'crypto';

const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const HASH_ALGORITHM = 'SHA-256';

function bufferToHex(buffer) {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

async function hashPassword(password) {
    const salt = webcrypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const key = await webcrypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
    );
    const hashBuffer = await webcrypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: PBKDF2_ITERATIONS,
            hash: HASH_ALGORITHM,
        },
        key,
        256
    );
    const hash = bufferToHex(hashBuffer);
    const saltHex = bufferToHex(salt);
    return `${saltHex}.${hash}`;
}

// Generate hash for "password"
const hash = await hashPassword('password');
console.log('\n=== Generated Password Hash ===');
console.log('Password: "password"');
console.log('Hash:', hash);
console.log('\nCopy this hash and update worker/seed.sql');
