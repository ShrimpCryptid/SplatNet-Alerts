// https://dev.to/mathewthe2/intro-to-nintendo-switch-rest-api-2cm7
// Code comments added by me for my own understanding.

// ===========
// PART 1: Getting the Session Token
// ===========

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

/** Generates a login URL for Nintendo Switch Online, with unique authentication parameters.*/
function getNSOLogin() {
    authParams = generateAuthenticationParams();
    // Parameters for the login URL
    const params = {
      state: authParams.state,
      // unusual link protocol
      redirect_uri: 'npf71b963c1b7b6d119://auth&client_id=71b963c1b7b6d119',
      scope: 'openid%20user%20user.birthday%20user.mii%20user.screenName',
      response_type: 'session_token_code',
      session_token_code_challenge: authParams.codeChallenge,
      session_token_code_challenge_method: 'S256',
      theme: 'login_form'
    };
    const arrayParams = [];
    for (var key in params) {
      if (!params.hasOwnProperty(key)) continue;
      arrayParams.push(`${key}=${params[key]}`);
    }
    // Generate URL using parameters
    const stringParams = arrayParams.join('&');
    return `https://accounts.nintendo.com/connect/1.0.0/authorize?${stringParams}`;
}


console.log(generateAuthenticationParams());

// Generates a URL for the NSO login page, prompting us to connect our account to the app.
// We can use the link address to find our token code!
const loginURL = getNSOLogin();
console.log("Go to the following website:")
console.log(loginURL);

console.log("[] Right click the 'Select this Account' button and copy the link address, then paste it here:")
let redirectURL = prompt("npf71b963c1b7b6d119://...")

// Copy the parameters from the URL, including the session token code and state.
const params = {};
redirectURL.split('#')[1]
        .split('&')
        .forEach(str => {
          const splitStr = str.split('=');
          params[splitStr[0]] = splitStr[1];
        });
// the sessionTokenCode is params.session_token_code

console.log(params)

const request2 = require('request-promise-native');
const jar = request2.jar();
const request = request2.defaults({ jar: jar });

// TODO: Get this programmatically (see https://github.com/frozenpandaman/splatnet2statink/blob/master/iksm.py#L27)
const userAgentVersion = `2.3.0`; // version of Nintendo Switch App, updated once or twice per year

/** Gets a Session Token using a provided session token code and code verifier (hashed key) */
async function getSessionToken(session_token_code, codeVerifier) {
    // sends a POST request with the token code and code verifier as parameters.
    const resp = await request({
        method: 'POST',
        uri: 'https://accounts.nintendo.com/connect/1.0.0/api/session_token',
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Platform': 'Android',
        'X-ProductVersion': userAgentVersion,
        'User-Agent': `OnlineLounge/${userAgentVersion} NASDKAPI Android`
        },
        form: {
        client_id: '71b963c1b7b6d119', // seems to be shared across 
        session_token_code: session_token_code,
        session_token_code_verifier: codeVerifier
        },
        json: true
    });

  return resp.session_token;
}

// ===========
// PART 2: Getting the Web Service Token
// ===========
