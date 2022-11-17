// Page for creating and editing filters.

import Head from "next/head";
import Link from "next/link";
import Router from "next/router";
import React from "react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import LabeledAlertbox from "../components/alertbox";
import FilterView from "../components/filter-view";
import GearSelector from "../components/gear_selector";
import Selector from "../components/selector";
import { SERVER } from "../config";
import {
	FE_WILDCARD,
	GEAR_ABILITIES,
	GEAR_BRANDS,
	GEAR_TYPES,
	GEAR_PROPERTY,
	API_USER_CODE,
	API_FILTER_JSON,
	API_PREVIOUS_FILTER_JSON,
  GEAR_NAME_TO_IMAGE,
  GEAR_NAMES,
  GEAR_NAME_TO_DATA
} from "../constants";
import Filter from "../lib/filter";

import { abilityIcons } from "../public/icons/abilities";
import { brandIcons } from "../public/icons/brands";
import { typeIcons } from "../public/icons/gear-type";
import styles from "../styles/filter.module.css";
import { DefaultPageProps } from "./_app";

const MAKE_USER_ATTEMPTS = 3;

// ==============
// Helper Methods
// ==============
function makeSelectedMap(allValues: string[]): Map<string, boolean> {
	let boolArr: [string, boolean][] = allValues.map((value) => {
		return [value, false];
	});

	// Add wildcard to the array
	let wildcardArr: [string, boolean][] = [[FE_WILDCARD, false]];
	boolArr = wildcardArr.concat(boolArr); // prepend
	return new Map(boolArr);
}

function selectedListToMap(
	allValues: string[],
	selectedValues: string[]
): Map<string, boolean> {
	let boolArr: [string, boolean][] = allValues.map((value) => {
		return [value, selectedValues.includes(value)];
	});

	// Wildcard is set to true if selected values is empty
	let wildcardArr: [string, boolean][] = [
		[FE_WILDCARD, selectedValues.length == 0],
	];
	boolArr = wildcardArr.concat(boolArr);

	return new Map(boolArr);
}

/**
 * Unwraps a mapping of keys to booleans into list containing any true keys.
 * @returns A list of any keys that mapped to true values.
 *  If the wildcard 'Any' is true, or if no keys are true, returns an empty
 *  array.
 */
function selectedMapToList(selected: Map<string, boolean>): string[] {
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
	return selectedArray;
}

/* Returns true if any key has been selected (value is true) */
function hasSelection(selected: Map<string, boolean>): boolean {
	for (let key of selected.keys()) {
		if (selected.get(key)) {
			return true;
		}
	}
	return false;
}

async function trySaveFilter(
	userCode: string,
	filter: Filter
): Promise<number> {
  console.log(filter);
	let url = `/api/add-filter`;
	url += `?${API_USER_CODE}=${userCode}&${API_FILTER_JSON}=${filter.serialize()}`;
	let response = await fetch(url);
	return response.status;
}

async function tryUpdateFilter(
	userCode: string,
	newFilter: Filter,
	oldFilter: Filter
): Promise<number> {
	let url = `/api/update-filter?${API_USER_CODE}=${userCode}&${API_FILTER_JSON}=${newFilter.serialize()}&${API_PREVIOUS_FILTER_JSON}=${oldFilter.serialize()}`;
	let response = await fetch(url);
	return response.status;
}

// ============
// Page Content
// ============
export default function FilterPage({
	usercode,
	setUserCode,
	editingFilter,
}: DefaultPageProps) {
	// TODO: Handle editing filters
	let initAbilities, initBrands, initTypes;
	let initCanSaveFilter;
	let initFilter = editingFilter || new Filter();

	// Load current filter properties
	if (!editingFilter) {
		// Making a new filter from scratch, so use defaults for abilities, etc.
		// We use the GEAR_ABILITIES, etc. constants as keys in the map.
		initAbilities = makeSelectedMap(GEAR_ABILITIES);
		initBrands = makeSelectedMap(GEAR_BRANDS);
		initTypes = makeSelectedMap(GEAR_TYPES);
		initCanSaveFilter = false;
	} else {
		// Have existing filter, populate values in page state.
		initAbilities = selectedListToMap(
			GEAR_ABILITIES,
			editingFilter.gearAbilities
		);
		initBrands = selectedListToMap(GEAR_BRANDS, editingFilter.gearBrands);
		initTypes = selectedListToMap(GEAR_TYPES, editingFilter.gearTypes);
		initCanSaveFilter = true;
	}

	// Initialize page states, using existing filter values if present.
	const [selectedGearName, setSelectedGearName] = useState(initFilter.gearName);
	const [selectedRarity, setSelectedRarity] = useState(initFilter.minimumRarity);
	const [selectedAbilities, setSelectedAbilities] = useState(initAbilities);
	const [selectedBrands, setSelectedBrands] = useState(initBrands);
	const [selectedTypes, setSelectedTypes] = useState(initTypes);
	const [currFilter, setCurrFilter] = useState(initFilter);
	const [canSaveFilter, setCanSaveFilter] = useState(initCanSaveFilter);
  const [pageSwitchReady, setPageSwitchReady] = useState(false);
  const [showGearSelection, setShowGearSelection] = useState(false);

	// Update the filter values using new state. This is called whenever
	// a selection is changed on the page.
	const updateFilter = (
		category: GEAR_PROPERTY,
		newValue: any,
	) => {
		let newGearName = selectedGearName;
		let newRarity = selectedRarity;
		let newAbilities = selectedAbilities;
		let newBrands = selectedBrands;
		let newTypes = selectedTypes;

    // either ability, brand, or gear types.
    if (category == GEAR_PROPERTY.ABILITY) {
      setSelectedAbilities(newValue);
      newAbilities = newValue;
    } else if (category == GEAR_PROPERTY.BRAND) {
      setSelectedBrands(newValue);
      newBrands = newValue;
    } else if (category == GEAR_PROPERTY.TYPE) {
      setSelectedTypes(newValue);
      newTypes = newValue;
    } else if (category == GEAR_PROPERTY.NAME) {
			setSelectedGearName(newValue);
			newGearName = newValue;
		} else if (category == GEAR_PROPERTY.RARITY) {
			setSelectedRarity(newValue);
			newRarity = newValue;
		}

		let newFilter = new Filter(
			newGearName,
			newRarity,
			selectedMapToList(newTypes),
			selectedMapToList(newBrands),
			selectedMapToList(newAbilities)
		);
		setCurrFilter(newFilter);

		// Update whether filter can be saved
    if (newGearName !== "") {
      // If gear item selected, ignore brands and type (set by default)
      setCanSaveFilter(hasSelection(newAbilities));
    } else {
      // Otherwise, types, brands, and abilities must all be set.
      setCanSaveFilter(
        hasSelection(newTypes) &&
        hasSelection(newBrands) &&
        hasSelection(newAbilities)
      );
    }
	}; // updateFilter

	const onClickSave = () => {
		// Try saving the filter to the database.
		// Note that no filter cleanup/validation happens here.

		async function saveFilter() {
			// Generate a user code
			let tempUserCode = usercode;
			if (!usercode) {
				// Try making a new user. If it doesn't work, display an error message.
				for (let attempts = MAKE_USER_ATTEMPTS - 1; attempts > 0; attempts--) {
					let response = await fetch(`${SERVER}/api/new-user`);
					if (response.status == 200) {
						let tempUserCode = await response.json();
            setUserCode(tempUserCode);  // store new code
						break;
					}
				}
			}

			if (!tempUserCode) {
				// TODO: Display an error message
        console.log("Could not make new user.");
				return;
			} else {
				let responseCode = 0;
				if (editingFilter) {
					// we are editing an existing filter, must update
					responseCode = await tryUpdateFilter(
						tempUserCode,
						currFilter,
						editingFilter
					);
				} else {
					// we are making a new filter
					responseCode = await trySaveFilter(tempUserCode, currFilter);
				}
				if (responseCode == 200) {
					// Successfully saved; return to main page
          toast.success("Filter saved.");
          setPageSwitchReady(true);
				} else {
					// TODO: Display an error message.
					console.log("Response code: " + responseCode);
					console.error("Could not complete request.");
					return;
				}
			}
		}
		saveFilter();
	};

  // handle page switch only after page update has happened.
  useEffect(() => {
    if (pageSwitchReady) {
      Router.push("/");
    }
  });

	// Resize the group of selectors so they are either a row or column based on
	// the window width.
	const handleResize = () => {
		const selectorGroup = document.querySelector("." + styles.selectorGroup);
		if (selectorGroup) {
			// Check the width of all the contained items. If they're too large,
			// change the layout to a column.
			let minDimension = Math.min(window.innerHeight, window.innerWidth);
			let rowWidth = 3 * minDimension * 0.3 + 80;
			if (rowWidth < window.innerWidth) {
				// row
				selectorGroup.classList.remove(styles.directionColumn);
				selectorGroup.classList.add(styles.directionRow);
			} else {
				// column
				selectorGroup.classList.remove(styles.directionRow);
				selectorGroup.classList.add(styles.directionColumn);
			}
		}
	};

	// Add as a listener for resizing
	React.useEffect(() => {
		handleResize(); // run once on page load.
		window.addEventListener("resize", handleResize, false);
	});

	return (
		<div className={styles.main}>
			<Head>Splatnet Shop Alerts</Head>
			<h1>New Filter</h1>
			<p>Select the gear properties you want to be alerted for.</p>
      <button onClick={() => {setShowGearSelection(true)}}>Select Gear (optional)</button>
      {showGearSelection ?
        <LabeledAlertbox header="Select Gear">
          <GearSelector
            gearData={GEAR_NAME_TO_DATA}
            onSelection={(selectedGear) => {
              updateFilter(GEAR_PROPERTY.NAME, selectedGear.name);
              setShowGearSelection(false)
            }}
            />
        </LabeledAlertbox>
        : <></>
      }
			<div className={styles.selectorGroup}>
				<div className={styles.selectorContainer}>
					<Selector
						title={"Types"}
						category={GEAR_PROPERTY.TYPE}
						items={Array.from(selectedTypes.keys())}
						selected={selectedTypes}
						itemImages={typeIcons}
						wildcard={true}
						onChanged={(newSelected: Map<string, boolean>) => {
							updateFilter(GEAR_PROPERTY.TYPE, newSelected);
						}}
            lockTo={GEAR_NAME_TO_DATA.get(selectedGearName)?.type}
					/>
				</div>
				<div className={styles.selectorContainer}>
					<Selector
						title={"Brands"}
						category={GEAR_PROPERTY.BRAND}
						items={Array.from(selectedBrands.keys())}
						selected={selectedBrands}
						wildcard={true}
						itemImages={brandIcons}
						onChanged={(newSelected: Map<string, boolean>) => {
							updateFilter(GEAR_PROPERTY.BRAND, newSelected);
						}}
            lockTo={GEAR_NAME_TO_DATA.get(selectedGearName)?.brand}
					/>
				</div>
				<div className={styles.selectorContainer}>
					<Selector
						title={"Abilities"}
						category={GEAR_PROPERTY.ABILITY}
						items={Array.from(selectedAbilities.keys())}
						selected={selectedAbilities}
						wildcard={true}
						itemImages={abilityIcons}
						onChanged={(newSelected: Map<string, boolean>) => {
							updateFilter(GEAR_PROPERTY.ABILITY, newSelected);
						}}
					/>
				</div>
			</div>
			<div className={styles.filterViewContainer}>
				<FilterView
					filter={currFilter}
					brandsSelected={hasSelection(selectedBrands)}
					abilitiesSelected={hasSelection(selectedAbilities)}
					typesSelected={hasSelection(selectedTypes)}
				/>
			</div>
			<button onClick={onClickSave} disabled={!canSaveFilter}>
				Save
			</button>
			<Link href="/">
				<button>Cancel</button>
			</Link>
		</div>
	);
}
