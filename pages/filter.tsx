/**
 * Page for creating and editing filters.
 */

import Head from "next/head";
import { useState, useEffect, SetStateAction } from "react";
import {FunctionComponent} from 'react';
import Selector from "../components/selector";
import { GEAR_ABILITIES, GEAR_BRANDS, GEAR_TYPES } from "../constants";
import { Filter } from "../lib/database_utils";


function listToBooleanMap(arr: string[], initValue=false): Map<string, boolean> {
    let boolArr: [string, boolean][] = arr.map(value => {return [value, initValue]});
    return new Map(boolArr);
}

type FilterProps = {
    filter?: Filter
}

export default function FilterPage () {

    // TODO: Handle editing filters
    const [selectedAbilities, setSelectedAbilities] = useState(listToBooleanMap(GEAR_ABILITIES));
    const [selectedBrands, setSelectedBrands] = useState(listToBooleanMap(GEAR_BRANDS));
    const [selectedTypes, setSelectedTypes] = useState(listToBooleanMap(GEAR_TYPES));

	return (
		<div id="app">
			<Head>Splatnet Shop Alerts</Head>
			<p>Placeholder text</p>
            <h1>Gear Types</h1>
			<Selector
				items={Array.from(selectedTypes.keys())}
				selected={selectedTypes}
				wildcard={true}
				onChanged={(newSelected: Map<string, boolean>) => {
					setSelectedTypes(newSelected);
				}}
			/>
            <h1>Gear Brands</h1>
			<Selector
				items={Array.from(selectedBrands.keys())}
				selected={selectedBrands}
				wildcard={true}
				onChanged={(newSelected: Map<string, boolean>) => {
					setSelectedBrands(newSelected);
				}}
			/>
            <h1>Gear Abilities</h1>
			<Selector
				items={Array.from(selectedAbilities.keys())}
				selected={selectedAbilities}
				wildcard={true}
				onChanged={(newSelected: Map<string, boolean>) => {
					setSelectedAbilities(newSelected);
				}}
			/>
		</div>
	);
}
