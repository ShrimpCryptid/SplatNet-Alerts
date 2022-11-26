import {
	GEAR_NAMES,
	GEAR_BRANDS,
	GEAR_TYPES,
	GEAR_RARITY_MIN,
	GEAR_RARITY_MAX,
	GEAR_ABILITIES,
	GEAR_NAME_TO_DATA,
} from "../constants";
import { IllegalArgumentError } from "./shared_utils";

/**
 * Data class representing a single filter for gear properties.
 */
export default class Filter {
	gearName: string;
	minimumRarity: number;
	gearTypes: string[];
	gearBrands: string[];
	gearAbilities: string[];

	/**
	 * @param {string} gearName string name of gear. If empty, any gear may match.
	 *    If not empty, the minimum rarity and gear brands are overriden to match
	 *    the selected gear item.
	 * @param {string[]} gearTypes string names of gear types (Clothing, Shoes,
	 *    Headgear). If empty, any gear may match.
	 * @param {string[]} gearBrands string names of accepted brands. If empty, any
	 *    brand is accepted.
	 * @param {int} minimumRarity minimum required rarity, as int (1, 2, 3).
	 * @param {string[]} gearAbilities string names of accepted abilities. If
	 *    empty, any ability may match.
	 */
	constructor(
		gearName: string = "",
		minimumRarity: number = 0,
		gearTypes: string[] = [],
		gearBrands: string[] = [],
		gearAbilities: string[] = []
	) {
		// Validate parameters
		if (gearName !== "") {
			if (!GEAR_NAMES.includes(gearName)) {
				throw new IllegalArgumentError(`No known gear '${gearName}'.`);
			} else {
				// Override rarity, type, and brand parameters.
				let gear = GEAR_NAME_TO_DATA.get(gearName);
				if (gear) {
					minimumRarity = gear.rarity;
					gearBrands = [gear.brand];
					gearTypes = [gear.type];
				}
			}
		}

		for (var brand of gearBrands) {
			if (!GEAR_BRANDS.includes(brand)) {
				throw new IllegalArgumentError(
					`Gear brand '${brand}' is not recognized.`
				);
			}
		}
		for (var type of gearTypes) {
			if (!GEAR_TYPES.includes(type)) {
				throw new IllegalArgumentError(
					`Gear type '${type}' is not recognized.`
				);
			}
		}
		if (minimumRarity < GEAR_RARITY_MIN || minimumRarity > GEAR_RARITY_MAX) {
			throw new IllegalArgumentError(
				`Gear rarity must be between ${GEAR_RARITY_MIN} and ${GEAR_RARITY_MAX} (provided '${minimumRarity}')`
			);
		}
		for (var ability of gearAbilities) {
			if (!GEAR_ABILITIES.includes(ability)) {
				throw new IllegalArgumentError(
					`Gear ability '${ability}' is not recognized.`
				);
			}
		}

		this.gearName = gearName;
		this.gearTypes = gearTypes;
		this.gearBrands = gearBrands;
		this.minimumRarity = minimumRarity;
		this.gearAbilities = gearAbilities;
	}

	public serialize(): string {
		return JSON.stringify(this);
	}

	public static deserialize(jsonString: string): Filter {
		let jsonObject = JSON.parse(jsonString);
		return Filter.deserializeObject(jsonObject);
	}

	public static deserializeObject(jsonObject: any): Filter {
		return new Filter(
			jsonObject.gearName,
			jsonObject.minimumRarity,
			jsonObject.gearTypes,
			jsonObject.gearBrands,
			jsonObject.gearAbilities
		);
	}
}
