// Page for creating and editing filters.

import Head from "next/head";
import Link from "next/link";
import Router from "next/router";
import React, { useMemo } from "react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import LabeledAlertbox from "../components/alertbox";
import FilterView from "../components/filter-view";
import GearSelector from "../components/gear_selector";
import LoadingButton from "../components/loading-button";
import Selector from "../components/selector";
import {
	FE_WILDCARD,
	GEAR_ABILITIES,
	GEAR_BRANDS,
	GEAR_TYPES,
	GEAR_PROPERTY,
	API_USER_CODE,
	API_FILTER_JSON,
	API_PREVIOUS_FILTER_JSON,
	FE_UNKNOWN_MSG,
  TYPE_EXCLUSIVE_ABILITIES,
} from "../constants";
import Filter from "../lib/filter";
import { Gear } from "../lib/gear";
import { GEAR_NAME_TO_DATA } from "../lib/geardata";
import { mapGetWithDefault, sleep } from "../lib/shared_utils";

import { abilityIcons } from "../public/icons/abilities";
import { brandIcons } from "../public/icons/brands";
import { typeIcons } from "../public/icons/gear-type";
import styles from "../styles/filter.module.css";
import { DefaultPageProps } from "./_app";

const MAKE_USER_ATTEMPTS = 3;
const REQUEST_DELAY_MS = 200;

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

/** Returns a list of exclusive main abilities that should be disabled, based
 * on the currently unselected gear types.
 */
function getDisabledAbilities(currFilter: Filter): string[] {
  let disabledAbilities: string[] = [];
  let allGearTypes = TYPE_EXCLUSIVE_ABILITIES.keys();

  for (let gearType of allGearTypes) {
    if (currFilter.gearTypes.indexOf(gearType) === -1 && (currFilter.gearTypes.length !== 0)) {
      disabledAbilities = [...disabledAbilities, ...mapGetWithDefault(TYPE_EXCLUSIVE_ABILITIES, gearType, [])];
    }
  }
  return disabledAbilities;
}

// ============
// Page Content
// ============
export default function FilterPage({
	userCode,
	setUserCode,
	editingFilterIndex,
	userFilters,
  setIsUserNew,
	setUserFilters,
}: DefaultPageProps) {
	let initAbilities, initBrands, initTypes;
	let initCanSaveFilter;
	let initFilter = new Filter();

  if (editingFilterIndex !== null && userFilters) {
    initFilter = userFilters[editingFilterIndex];
  }

	// Load current filter properties
  if (userFilters && editingFilterIndex !== null) {
		// Have existing filter, populate values in page state.
		initAbilities = selectedListToMap(GEAR_ABILITIES, initFilter.gearAbilities);
		initBrands = selectedListToMap(GEAR_BRANDS, initFilter.gearBrands);
		initTypes = selectedListToMap(GEAR_TYPES, initFilter.gearTypes);
		initCanSaveFilter = true;
	} else {
		// Making a new filter from scratch, so use defaults for abilities, etc.
		// We use the GEAR_ABILITIES, etc. constants as keys in the map.
		initAbilities = makeSelectedMap(GEAR_ABILITIES);
		initBrands = makeSelectedMap(GEAR_BRANDS);
		initTypes = makeSelectedMap(GEAR_TYPES);
		initCanSaveFilter = false;
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
	const [isSaving, setIsSaving] = useState(false);

	// Update the filter values using new state. This is called whenever
	// a selection is changed on the page.
	const updateFilter = (category: GEAR_PROPERTY, newValue: any) => {
		let newGearName = selectedGearName;
		let newRarity = selectedRarity;
		let newAbilities = selectedAbilities;
		let newBrands = selectedBrands;
		let newTypes = selectedTypes;

		// either ability, brand, or gear types.
		if (category === GEAR_PROPERTY.ABILITY) {
			setSelectedAbilities(newValue);
			newAbilities = newValue;
		} else if (category === GEAR_PROPERTY.BRAND) {
			setSelectedBrands(newValue);
			newBrands = newValue;
		} else if (category === GEAR_PROPERTY.TYPE) {
			setSelectedTypes(newValue);
			newTypes = newValue;
		} else if (category === GEAR_PROPERTY.NAME) {
			setSelectedGearName(newValue);
			newGearName = newValue;
		} else if (category === GEAR_PROPERTY.RARITY) {
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
    newFilter.gearAbilities = selectedMapToList(newAbilities);
    // Remove exclusive abilities if they aren't currently selected.
    let disabledAbilities = getDisabledAbilities(newFilter);
    newFilter.gearAbilities = newFilter.gearAbilities.filter((ability) => !disabledAbilities.includes(ability));

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
			let tempUserCode = userCode; // used because usercode state updates late
			if (!tempUserCode) {
				// Try making a new user. If it doesn't work, display an error message.
				for (let attempts = MAKE_USER_ATTEMPTS; attempts > 0 && !tempUserCode; attempts--) {
          try {
            let response = await fetch(`/api/new-user`);
            if (response.status == 200) {
              tempUserCode = await response.json();
              setUserCode(tempUserCode); // store new code
              setIsUserNew(true);  // mark that we made a new user
              break;
            } else {
              await sleep(REQUEST_DELAY_MS);
            }
          } catch (e) {
            console.log(e);
          }
				}
				if (!tempUserCode) {
					// We were not able to make a new user code.
					toast.error(FE_UNKNOWN_MSG);
					setIsSaving(false);
					return;
				}
			}

			let responseCode = 0;
			if (editingFilterIndex !== null && userFilters) {
				// we are editing an existing filter, must update
				responseCode = await tryUpdateFilter(
					tempUserCode,
					currFilter,
					userFilters[editingFilterIndex]
				);
			} else {
				// we are making a new filter
				responseCode = await trySaveFilter(tempUserCode, currFilter);
			}
			if (responseCode == 200) {
        // Modify filter list so we don't need to reload user data
        if (editingFilterIndex !== null && userFilters) {  // editing existing
          if (userFilters[editingFilterIndex] === currFilter) {
            // No change to filter, so no changes are made
          } else {  // We replaced a filter.
            // Delete the old filter and insert the newest filter
            let newUserFilters = [...userFilters] 
            newUserFilters.splice(editingFilterIndex, 1);
            newUserFilters.splice(0, 0, currFilter);
            setUserFilters(newUserFilters);
          }
        } else {
          // We are making a new filter
          let newUserFilters: Filter[] = [];
          if (userFilters) {
            newUserFilters = [...userFilters];
          }
          newUserFilters.splice(0, 0, currFilter);
          setUserFilters(newUserFilters);
        }

        // Successfully saved; return to main page
				toast.success("Filter saved.");
				setPageSwitchReady(true);

			} else {
        // Some error occurred while saving.
        toast.error(FE_UNKNOWN_MSG + " (error: " + responseCode + ")");
				setIsSaving(false);
				return;
			}
		}
    // Run our async method
		setIsSaving(true);
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

  // Memoize the selection callback to prevent unnecessary rerenders.
  const onGearSelection = useMemo(() => {
    return (selectedGear: Gear) => {
      updateFilter(GEAR_PROPERTY.NAME, selectedGear.name);
      setShowGearSelection(false);
    };
  }, []);


	return (
		<div className={styles.main}>
			<Head>Splatnet Shop Alerts</Head>
			<h1>New Filter</h1>
			<p>Select the gear properties you want to be alerted for.</p>
      
			<LoadingButton
				onClick={() => {
					setShowGearSelection(true);
				}}
        loading={showGearSelection}
			>
				Select Gear (optional)
			</LoadingButton>
      <LoadingButton onClick={
        () => {updateFilter(GEAR_PROPERTY.NAME, "")}
        }
      >
        Clear
      </LoadingButton>
      
      <LabeledAlertbox
        header="Select Gear"
        onClickClose={() => setShowGearSelection(false)}
        visible={showGearSelection}
      >
        <>
          <GearSelector
            onSelection={onGearSelection}
          />
          <button onClick={() => setShowGearSelection(false)}>Cancel</button>
        </>
      </LabeledAlertbox>

			<div className={styles.selectorGroup}>
				<div className={styles.selectorContainer}>
					<Selector
						title={"Types"}
						category={GEAR_PROPERTY.TYPE}
						items={Array.from(selectedTypes.keys())}
						selected={selectedTypes}
						itemImages={typeIcons}
						useWildcard={true}
						onChanged={(newSelected: Map<string, boolean>) => {
							updateFilter(GEAR_PROPERTY.TYPE, newSelected);
						}}
						selectionOverride={GEAR_NAME_TO_DATA.get(selectedGearName)?.type}
					/>
				</div>
				<div className={styles.selectorContainer}>
					<Selector
						title={"Brands"}
						category={GEAR_PROPERTY.BRAND}
						items={Array.from(selectedBrands.keys())}
						selected={selectedBrands}
						useWildcard={true}
						itemImages={brandIcons}
						onChanged={(newSelected: Map<string, boolean>) => {
							updateFilter(GEAR_PROPERTY.BRAND, newSelected);
						}}
						selectionOverride={GEAR_NAME_TO_DATA.get(selectedGearName)?.brand}
					/>
				</div>
				<div className={styles.selectorContainer}>
					<Selector
						title={"Abilities"}
						category={GEAR_PROPERTY.ABILITY}
						items={Array.from(selectedAbilities.keys())}
						selected={selectedAbilities}
						useWildcard={true}
						itemImages={abilityIcons}
						onChanged={(newSelected: Map<string, boolean>) => {
							updateFilter(GEAR_PROPERTY.ABILITY, newSelected);
						}}
            disabledItems={new Set<string>(getDisabledAbilities(currFilter))}
					/>
				</div>
			</div>
			<br />
			<div
				style={{ minWidth: "fit-content", width: "80vmin", margin: "0 auto" }}
			>
				<div className={styles.filterViewContainer}>
					<FilterView
						filter={currFilter}
						brandsSelected={hasSelection(selectedBrands)}
						abilitiesSelected={hasSelection(selectedAbilities)}
						typesSelected={hasSelection(selectedTypes)}
					/>
				</div>
				<br />
				<div
					style={{
						display: "flex",
						flexDirection: "row",
						gap: "20px",
						flexWrap: "wrap",
						width: "100%",
						justifyContent: "space-between",
					}}
				>
					<Link href="/">
						<button style={{ width: "fit-content" }}>
							<div style={{ width: "25vmin" }}>Cancel</div>
						</button>
					</Link>
					<LoadingButton
						onClick={onClickSave}
						disabled={!canSaveFilter}
						loading={isSaving}
					>
						<div style={{ width: "25vmin" }}>Save</div>
					</LoadingButton>
				</div>
			</div>
		</div>
	);
}
