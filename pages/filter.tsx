/**
 * Page for creating and editing filters.
 */

import Head from "next/head";
import { useState, useEffect, SetStateAction } from "react";
import { FunctionComponent } from "react";
import FilterListItem from "../components/filter-list-item";
import Selector from "../components/selector";
import { FE_WILDCARD, GEAR_ABILITIES, GEAR_BRANDS, GEAR_TYPES, GEAR_PROPERTY } from "../constants";
import Filter from "../lib/filter";
import { mapGetWithDefault } from "../lib/utils";

import { abilityIcons } from "../public/icons/abilities";
import { brandIcons } from "../public/icons/brands";
import {typeIcons} from "../public/icons/gear-type";
import styles from "../styles/filter.module.css";

function makeSelectedMap(allValues: string[]): Map<string, boolean> {
	let boolArr: [string, boolean][] = allValues.map((value) => {
		return [value, false];
	});

  // Add wildcard to the array
  let wildcardArr: [string, boolean][] = [[FE_WILDCARD, false]];
  boolArr = wildcardArr.concat(boolArr);  // prepend
	return new Map(boolArr);
}

function selectedListToMap(allValues: string[],
                          selectedValues: string[]): Map<string, boolean> {
  let boolArr: [string, boolean][] = allValues.map((value) => {
		return [value, selectedValues.includes(value)];
	});

  // Wildcard is set to true if selected values is empty
  let wildcardArr: [string, boolean][] = [[FE_WILDCARD, selectedValues.length == 0]];
  boolArr = wildcardArr.concat(boolArr);

  return new Map(boolArr);
}

function selectedMapToList(selected: Map<string, boolean>): (string[]) {
  let selectedArray: string[] = [];
  for (let key of selected.keys()) {
    if (selected.get(key) && key == FE_WILDCARD) {
      // Wildcard selected, so we return empty array
      return selectedArray;
    } else if (selected.get(key) && key != FE_WILDCARD) {
      // default case, add selected item to array
      selectedArray.push(key);
    }
  }
  if (selectedArray.length == 0) {
    // No items were selected, including Any, so we return null.
    //return null;
  }
  return selectedArray;
}

type FilterProps = {
	filter?: Filter;
};

export default function FilterPage({filter}: FilterProps) {
	// TODO: Handle editing filters
  let initAbilities, initBrands, initTypes;

  // Load current filter properties
  // Note: converting back and forth from the filter's internal format is a bit
  // of a pain, but does allow for the page to have no values selected when
  // first loaded. Some of these functions might need to be moved to the filter
  // class if they're frequently used.

  if (!filter) {
    // Making a new filter from scratch, so use defaults for abilities, etc.
    filter = new Filter();
    initAbilities = makeSelectedMap(GEAR_ABILITIES);
    initBrands = makeSelectedMap(GEAR_BRANDS);
    initTypes = makeSelectedMap(GEAR_TYPES);
  } else {
    // Have existing filter, populate values on page.
    initAbilities = selectedListToMap(GEAR_ABILITIES, filter.gearAbilities);
    initBrands = selectedListToMap(GEAR_BRANDS, filter.gearBrands);
    initTypes = selectedListToMap(GEAR_TYPES, filter.gearTypes);
  }

  // Initialize page states
  const [selectedGearName, setSelectedGearName] = useState(filter.gearName);
  const [selectedRarity, setSelectedRarity] = useState(filter.minimumRarity);
  const [selectedAbilities, setSelectedAbilities] = useState(initAbilities);
	const [selectedBrands, setSelectedBrands] = useState(initBrands);
	const [selectedTypes, setSelectedTypes] = useState(initTypes);
  const [stateFilter, setStateFilter] = useState(filter);

  // Update the filter values using new state
  const updateFilter = (category: GEAR_PROPERTY, updatedMap?: Map<string, boolean>, updatedName?: string, updatedRarity?: number) => {
    let newGearName = "";
    let newRarity = 0;
    let newAbilities = selectedAbilities;
    let newBrands = selectedBrands;
    let newTypes = selectedTypes;

    if (updatedMap) {
      if (category == GEAR_PROPERTY.ABILITY) {
          setSelectedAbilities(updatedMap ? updatedMap : selectedAbilities);
          newAbilities = updatedMap ? updatedMap : selectedAbilities;
      } else if (category == GEAR_PROPERTY.BRAND) {
          setSelectedBrands(updatedMap ? updatedMap : selectedBrands);
          newBrands = updatedMap ? updatedMap : selectedBrands;
      } else if (category == GEAR_PROPERTY.TYPE) {
          setSelectedTypes(updatedMap ? updatedMap : selectedTypes);
          newTypes = updatedMap ? updatedMap : selectedTypes;
      }
    }

    // only allow creation of new filter if valid abilities, brands, and types
    // are selected.
    let newFilter = new Filter(
        newGearName,
        newRarity,
        selectedMapToList(newTypes),
        selectedMapToList(newBrands),
        selectedMapToList(newAbilities)
      );
    setStateFilter(newFilter);
  }

	return (
		<div className={styles.main}>
			<Head>Splatnet Shop Alerts</Head>
			<h1>New Filter</h1>
      <p>Select the gear properties you want to be alerted for.</p>
			<Selector
        title={"Gear Types"}
        category={GEAR_PROPERTY.TYPE}
				items={Array.from(selectedTypes.keys())}
				selected={selectedTypes}
        itemImages={typeIcons}
				wildcard={true}
				onChanged={(newSelected: Map<string, boolean>) => {
          updateFilter(GEAR_PROPERTY.TYPE, newSelected);
				}}
			/>
			<Selector
        title={"Gear Brands"}
        category={GEAR_PROPERTY.BRAND}
				items={Array.from(selectedBrands.keys())}
				selected={selectedBrands}
				wildcard={true}
        itemImages={brandIcons}
				onChanged={(newSelected: Map<string, boolean>) => {
          updateFilter(GEAR_PROPERTY.BRAND, newSelected);
				}}
			/>
			<Selector
        title={"Gear Abilities"}
        category={GEAR_PROPERTY.ABILITY}
				items={Array.from(selectedAbilities.keys())}
				selected={selectedAbilities}
				wildcard={true}
                itemImages={abilityIcons}
				onChanged={(newSelected: Map<string, boolean>) => {
          updateFilter(GEAR_PROPERTY.ABILITY, newSelected);
				}}
			/>
      <FilterListItem
        filter={stateFilter}
      />
      <button>
        Save
      </button>
		</div>
	);
}
