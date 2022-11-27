/**
 * Utility methods shared across backend and frontend.
 */
import { validate, v4 as uuidv4 } from "uuid";
import { ADJECTIVES, SUBJECTS } from "../constants/titledata";

export class IllegalArgumentError extends Error {
	constructor(message: string) {
		super(message);
		this.name = this.constructor.name;
	}
}

export class NotYetImplementedError extends Error {
	constructor(message: string) {
		super(message);
		this.name = this.constructor.name;
	}
}

export class NoSuchUserError extends Error {
	constructor(userID: number) {
		super("No such user with id: '" + userID + "'.");
		this.name = this.constructor.name;
	}
}

export class NoSuchFilterError extends Error {
	constructor(filterID: number) {
		super("No such filter with id: '" + filterID + "'.");
		this.name = this.constructor.name;
	}
}

/** Returns a promise that resolves once the timeout is completed. */
export async function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Gets a matching value for any key from a map with a default if the value is
 * undefined.
 */
export function mapGetWithDefault<T>(
	map: Map<string, T>,
	key: string,
	defaultValue: any
): T {
	let value = map.get(key);
	if (value) {
		return value;
	} else {
		return defaultValue;
	}
}

export function getEnvWithDefault<T>(key: string, defaultValue: T): string | T {
	let value = process.env[key];
	if (value) {
		return value;
	} else {
		return defaultValue;
	}
}

/** Checks whether the given user code is valid. */
export function isValidUserCode(userCode: string): boolean {
	const allowedCharsPattern = new RegExp(/^[a-z0-9-]*$/);
	return allowedCharsPattern.test(userCode) && validate(userCode);
}

/** Generates a random user code. */
export function generateRandomUserCode(): string {
	return uuidv4();
}

/** Checks whether a given nickname is valid. */
export function isValidNickname(nickname: string): boolean {
	// TODO: Implement nickname sanitization checks here.
	return true;
}

/**
 * Gets a random title (adjective + subject) generated from the list of
 * possible in-game titles.
 */
export function getRandomTitle(): string {
	let subject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
	let adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];

	return adjective + " " + subject;
}

/**
 * Attempts to fetch the given URL, retrying on failure. Returns when the return code
 * is one of the allowed codes, or if attempts are exhausted.
 * @param url 
 * @param attempts 
 * @param allowedCodes 
 */
export async function fetchWithAttempts(url: string, attempts=3, allowedCodes: number[] = [200]): Promise<Response|undefined> {
  let result;
  for (let i = 0; i < attempts; i++) {
    try {
      result = await fetch(url);
      if (allowedCodes.includes(result.status)) {
        return result;
      }
    } catch (e) {
      // do nothing
    }
  }
  return result;
}
