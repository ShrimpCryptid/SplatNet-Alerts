import * as cheerio from "cheerio";
import { Gear } from "./gear_loader";
import fetch from "node-fetch";
import { IGNORED_GEAR_ABILITIES, IGNORED_GEAR_BRANDS } from "../constants";
import { fetchWithBotHeader } from "./utils";
import * as cliProgress from "cli-progress";
import * as colors from "ansi-colors";

const SPLATOON_WIKI_URL_PREFIX = "https://splatoonwiki.org";
const RARITY_FULL_STAR_ALT = "Star-full.png";

const REQUEST_DELAY_MS = 200;

/** Returns a promise that resolves once the timeout is completed. */
function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// TODO: Replace gearType with an enum?

/**
 * Parses HTML data from the Splatoon wiki into a Gear object. Returns null for
 * brands or abilities that are set to be ignored (see
 * {@link IGNORED_GEAR_ABILITIES} and {@link IGNORED_GEAR_BRANDS} for a full
 * list).
 * 
 * Note: this method may perform one additional fetch request to get the image
 * data URL. Please be respectful to the wiki's bandwidth resources when running
 * it by adding some sort of throttling or delay between requests.
 */
async function parseRowToGear(
	$: cheerio.CheerioAPI,
	el: cheerio.Element,
	gearType: string
): Promise<Gear | null> {
	let pageLink,
		imageLink,
		name,
		brand,
		cost,
		ability,
		rarity = 0;
	// Properties are laid out in the following order as <td> elements
	// 1. Image (cannot be directly scraped, must be retrieved from page)
	// 2. Name (w/ link)
	// 3. Brand
	// 4. Cost (or linked amiibo)
	// 5. Ability
	// 6. Rarity
	const children = $(el).children(); // get data columns

	// Parse column data
	name = $(children[1]).text().trim();
	brand = $(children[2]).text().trim();
	cost = $(children[3]).text().trim(); // note, can be amiibo and not num
	ability = $(children[4]).text().trim();

	// Calculate rarity by counting the number of full stars
	children[5].children.forEach((value) => {
		// img
		if ($(value).attr("alt") === RARITY_FULL_STAR_ALT) {
			rarity++;
		}
	});

	// Check if this is an item we should ignore based on ability or brand.
	if (
		IGNORED_GEAR_BRANDS.includes(brand) ||
		IGNORED_GEAR_ABILITIES.includes(ability)
	) {
		return null;
	}

	// Fetch link to the full page for this gear item
	if (children[1].firstChild) {
		let childAElement = children[1].firstChild; // <a> tag
		// Links are relative (ex: '/wiki/18K_Aviators') so must add URL prefix
		pageLink = SPLATOON_WIKI_URL_PREFIX + $(childAElement).attr("href");
	}

	// Fetch image link from the gear's page
	if (pageLink) {
		let gearPageResponse = await fetchWithBotHeader(pageLink);
		const $ = cheerio.load(await gearPageResponse.text());

		// Get the image URL from the infobox
		let imgSrc = $("div.infobox.S3 > div.infobox-image > a > img").attr("src");
		imageLink = "https:" + imgSrc;
	}

	return new Gear(
		"", // id (SplatNet gear only)
		Number.parseInt(cost), // cost
		brand,
		gearType,
		name,
		ability,
		rarity,
		0, // expiration
		imageLink
	);
}

/** Gets a list of Gear items from the list of gear on the Splatoon wiki page.
 * Skips items that are in {@link IGNORED_GEAR_ABILITIES} and
 * {@link IGNORED_GEAR_BRANDS}.
 */
async function scrapeGearDataFromWikiPage(
	wikiURL: string,
	gearType: string
): Promise<Gear[]> {
	try {
		const response = await fetchWithBotHeader(wikiURL);
		const $ = cheerio.load(await response.text());

		// Traverse every gear item in the main table of gear items
		let promises: Promise<void>[] = [];
		let gear: Gear[] = [];
		let gearSkippedCount = 0;
		let gearCount = $("div table tbody tr").length;

		// Generate progress bar
		const progressBar = new cliProgress.SingleBar({
			format:
				gearType.padEnd(12, " ") + "|" +
				colors.grey("{bar}") +
				"| {percentage}% || {value}/{total} Items || Skipped Items: {skipped}",
			barCompleteChar: "\u2588",
			barIncompleteChar: "\u2591",
			hideCursor: true,
		});
    progressBar.start(gearCount, 0, {speed: "N/A"});

		// Traverse each gear item as a row in the table.
		$("div table tbody tr").each((_idx, rowElement) => {
			if (_idx === 0) {
				// skip table names
				return;
			}

			// Add a delay before each request starts processing.
			promises.push(
				sleep(REQUEST_DELAY_MS * (_idx - 1)).then(() => {
					parseRowToGear($, rowElement, gearType).then((result) => {
						if (result !== null) {
							gear.push(result);
						} else {
							// mark that we skipped gear
							gearSkippedCount++;
						}
            progressBar.update({"skipped": gearSkippedCount});
            progressBar.increment();
					});
				})
			);
		});
		await Promise.all(promises);
    progressBar.setTotal(gearCount);
    progressBar.stop();
    console.log(`Fetched ${gearCount - gearSkippedCount} items (skipped ${gearSkippedCount}).`);
		return gear;
	} catch (error) {
		throw error;
	}
}

/** 
 * Returns a list of all gear items that are currently eligible for
 * order on SplatNet by crawling the Splatoon wiki.
 */
async function getAllGearData() {
	let headGearList = await scrapeGearDataFromWikiPage(
		"https://splatoonwiki.org/wiki/List_of_headgear_in_Splatoon_3",
		"HeadGear"
	);
  let clothingGearList = await scrapeGearDataFromWikiPage(
    "https://splatoonwiki.org/wiki/List_of_clothing_in_Splatoon_3",
    "ClothingGear"
  );
  let shoesGearList = await scrapeGearDataFromWikiPage(
    "https://splatoonwiki.org/wiki/List_of_shoes_in_Splatoon_3",
    "ShoesGear"
  );

  return [...headGearList, ...clothingGearList, ...shoesGearList];
}

console.log("Working... This may take a few minutes.");
getAllGearData();
