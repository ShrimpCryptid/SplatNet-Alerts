// Utility methods shared across backend and frontend.

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
	defaultValue: T
): T {
	let value = map.get(key);
	if (value) {
		return value;
	} else {
		return defaultValue;
	}
}
