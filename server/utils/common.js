const crypto = require('crypto');

// Alphanumeric alphabet (0-9, A-Z, a-z)
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Generates a random ID of specified length using the defined alphabet.
 * Uses crypto.randomBytes for security, similar to nanoid.
 * 
 * @param {number} length - Length of the ID (default 21)
 * @returns {string} Random ID
 */
function generateId(length = 21) {
    const bytes = crypto.randomBytes(length);
    let result = '';
    for (let i = 0; i < length; i++) {
        // Use modulo to map byte to alphabet index
        // Note: Slight bias exists as 256 % 62 != 0, but acceptable for general IDs
        result += ALPHABET[bytes[i] % ALPHABET.length];
    }
    return result;
}

module.exports = { generateId };
