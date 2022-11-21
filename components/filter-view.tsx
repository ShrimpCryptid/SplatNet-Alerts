import { FunctionComponent, MouseEventHandler } from "react";
import Image from "next/image";

import Filter from "../lib/filter";
import { mapGetWithDefault } from "../lib/shared_utils";

import { unknownIcon, noneIcon } from "../public/icons/utils";
import { abilityIcons } from "../public/icons/abilities";
import { brandIcons } from "../public/icons/brands";
import { typeIcons, GEAR_TYPE_ANY_ICON } from "../public/icons/gear-type";

import styles from "./filter-view.module.css";
import { RarityMeter } from "./rarity_meter";
import { GEAR_NAME_TO_IMAGE } from "../constants";
import LoadingButton, { ButtonStyle } from "./loading-button";

const ABILITY_ICON_WIDTH = 49;
const BRAND_ICON_LIST_WIDTH = 49;
const BRAND_ICON_WIDTH = 40;
const GEAR_TYPE_WIDTH = 150;

type Props = {
	filter: Filter;
	filterID?: number;

	onClickEdit?: MouseEventHandler;
	onClickDelete?: MouseEventHandler;
	awaitingDelete?: boolean;
	awaitingEdit?: boolean;

	// Whether to show an alternative X symbol for brands, abilities, and types
	// when they are unselected. All true by default.
	brandsSelected?: boolean;
	abilitiesSelected?: boolean;
	typesSelected?: boolean;
};

const FilterView: FunctionComponent<Props> = ({
	filter,
	awaitingDelete = false,
	awaitingEdit = false,
	onClickEdit,
	onClickDelete,
	brandsSelected = true,
	abilitiesSelected = true,
	typesSelected = true,
}) => {
	let iconURL, iconAlt;
	let gearImageElements, gearNameElements, brandElements, abilityElements;
	let isItem = filter.gearName !== "";

	// GEAR TYPE, IMAGE, AND BRANDS
	if (isItem) {
		// Gear has a specific image, so show it here
		iconURL = mapGetWithDefault(
			GEAR_NAME_TO_IMAGE,
			filter.gearName,
			unknownIcon
		);

		// Gear item has a specific name, so we show it
		gearNameElements = (<h3 className={styles.gearNameLabel}>{filter.gearName}</h3>);
	} else {
		// Filter is by gear TYPE, not a specific item.
		if (filter.gearTypes.length == 0 || filter.gearTypes.length == 3) {
			iconURL = GEAR_TYPE_ANY_ICON;
		} else if (filter.gearTypes.length == 1) {
			iconURL = mapGetWithDefault(
				typeIcons,
				filter.gearTypes[0],
				GEAR_TYPE_ANY_ICON
			);
		} else {
			// 2 types
			iconURL = mapGetWithDefault(
				typeIcons,
				filter.gearTypes[0] + filter.gearTypes[1],
				GEAR_TYPE_ANY_ICON
			);
		}
    // Put brands name inside of the gear name elements for formatting (matches
    // up nicely with the edit/delete buttons)
    gearNameElements = <h3 className={styles.categoryLabel}>Brands</h3>

		// Override icon if no type is defined
		if (!typesSelected) {
			iconURL = noneIcon;
		}

		// Render list of brands
		if (filter.gearBrands.length == 0) {
			// any brand acceptable, so show unknown icon
			brandElements = (
				<>
					<div className={styles.brandIconContainer}>
            <div className={styles.abilityIcon}>
              <Image
                src={brandsSelected ? unknownIcon : noneIcon}
                layout={"fill"}
              />
              </div>
					</div>
				</>
			);
		} else {
			brandElements = (
				<>
					<div className={styles.brandIconContainer}>
						{filter.gearBrands.map((value, index) => {
							return (
                <div className={styles.brandIcon} key={index}>
                  <Image
                    src={mapGetWithDefault(brandIcons, value, unknownIcon)}
                    layout={"fill"}
                  />
                </div>
							);
						})}
					</div>
				</>
			);
		}
	} // End Gear Types, Images, and Brands

	// ABILITIES SECTION
	if (filter.gearAbilities.length == 0) {
    // Show unknown icon if any ability will work
		abilityElements = (
			<div className={styles.abilityIcon}>
				<Image
					key={0}
					src={abilitiesSelected ? unknownIcon : noneIcon}
					layout={"fill"}
				/>
			</div>
		);
	} else {
    // Show full list of abilities, with images for each.
		abilityElements = filter.gearAbilities.map((item, index) => {
			return (
        <div className={styles.abilityIcon}>
          <Image
            key={index}
            src={mapGetWithDefault(abilityIcons, item, unknownIcon)}
            layout={"fill"}
          />
        </div>
			);
		});
	}

	return (
		<div className={styles.container}>
			<div className={styles.lcontainer}>
        <div className={styles.gearIcon}>
          <Image
            src={iconURL}
            layout={"fill"}
          />
          <div className={styles.gearIconBrand}
               style={{visibility: isItem ? "visible" : "hidden"}}
          >
            <Image
              src={mapGetWithDefault(brandIcons, filter.gearBrands[0], unknownIcon)}
              layout={"fill"}
            />
          </div>
        </div>
				<div className={styles.rarityMeter}>
					<RarityMeter
						minRarity={filter.minimumRarity}
						maxRarity={filter.minimumRarity}
					/>
				</div>
			</div>
			<div className={styles.rcontainer}>
        <div className={styles.gearNameContainer}>
          {/** Gear name is either specific gear name OR the 'Brands' label */}
          {gearNameElements}
          <div className={styles.buttonGroup}>
            {onClickEdit ? (
              <LoadingButton onClick={onClickEdit} loading={awaitingEdit} buttonStyle={ButtonStyle.ICON}>
                <span className="material-symbols-rounded">edit_square</span>
              </LoadingButton>
            ) : (
              <></>
            )}
            {onClickDelete ? (
              <LoadingButton onClick={onClickDelete} loading={awaitingDelete} buttonStyle={ButtonStyle.ICON}>
                <span className="material-symbols-rounded">delete</span>
              </LoadingButton>
            ) : (
              <></>
            )}
          </div>
        </div>
				{brandElements}

				<h3 className={styles.categoryLabel}>Abilities</h3>
				<div className={styles.abilityIconContainer}>{abilityElements}</div>
			</div>
		</div>
	);
};

export default FilterView;
