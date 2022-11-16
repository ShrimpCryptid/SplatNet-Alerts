/**
 * Data class for gear items
 */

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
    return newGear;
  }
  
  static expirationComparator = (a: Gear, b: Gear) => {
    return a.expiration - b.expiration;
  }
}
