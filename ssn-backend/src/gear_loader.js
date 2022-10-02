// Utilities for getting the current gear rotation.
import fetch from 'node-fetch';

const VERSION = '1.0.0'

/**
 * Gets the most recent shop gear data from splatoon3.ink (https://github.com/misenhower/splatoon3.ink)
 * @returns JSON 
 */
async function requestGearJSON() {
    const response = await fetch('https://splatoon3.ink/data/gear.json', {
        method: "GET",
        headers: {'User-Agent': `Splatnet Shop Alerts Prototype/${VERSION} https://twitter.com/ShrimpCryptid`}
    });
    const data = await response.json();
    return data;
}

async function getGearJSON() {
    
}
