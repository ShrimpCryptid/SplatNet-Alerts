/**
 * Data class for gear items
 */

import { GEAR_TYPES } from "../constants";

export class Gear {
	id: string;
	price: number;
	brand: string;
	type: string;
	name: string;
	ability: string;
	/**The number of rarity stars, ranging from 0-2 (or the number sub ability slots - 1).*/
	rarity: number;
	/**Expiration timestamp, as parsed by Date.parse()*/
	expiration: number;
	image: string;

	constructor(
		id = "",
		price = 0,
		brand = "",
		type = "",
		name = "",
		ability = "",
		rarity = 0,
		expiration = 0,
		image = ""
	) {
		this.id = id;
		this.price = price;
		this.brand = brand;
		this.type = type;
		this.name = name;
		this.ability = ability;
		this.rarity = rarity;
		this.expiration = expiration;
		this.image = image;
	}

	static deserialize(obj: any): Gear {
		let newGear = new Gear();
		newGear.id = obj.id;
		newGear.price = obj.price;
		newGear.brand = obj.brand;
		newGear.type = obj.type;
		newGear.ability = obj.ability;
		newGear.rarity = obj.rarity;
		newGear.expiration = obj.expiration;
		newGear.image = obj.image;
		newGear.name = obj.name;
		return newGear;
	}

  /** Sorts gear in ascending order of expiration. Ties are broken by gear type,
   * then gear name.
   */
	static expirationComparator = (a: Gear, b: Gear) => {
    let ret = a.expiration - b.expiration;
    if (ret === 0) {
      // Reversed because earlier indexes (headgear) should come before later
      // ones (clothing/shoes)
      ret = GEAR_TYPES.indexOf(b.type) - GEAR_TYPES.indexOf(a.type);
    }
    if (ret === 0) {
      ret = a.name.localeCompare(b.name);
    }
		return ret;
	};
}
