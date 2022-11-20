import React, { FunctionComponent, useEffect, useState } from "react";
import { Gear } from "../lib/gear";
import styles from './gear_selector.module.css';
import Fuse from 'fuse.js';
import Image from "next/image";
import { unknownIcon } from "../public/icons/utils";
import { brandIcons } from "../public/icons/brands";
import { mapGetWithDefault } from "../lib/shared_utils";

type GearSelectorProps = {
  onSelection: (selectedGear: Gear) => void,
  onClickClose: any,
  gearData: Map<string, Gear>
}

const GearSelector: FunctionComponent<GearSelectorProps> = ({onSelection, onClickClose, gearData}) => {
  const gearArray = [...gearData.values()];
  const [searchText, setSearchText] = useState("");
  const [filteredGear, setFilteredGear] = useState([...gearData.values()]);

  // Set up fuzzy search
  // TODO: Combine both name and brand in searches? https://stackoverflow.com/questions/47436817/search-in-two-properties-using-one-search-query
  const searchOptions = {
    shouldSort: true,  // sort by result accuracy
    keys: ["name", "brand"],
    threshold: 0.4
  }
  const fuzzySearcher = new Fuse([...gearData.values()], searchOptions);

  const handleSearchChanged = (newSearchText: string) => {
    setSearchText(newSearchText);
    // Filter the gear so only certain items are included.
    if (newSearchText.replaceAll(" ", "") === "") {
      setFilteredGear([...gearData.values()]);
    } else {
      // Modify search text so it doesn't include spaces-- this can cause
      // unexpected behavior because the fuse searcher will try to match with it
      let searchTextNoSpace = newSearchText.replaceAll(" ", "");
      let searchResults = fuzzySearcher.search(searchTextNoSpace);
      setFilteredGear(searchResults.map((result) => {return result.item}));
    }
  }

  return (
    <div className={styles.container}>
      <div className={`inputContainer ${styles.searchbar}`}>
        <span className="material-symbols-rounded">search</span>
        <input
          value={searchText}
          onChange={(event) => {handleSearchChanged(event.currentTarget.value)}}
        />
        <div
          className={`${styles.clearSearchButton} ${searchText === "" ? styles.hidden : ""}`}
          role={"button"}
        >
          <span className="material-symbols-rounded md-dark" onClick={() => {handleSearchChanged("")}}>close</span>
        </div>
      </div>
      <div className={styles.listContainer}>
        <div className={styles.list}>
          {filteredGear.map((gear) => {
            // Render gear 
            return (
            <div
              className={styles.listItem}
              onClick={() => onSelection(gear)}
            >
              <div className={styles.listItemImageContainer}> 
                <div className={styles.listItemGearIcon}>
                  <Image
                    src={gear.image !== "" ? gear.image : unknownIcon}
                    layout={"fill"}
                    height={"100px"}
                    width={"100px"}
                  />
                </div>
                <div className={styles.listItemBrandIcon}>
                  <Image
                    src={mapGetWithDefault(brandIcons, gear.brand, unknownIcon)}
                    layout={"fill"}
                    height={"50px"}
                    width={"50px"}
                  />
                </div>
              </div>
              <p className={styles.listItemLabel}>{gear.name}</p>
            </div>
            )
          })}
        </div>
      </div>
      <button onClick={onClickClose}>Cancel</button>
    </div>
  );
}
export default GearSelector;