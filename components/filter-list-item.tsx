import Filter from "../lib/filter";
import styles from "./filter-list-item.module.css";
import { FunctionComponent } from "react";
import { placeholder } from "../public/icons/gear";
import unknownIcon from "../public/icons/unknown.png";
import { abilityIcons } from "../public/icons/abilities";
import { brandIcons } from "../public/icons/brands";
import Image from "next/image";
import { mapGetWithDefault } from '../lib/utils';

type Props = {
	filter: Filter;
	filterID: number;
	onClick: CallableFunction;
};

const FilterListItem: FunctionComponent<Props> = ({ filter, filterID, onClick }) => {
	let iconURL, iconAlt;
	let brands, abilities;
	let isItem = filter.gearName !== "";
	iconURL =
		"https://cdn.wikimg.net/en/splatoonwiki/images/1/1c/S3_Gear_Clothing_Annaki_Flannel_Hoodie.png";

	if (isItem) {
		// get item url
	} else {

	}

	// Show unknown icon if any aiblity will work
	if (filter.gearAbilities.length == 0) {
		abilities = (
			<>
				<Image
					className={styles.abilityIcon}
					src={unknownIcon}
					width={45}
					height={45}
					layout={"fixed"}
				/>
			</>
		);
	} else {
		abilities = filter.gearAbilities.map((item, index) => {
			return (
				<Image
					className={styles.abilityIcon}
					src={mapGetWithDefault(abilityIcons, item, unknownIcon)}
					width={45}
					height={45}
					layout={"fixed"}
				/>
			);
		});
	}

	return (
		<div className={styles.container}>
			<div className={styles.lcontainer}>
				<Image src={iconURL} width={150} height={150} />
			</div>
			<div className={styles.rcontainer}>
				<div className={styles.gearNameContainer}>
					<Image
						className={styles.brandIcon}
						src={mapGetWithDefault(brandIcons, filter.gearBrands[0], unknownIcon)}
						width={56}
						height={56}
						layout={"fixed"}
					/>
					<h2>{filter.gearName}</h2>
				</div>
				<h3 className={styles.categoryLabel} >Brands</h3>

				<h3 className={styles.categoryLabel}>Abilities</h3>
				<div className={styles.abilityIconContainer}>
					{abilities}
				</div>
			</div>
		</div>
	);
};

export default FilterListItem;
