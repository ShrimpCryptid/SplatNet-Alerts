/**
 * Utility methods shared across backend and frontend.
*/
import { validate, v4 as uuidv4 } from "uuid";


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

export function getEnvWithDefault<T>(key: string, defaultValue: T): string|T {
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