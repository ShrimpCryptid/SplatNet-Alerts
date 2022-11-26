import * as cheerio from "cheerio";
import fs from "fs";
import { Gear } from "./gear";
import { IGNORED_GEAR_ABILITIES, IGNORED_GEAR_BRANDS } from "../constants";
import { fetchWithBotHeader } from "./backend_utils";
import cliProgress from "cli-progress";
import colors from "ansi-colors";
import {
	TITLE_JSON_KEY_ADJECTIVES,
	TITLE_JSON_KEY_SUBJECTS,
} from "../constants/titledata";
import { sleep } from "./shared_utils";
const SPLATOON_WIKI_URL_PREFIX = "https://splatoonwiki.org";
const RARITY_FULL_STAR_ALT = "Star-full.png";

const REQUEST_DELAY_MS = 200;

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
		// TODO: Retrieve highest-quality version (256x256) that the wiki has?
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
				gearType.padEnd(12, " ") +
				"|" +
				colors.grey("{bar}") +
				"| {percentage}% || {value}/{total} || Skipped: {skipped}",
			barCompleteChar: "\u2588",
			barIncompleteChar: "\u2591",
			hideCursor: true,
			stopOnComplete: true,
			clearOnComplete: false,
		});
		progressBar.start(gearCount, 0, { speed: "N/A" });

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
						progressBar.update({ skipped: gearSkippedCount });
						progressBar.increment();
					});
				})
			);
		});
		await Promise.all(promises);
		progressBar.update(gearCount);
		progressBar.stop();
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
	console.log("Working... This may take a few minutes.");
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

/**
 * Formats the gear data as a dictionary mapping from gear names to gear
 * objects and saves the resulting JSON object locally.
 */
async function updateLocalGearJSON(filepath: string) {
	let startTime = Date.now();
	let gearData = await getAllGearData();
	// format gear data as a dictionary
	let gearDict: { [key: string]: Gear } = {};
	for (let gear of gearData) {
		gearDict[gear.name] = gear;
	}
	let jsonString = JSON.stringify(gearDict);

	try {
		fs.writeFileSync(filepath, jsonString);
		let timeElapsedSeconds = (Date.now() - startTime) / 1000.0;
		console.log(
			"Wrote file successfully. Time elapsed: " +
				timeElapsedSeconds.toFixed(2) +
				"s"
		);
	} catch (err) {
		throw err;
	}
}

/** Gets a list of titles in English from the wiki page (either subjects or
 * adjectives) and returns them as an array.
 */
async function scrapeTitleDataFromWikiPage(wikiURL: string): Promise<string[]> {
	const titles: string[] = [];
	try {
		const response = await fetchWithBotHeader(wikiURL);
		const $ = cheerio.load(await response.text());

		$("div table tbody tr").each((_idx, rowElement) => {
			if (_idx === 0) {
				// Skip table name
				return;
			}

			const children = $(rowElement).children();
			// Find all <b> elements in the first column
			const childBoldElements = $(children[0]).find("b");
			childBoldElements.each((_idx, rowElement) => {
				// Trim and add each bold element to our list
				titles.push($(rowElement).text().trim());
			});
		});
	} catch (error) {
		throw error;
	}
	return titles;
}

/**
 * Retrieves a list of all title subjects and adjectives from the wiki and saves
 * them to the designated local file.
 */
async function updateLocalTitlesJSON(filepath: string) {
	console.log("Retrieving title data from the Splatoon wiki...");
	const subjects = await scrapeTitleDataFromWikiPage(
		"https://splatoonwiki.org/wiki/Title/Subject"
	);
	await sleep(REQUEST_DELAY_MS);
	const adjectives = await scrapeTitleDataFromWikiPage(
		"https://splatoonwiki.org/wiki/Title/Adjective"
	);
	let titleDict: { [key: string]: string[] } = {};
	titleDict[TITLE_JSON_KEY_ADJECTIVES] = adjectives;
	titleDict[TITLE_JSON_KEY_SUBJECTS] = subjects;

	let jsonString = JSON.stringify(titleDict);

	fs.writeFileSync(filepath, jsonString);
	console.log("Wrote title data successfully.");
}

// =================
// PROGRAM OPERATION
// =================
updateLocalGearJSON("./public/data/geardata.json");
updateLocalTitlesJSON("./public/data/titledata.json");
