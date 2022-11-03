/**
 * Page for creating and editing filters.
 */

import Head from "next/head";
import { useState, useEffect, SetStateAction } from "react";
import { FunctionComponent } from "react";
import Selector from "../components/selector";
import { FE_WILDCARD, GEAR_ABILITIES, GEAR_BRANDS, GEAR_TYPES, PROPERTY_CATEGORY } from "../constants";
import Filter from "../lib/filter";

import { abilityIcons } from "../public/icons/abilities";
import { brandIcons } from "../public/icons/brands";

function listToBooleanMap(
	arr: string[],
	addWildcard = true,
	initValue = false
): Map<string, boolean> {
	let boolArr: [string, boolean][] = arr.map((value) => {
		return [value, initValue];
	});
	if (addWildcard) {
		let wildcardArr: [string, boolean][] = [[FE_WILDCARD, initValue]];
		boolArr = wildcardArr.concat(boolArr);
	}
	return new Map(boolArr);
}

type FilterProps = {
	filter?: Filter;
};

export default function FilterPage() {
	// TODO: Handle editing filters
	const [selectedAbilities, setSelectedAbilities] = useState(listToBooleanMap(GEAR_ABILITIES));
	const [selectedBrands, setSelectedBrands] = useState(listToBooleanMap(GEAR_BRANDS));
	const [selectedTypes, setSelectedTypes] = useState(listToBooleanMap(GEAR_TYPES));

	return (
		<div id="app">
			<Head>Splatnet Shop Alerts</Head>
			<p>Placeholder text</p>
			<Selector
        title={"Gear Types"}
        category={PROPERTY_CATEGORY.TYPE}
				items={Array.from(selectedTypes.keys())}
				selected={selectedTypes}
				wildcard={true}
				onChanged={(newSelected: Map<string, boolean>) => {
					setSelectedTypes(newSelected);
				}}
			/>
			<Selector
        title={"Gear Brands"}
        category={PROPERTY_CATEGORY.BRAND}
				items={Array.from(selectedBrands.keys())}
				selected={selectedBrands}
				wildcard={true}
                itemImages={brandIcons}
				onChanged={(newSelected: Map<string, boolean>) => {
					setSelectedBrands(newSelected);
				}}
			/>
			<Selector
        title={"Gear Abilities"}
        category={PROPERTY_CATEGORY.ABILITY}
				items={Array.from(selectedAbilities.keys())}
				selected={selectedAbilities}
				wildcard={true}
                itemImages={abilityIcons}
				onChanged={(newSelected: Map<string, boolean>) => {
					setSelectedAbilities(newSelected);
				}}
			/>
      <button>
        Save
      </button>
		</div>
	);
}
