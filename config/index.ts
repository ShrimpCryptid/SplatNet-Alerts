/**
 * To set up your dev environment, please follow the steps in the contributing
 * README and fill in the appropriate default values in this config file.
 * 
 * This file is added to the .gitignore, so any changes will not be
 * automatically logged by git. Please do not include any personal passwords
 * when making a PR.
 */

function getEnvWithDefault(key: string, defaultValue: string, printWarning: boolean = true): string {
  let value = process.env[key];
  if (value !== undefined) {
    return value;
  } else {
    if (printWarning) {
      console.log(`Using default value for environment variable '${key}' (${defaultValue}).`);
    }
    return defaultValue;
  }
}

// -----------------------------------------------------------------------------
// Configuration for the database.
// If using a local database for testing (e.g., PostGres), use localhost and a
// defined port, which can be defined below.

/**
 * Postgres connection string. If defined, overrides all other connection
 * parameters ({@link PGHOST}, {@link PGPORT}, {@link PGDATABASE},
 * {@link PGUSER}, {@link PGPASSWORD}).
 */
export const PGSTRING = process.env["PGSTRING"];
let willUsePGString = PGSTRING !== undefined;  // silence warnings if used
if (willUsePGString) {
  console.log("Found PGSTRING, will use for database connection.");
}

// Manual connection parameters
/** The database URL. */
export const PGHOST = getEnvWithDefault("PGHOST", "localhost", !willUsePGString);
export const PGPORT = Number.parseInt(getEnvWithDefault("PGPORT", "5433", !willUsePGString));
/** The name of the database. */
export const PGDATABASE = getEnvWithDefault("PGDATABASE", "", !willUsePGString);
/**The username for the database. The user should have read/write access and
 * the ability to create new tables. */
export const PGUSER = getEnvWithDefault("PGUSER", "", !willUsePGString);
/** The password for the database user (given by {@link PGUSER}). */
export const PGPASSWORD = getEnvWithDefault("PGPASSWORD", "", !willUsePGString);

// -----------------------------------------------------------------------------
//  Included in headers for requests made by this app. This is used to contact
// the developer if the service starts misbehaving, and is required for push
// notifications. Please include your email here!

/** Developer email for request headers. */
export const DEV_EMAIL = getEnvWithDefault("DEV_EMAIL", "");

// -----------------------------------------------------------------------------
// Defined in production-- used to authenticate a scheduled job that is run by
// GitHub actions that checks for new gear and sends out notifications to users.
// You can leave this blank when testing locally.

/** Authenticates the scheduled job. */
export const ACTION_SECRET = getEnvWithDefault("ACTION_SECRET", "");

// -----------------------------------------------------------------------------
// VAPID keys are required by the push notification specification and are used
// to encrypt data before it reaches user devices. To generate your own pair,
// run `npx web-push generate-vapid-keys --json` in the command line.

// These values are provided **ONLY** as an example for development, and are not
// used in production for the web app.

/** VAPID public key for authenticating push notifications. */
export const VAPID_PUBLIC_KEY = getEnvWithDefault(
	"VAPID_PUBLIC_KEY",
	"BP0f7Rhdh5eQg3mWuu7SyUptJ-MGm6f9Ci4ldL1yp4BWK_651XEiBJrDrOmTGqme8ndpETkkdqAbu-_zxCiNoyk"
);
/** VAPID private key for authenticating push notifications. */
export const VAPID_PRIVATE_KEY = getEnvWithDefault(
	"VAPID_PRIVATE_KEY",
	"kKRbyxQeGeeoEtRCij10GRZUa4DoF8FXEMK1Sxf5ChM"
);
