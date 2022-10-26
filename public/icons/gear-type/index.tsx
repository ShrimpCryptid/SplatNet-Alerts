import headgear from './headgear.svg';
import clothing from './clothing.svg';
import shoes from './shoes.svg';
import headgear_and_clothing from './head_and_clothing_gear.svg';
import clothing_and_shoes from './clothing_and_shoes_gear.svg';
import headgear_and_shoes from './head_and_shoes_gear.svg';
import any_svg from './any.svg';

export const GEAR_TYPE_ANY_ICON = any_svg;

export const typeIcons = new Map(Object.entries({
  "": any_svg,
  "HeadGear": headgear,
  "ClothingGear": clothing,
  "ShoesGear": shoes,
  "HeadGearShoesGear": headgear_and_shoes,
  "ShoesGearHeadGear": headgear_and_shoes,
  "HeadGearClothingGear": headgear_and_clothing,
  "ClothingGearHeadGear": headgear_and_clothing,
  "ClothingGearShoesGear": clothing_and_shoes,
  "ShoesGearClothingGear": clothing_and_shoes
}));