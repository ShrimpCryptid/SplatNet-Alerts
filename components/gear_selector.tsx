import React, { FunctionComponent, useEffect, useState } from "react";
import { Gear } from "../lib/gear";
import styles from './gear_selector.module.css';
import Fuse from 'fuse.js';
import Image from "next/image";
import { unknownIcon } from "../public/icons/utils";
import { brandIcons } from "../public/icons/brands";
import { mapGetWithDefault } from "../lib/utils";

type GearSelectorProps = {
  onSelection: (selectedGear: Gear) => void,
  gearData: Map<string, Gear>
}

const GearSelector: FunctionComponent<GearSelectorProps> = ({onSelection, gearData}) => {
  const gearArray = [...gearData.values()];
  const [searchText, setSearchText] = useState("");
  const [filteredGear, setFilteredGear] = useState([...gearData.values()]);

  // Set up fuzzy search
  const searchOptions = {
    shouldSort: true,  // sort by result accuracy
    keys: ["name", "brand"],
    threshold: 0.5
  }
  const fuzzySearcher = new Fuse([...gearData.values()], searchOptions);

  const searchGear = async (newSearchText: string) => {

  }

  const handleSearchChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newSearchText = event.currentTarget.value;
    setSearchText(newSearchText);
    searchGear(newSearchText);
    // Filter the gear so only certain items are included.
    if (newSearchText === "") {
      setFilteredGear([...gearData.values()]);
    } else {
      let searchResults = fuzzySearcher.search(newSearchText);
      setFilteredGear(searchResults.map((result) => {return result.item}));
    }
  }

  return (
    <div className={styles.container}>
      <div className={"inputContainer"}>
        <input
          value={searchText}
          onChange={handleSearchChanged}
        />
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
    </div>
  );
}
export default GearSelector;