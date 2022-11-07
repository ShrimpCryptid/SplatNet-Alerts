import { FunctionComponent, MouseEventHandler } from "react";
import Image from "next/image";

import Filter from "../lib/filter";
import { mapGetWithDefault } from "../lib/utils";

import { unknownIcon, noneIcon } from "../public/icons/utils";
import { abilityIcons } from "../public/icons/abilities";
import { brandIcons } from "../public/icons/brands";
import { typeIcons, GEAR_TYPE_ANY_ICON } from "../public/icons/gear-type";

import styles from "./filter-view.module.css";
import { RarityMeter } from "./rarity_meter";

const ABILITY_ICON_WIDTH = 45;
const BRAND_ICON_LIST_WIDTH = 45;
const BRAND_ICON_WIDTH = 40;
const GEAR_TYPE_WIDTH = 150;

type Props = {
	filter: Filter;
	filterID?: number;
	onClick?: MouseEventHandler;

	// Whether to show an alternative X symbol for brands, abilities, and types
	// when they are unselected. All true by default.
	brandsSelected?: boolean;
	abilitiesSelected?: boolean;
	typesSelected?: boolean;
};

const FilterView: FunctionComponent<Props> = ({
	filter,
	filterID,
	onClick,
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
		// TODO: Gear images
		iconURL =
			"https://cdn.wikimg.net/en/splatoonwiki/images/1/1c/S3_Gear_Clothing_Annaki_Flannel_Hoodie.png";

		// Gear item has a specific name, so we show it
		gearNameElements = (
			<div className={styles.gearNameContainer}>
				<Image
					className={styles.brandIcon}
					src={mapGetWithDefault(brandIcons, filter.gearBrands[0], unknownIcon)}
					width={BRAND_ICON_WIDTH}
					height={BRAND_ICON_WIDTH}
					layout={"fixed"}
				/>
				<h2 className={styles.gearNameLabel}>{filter.gearName}</h2>
			</div>
		);
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

		// Override icon if no type is defined
		if (!typesSelected) {
			iconURL = noneIcon;
		}

		brandElements = <h3 className={styles.categoryLabel}>Brands</h3>;
		// Render list of brands
		if (filter.gearBrands.length == 0) {
			// any brand acceptable, so show unknown icon
			brandElements = (
				<>
					{brandElements}
					<div className={styles.brandIconContainer}>
						<Image
							className={styles.abilityIcon}
							src={brandsSelected ? unknownIcon : noneIcon}
							width={BRAND_ICON_LIST_WIDTH}
							height={BRAND_ICON_LIST_WIDTH}
							layout={"fixed"}
						/>
					</div>
				</>
			);
		} else {
			brandElements = (
				<>
					{brandElements}
					<div className={styles.brandIconContainer}>
						{filter.gearBrands.map((value, index) => {
							return (
								<Image
									className={styles.brandIconList}
									src={mapGetWithDefault(brandIcons, value, unknownIcon)}
									width={BRAND_ICON_LIST_WIDTH}
									height={BRAND_ICON_LIST_WIDTH}
									layout={"fixed"}
								/>
							);
						})}
					</div>
				</>
			);
		}
	} // End Gear Types, Images, and Brands

	// ABILITIES SECTION
	// Show unknown icon if any ability will work
	if (filter.gearAbilities.length == 0) {
		abilityElements = (
			<>
				<Image
					className={styles.abilityIcon}
					src={abilitiesSelected ? unknownIcon : noneIcon}
					width={ABILITY_ICON_WIDTH}
					height={ABILITY_ICON_WIDTH}
					layout={"fixed"}
				/>
			</>
		);
	} else {
		abilityElements = filter.gearAbilities.map((item, index) => {
			return (
				<Image
					key={index}
					className={styles.abilityIcon}
					src={mapGetWithDefault(abilityIcons, item, unknownIcon)}
					width={ABILITY_ICON_WIDTH}
					height={ABILITY_ICON_WIDTH}
					layout={"fixed"}
					quality={100}
				/>
			);
		});
	}

	return (
		<div className={styles.container}>
			<div className={styles.lcontainer}>
				{onClick ? <button onClick={onClick}>Edit</button> : <></>}
				<Image
					className={styles.gearIcon}
					src={iconURL}
					width={GEAR_TYPE_WIDTH}
					height={GEAR_TYPE_WIDTH}
				/>
				<div className={styles.rarityMeter}>
					<RarityMeter
						minRarity={filter.minimumRarity}
						maxRarity={filter.minimumRarity}
					/>
				</div>
			</div>
			<div className={styles.rcontainer}>
				{gearNameElements}
				{brandElements}

				<h3 className={styles.categoryLabel}>Abilities</h3>
				<div className={styles.abilityIconContainer}>{abilityElements}</div>
			</div>
		</div>
	);
};

export default FilterView;
