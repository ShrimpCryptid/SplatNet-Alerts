// https://dev.to/mathewthe2/intro-to-nintendo-switch-rest-api-2cm7
// Code comments added by me for my own understanding.

// Check imports
const crypto = require('crypto')
const base64url = require('base64url')

let authParams = {};

/** Generates a random cryptographic string, in Base64 (binary-to-text encoding scheme)*/
function generateRandom(length) {
    return base64url(crypto.randomBytes(length));
}

/** Returns a S256 code challenge using the verifier for a key. */
function calculateChallenge(codeVerifier) {
    const hash = crypto.createHash('sha256'); // creates a hash object that uses sha256
    hash.update(codeVerifier); // add data to the hash
    const codeChallenge = base64url(hash.digest()); // digest returns hashed value of added data
    return codeChallenge;
}

/** 
 * @returns: a dictionary with three key/value pairs.
 * 1. state: a random base64 string, 36 bytes
 * 2. codeVerifier: a random base64 string, 32 bytes. (key)
 * 3. codeChallenge: a random code challenge, made using the codeVerifier. (hashed key)
*/
function generateAuthenticationParams() {
    const state = generateRandom(36);
    const codeVerifier = generateRandom(32);
    const codeChallenge = calculateChallenge(codeVerifier);
    return {
        state,
        codeVerifier,
        codeChallenge
    };
}

console.log(generateAuthenticationParams())
