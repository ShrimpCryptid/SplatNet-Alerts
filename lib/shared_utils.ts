/**
 * Utility methods shared across backend and frontend.
 */
import { toast } from "react-toastify";
import { validate, v4 as uuidv4 } from "uuid";
import { API_NICKNAME_ALLOWED_CHARS, API_NICKNAME_MAX_LENGTH, FE_ERROR_404_MSG, FE_ERROR_500_MSG, FE_UNKNOWN_MSG } from "../constants";
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

/** Checks whether the given user code is valid. User codes must be in
 * lowercase with hex characters (0-9, a-f), in the format xxxx-xxxx-xxxx.
 */
export function isValidUserCode(userCode: string): boolean {
	const allowedCharsPattern = new RegExp(/^[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}$/);
	return allowedCharsPattern.test(userCode);
}

/** Generates a random user code. */
export function generateRandomUserCode(): string {
	let uuid = uuidv4();
  // Trim the uuid to a set length and add an additional dash character.
  let trimmedUUID = uuid.substring(0, 4) + "-" + uuid.substring(4, 13);
  return trimmedUUID;
}

/** Checks whether a given nickname is valid. */
export function isValidNickname(nickname: string): boolean {
	return (
		API_NICKNAME_ALLOWED_CHARS.test(nickname) &&
		nickname.length > 0 &&
		nickname.length <= API_NICKNAME_MAX_LENGTH
	);
}

/**
 * Removes all disallowed characters from a nickname.
 * @param nickname
 */
export function sanitizeNickname(nickname: string): string {
  let retString = "";
  for (let i = 0; i < nickname.length; i++) {
    let char = nickname.charAt(i);
    if (API_NICKNAME_ALLOWED_CHARS.test(char)) {
      retString += char;
    }
  }
  if (retString.length > API_NICKNAME_MAX_LENGTH) {
    retString = retString.substring(0, API_NICKNAME_MAX_LENGTH);
  }
  return retString;
}

/**
 * Gets a random title (adjective + subject) generated from the list of
 * possible in-game titles. Title will be a valid nickname, tested using
 * {@link isValidNickname}.
 */
export function getRandomTitle(): string {
	let title = "";
	do {
		let subject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
		let adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
		title = adjective + " " + subject;
	} while (!isValidNickname(title));
	return title;
}

/**
 * Attempts to fetch the given URL, retrying on failure. Returns when the return code
 * is one of the allowed codes, or if attempts are exhausted. Handles encoding
 * of URI sequences.
 * @param url
 * @param attempts
 * @param allowedCodes
 */
export async function fetchWithAttempts(
	url: string,
	attempts = 3,
	allowedCodes: number[] = [200]
): Promise<Response | undefined> {
	let result;
	for (let i = 0; i < attempts; i++) {
		try {
			result = await fetch(encodeURI(url));
			if (allowedCodes.includes(result.status)) {
				return result;
			}
		} catch (e) {
			// do nothing
		}
	}
	return result;
}

// TODO: Move to a frontend utilities file?
export function printStandardErrorMessage(response: Response | undefined) {
  if (!response) {
    toast.error(FE_UNKNOWN_MSG);
    return;
  }
  switch (response.status) {
    case 404:
      toast.error(FE_ERROR_404_MSG);
      break;
    case 500:
      toast.error(FE_ERROR_500_MSG);
      break;
    default:
      toast.error(FE_UNKNOWN_MSG + " (error " + response.status + ")");

  }
}
