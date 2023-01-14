import React, { FunctionComponent, RefObject, useMemo, useState } from "react";
import { Gear } from "../lib/gear";
import styles from "./gear_selector.module.css";
import Fuse from "fuse.js";
import Image from "next/image";
import { unknownIcon } from "../public/icons/utils";
import { brandIcons } from "../public/icons/brands";
import { mapGetWithDefault } from "../lib/shared_utils";
import { GEAR_NAME_TO_DATA } from "../lib/geardata";

type GearTileProps = {
	/** Gear to render. If null or undefined, shows an unknown icon. */
	gear: Gear | null | undefined;
	/** Callback function when clicked. If none is provided, disables hover */
	onSelection?: (selectedGear: Gear) => void;
};

export const GearTile: FunctionComponent<GearTileProps> = (
	props: GearTileProps
) => {
	let imageSrc, gearName, gearBrand;
	let onSelection = undefined;

	// onSelection = undefined
	if (props.gear !== null && props.gear !== undefined) {
		imageSrc = props.gear.image !== "" ? props.gear.image : unknownIcon;
		gearName = props.gear.name;
		gearBrand = props.gear.brand;
		if (props.onSelection !== undefined) {
			onSelection = () =>
				props.onSelection?.(props.gear || new Gear()) || undefined;
		}
	} else {
		gearName = "None Selected";
		imageSrc = unknownIcon;
		gearBrand = "";
	}

	let disabled = onSelection === undefined;

  // TODO: Replace gear selector divs with buttons for keyboard accessibility
	return (
		<div
			className={styles.listItem + " " + (disabled ? styles.disabled : "")}
			onClick={onSelection}
			key={gearName}
		>
			<div className={styles.listItemImageContainer}>
				<div className={styles.listItemGearIcon}>
					<Image src={imageSrc} layout={"fill"} />
				</div>

				{gearBrand === "" ? (
					<></>
				) : (
					<div className={styles.listItemBrandIcon}>
						<Image
							src={mapGetWithDefault(brandIcons, gearBrand, unknownIcon)}
							layout={"fill"}
						/>
					</div>
				)}
			</div>
			<div className={styles.listItemLabelContainer}>
				<p className={styles.listItemLabel}>{gearName}</p>
			</div>
		</div>
	);
};

type GearSelectorProps = {
	onSelection: (selectedGear: Gear) => void;
  /** A reference to be assigned to the searchbar, so the parent can access it. */
  searchbarReference?: RefObject<HTMLInputElement>;
};

const GearSelector: FunctionComponent<GearSelectorProps> = ({
	onSelection,
  searchbarReference
}) => {
	const gearArray = [...GEAR_NAME_TO_DATA.values()];
	const [searchText, setSearchText] = useState("");

	const [isRenderingGear, setIsRenderingGear] = useState(false);
	const [renderedGearList, setRenderedGearList] = useState(<></>);
	const [fullRenderedGearList, setFullRenderedGearList] = useState(
		useMemo(() => {
			// Optimization for the searchbar
			return (
				<>
					{[...GEAR_NAME_TO_DATA.values()].map((gear) => {
						return <GearTile gear={gear} onSelection={onSelection} key={gear.name}/>;
					})}
				</>
			);
		}, [onSelection])
	);

	// Set up fuzzy search
	// TODO: Combine both name and brand in searches? https://stackoverflow.com/questions/47436817/search-in-two-properties-using-one-search-query
	const searchOptions = {
		shouldSort: true, // sort by result accuracy
		keys: ["name", "brand"],
		threshold: 0.4,
	};
	const fuzzySearcher = new Fuse([...gearArray.values()], searchOptions);

	const handleSearchChanged = (newSearchText: string) => {
		const updateFilteredGear = async () => {
			// Get the new set of items we need to represent.
			let filteredGear;
			// Modify search text so it doesn't include spaces-- this can cause
			// unexpected behavior because the fuse searcher will try to match with it
			let searchTextNoSpace = newSearchText.replaceAll(" ", "");
			let searchResults = fuzzySearcher.search(searchTextNoSpace);
			filteredGear = searchResults.map((result) => {
				return result.item;
			});

			// Render all of the gear as items in a displayable list.
			setRenderedGearList(
				<>
					{filteredGear.map((gear) => {
						return <GearTile gear={gear} onSelection={onSelection} />;
					})}
				</>
			);
			setIsRenderingGear(false);
		};

		if (searchText === newSearchText) {
			// Skip update if no changes made.
			return;
		} else if (newSearchText.replaceAll(" ", "") === "") {
			// Exit early if the search text is blank
			setSearchText(newSearchText);
			return;
		}

		// Flag that we're currently rendering new gear, and update.
		setIsRenderingGear(true);
		setSearchText(newSearchText);

		// Run the update asynchronously
		updateFilteredGear();
	};

	let showFullList = searchText.replaceAll(" ", "") === "";

	return (
		<div className={styles.container}>
			<div className={`inputContainer ${styles.searchbar}`}>
				<span className="material-symbols-rounded">search</span>
				<input
          ref={searchbarReference}
					value={searchText}
					onChange={(event) => {
						handleSearchChanged(event.currentTarget.value);
					}}
				/>
				<div
					className={`${styles.clearSearchButton} ${
						searchText === "" ? styles.hidden : ""
					}`}
					role={"button"}
				>
					<span
						className="material-symbols-rounded md-dark"
						onClick={() => {
							handleSearchChanged("");
						}}
					>
						close
					</span>
				</div>
			</div>

			<div className={styles.listContainer}>
				<div
					className={styles.list}
					style={{ display: showFullList ? "grid" : "none" }}
				>
					{fullRenderedGearList}
				</div>
				<div
					className={styles.list}
					style={{ display: showFullList ? "none" : "grid" }}
				>
					{renderedGearList}
				</div>
			</div>
		</div>
	);
};
export default GearSelector;
