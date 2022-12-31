import React, { FunctionComponent, useMemo, useState } from "react";
import { Gear } from "../lib/gear";
import styles from "./gear_selector.module.css";
import Fuse from "fuse.js";
import Image from "next/image";
import { unknownIcon } from "../public/icons/utils";
import { brandIcons } from "../public/icons/brands";
import { mapGetWithDefault } from "../lib/shared_utils";
import { GEAR_NAME_TO_DATA } from "../lib/geardata";

type GearSelectorProps = {
	onSelection: (selectedGear: Gear) => void;
};

/**
 * Returns a JSX Element with an image and title for the given gear item.
 */
function renderGear(gear: Gear, onSelection: CallableFunction) { 
  return (
    <div
      className={styles.listItem}
      onClick={() => onSelection(gear)}
      key={gear.name}
    >
      <div className={styles.listItemImageContainer}>
        <div className={styles.listItemGearIcon}>
          <Image
            src={gear.image !== "" ? gear.image : unknownIcon}
            layout={"fill"}
          />
        </div>
        <div className={styles.listItemBrandIcon}>
          <Image
            src={mapGetWithDefault(
              brandIcons,
              gear.brand,
              unknownIcon
            )}
            layout={"fill"}
          />
        </div>
      </div>
      <p className={styles.listItemLabel}>{gear.name}</p>
    </div>
  );
}

const GearSelector: FunctionComponent<GearSelectorProps> = ({
	onSelection,
}) => {
	const gearArray = [...GEAR_NAME_TO_DATA.values()];
	const [searchText, setSearchText] = useState("");

  const [isRenderingGear, setIsRenderingGear] = useState(false);
  const [renderedGearList, setRenderedGearList] = useState(<></>);
  const [fullRenderedGearList, setFullRenderedGearList] = useState(
    useMemo(() => {  // Optimization for the searchbar
      return (
        <>
          {[...GEAR_NAME_TO_DATA.values()].map((gear) => renderGear(gear, onSelection))}
        </>
      )
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
      filteredGear = searchResults.map((result) => { return result.item; });

      // Render all of the gear as items in a displayable list.
      setRenderedGearList(
        <>
          {filteredGear.map((gear) => renderGear(gear, onSelection))}
        </>
      );
      setIsRenderingGear(false);
    };

    if (searchText === newSearchText) {  // Skip update if no changes made.
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
				<div className={styles.list} style={{display: showFullList ? "grid" : "none"}}>
          {fullRenderedGearList}
				</div>
        <div className={styles.list} style={{display: showFullList ? "none" : "grid"}}>
          {renderedGearList}
        </div>
    </div>
      
		</div>
	);
};
export default GearSelector;
