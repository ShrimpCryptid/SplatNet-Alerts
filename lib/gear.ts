/**
 * Data class for gear items.
 */

import { GEAR_ABILITIES, GEAR_BRANDS, GEAR_TYPES } from "../constants";
import { mapGetWithDefault } from "./shared_utils";

const WIKI_LINK_ABBREVIATIONS = new Map<string, string>(Object.entries({
  "{1}": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/",
  "{2}": "S3_Gear_Shoes_",
  "{3}": "S3_Gear_Headgear_",
  "{4}": "S3_Gear_Clothing_",
  "{5}": ".png/128px-",
  "{6}": "https://cdn.wikimg.net/en/splatoonwiki/images/"
}));


/** A compacted form of gear data, useful for file storage. Note that this
 * WILL break if changes are made to {@link GEAR_ABILITIES},
 * {@link GEAR_BRANDS}, or {@link GEAR_TYPES}.
*/
export type CompactGearData = {
  t: number;
  a: number;
  b: number;
  r: number;
  i: string;
};

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

  /**
   * Sorts gear in ascending order of name.
   */
  static gearNameComparator = (a: Gear, b: Gear) => {
    return a.name.localeCompare(b.name);
  }

  private static shortenImageURL(url: string, gearName: string) {
    let newURL = url;
    for (let key of WIKI_LINK_ABBREVIATIONS.keys()) {
      newURL = newURL.replaceAll(mapGetWithDefault(WIKI_LINK_ABBREVIATIONS, key, "[ERROR]"), key);
    }
    // Abbreviate the gear name as well
    newURL = newURL.replaceAll(gearName.replaceAll(" ", "_"), "{n}");
    return newURL;
  }

  private static unshortenImageURL(url: string, gearName: string) {
    let newURL = url;
    for (let key of WIKI_LINK_ABBREVIATIONS.keys()) {
      newURL = newURL.replaceAll(key, mapGetWithDefault(WIKI_LINK_ABBREVIATIONS, key, "[ERROR]"));
    }
    newURL = newURL.replaceAll("{n}", gearName.replaceAll(" ", "_"));
    return newURL;
  }

  /**
   * Creates a new object with shortened keys and type/brand/ability values,
   * useful for reducing file sizes. Removes the name, price, expiration, and id
   * fields. Also reduces size of image links from the Splatoon wiki.
   * Compacted gear data objects can be deserialized with
   * {@link deserializeCompact()} back into Gear objects.
   */
  static serializeCompact(gear: Gear): CompactGearData {
    let newImageURL = Gear.shortenImageURL(gear.image, gear.name);
    return {
      t: GEAR_TYPES.indexOf(gear.type),
      a: GEAR_ABILITIES.indexOf(gear.ability),
      b: GEAR_BRANDS.indexOf(gear.brand),
      r: gear.rarity,
      i: newImageURL
    }
  }

  /** Deserializes compacted gear data (as given by {@link serializeCompact()} 
   * back into a Gear object.
   */
  static deserializeCompact(name: string, data: CompactGearData): Gear {
    return new Gear(
      "",
      0,
      GEAR_BRANDS[data.b],
      GEAR_TYPES[data.t],
      name,
      GEAR_ABILITIES[data.a],
      data.r,
      0,
      Gear.unshortenImageURL(data["i"], name));
  }
}
