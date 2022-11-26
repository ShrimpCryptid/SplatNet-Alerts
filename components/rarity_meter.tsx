import { FunctionComponent } from "react";
import Image from "next/image";

import styles from "./rarity_meter.module.css";
import { unknownIcon } from "../public/icons/utils";
import { GEAR_RARITY_MAX, GEAR_RARITY_MIN } from "../constants";

type Props = {
	minRarity: number;
	maxRarity: number;
};

export const RarityMeter: FunctionComponent<Props> = ({
	minRarity,
	maxRarity,
}) => {
	let elements = (
		<div className={styles.bigIconContainer}>
			<Image
				className={`${styles.bigIcon}`}
				src={unknownIcon}
				layout={"fill"}
			/>
		</div>
	);

	for (let i = GEAR_RARITY_MIN; i <= GEAR_RARITY_MAX; i++) {
		let iconStyle;
		if (i <= minRarity) {
			iconStyle = "";
		} else if (minRarity < i && i <= maxRarity) {
			iconStyle = styles.outline;
		} else if (maxRarity < i) {
			iconStyle = styles.hide;
		}
		elements = (
			<>
				{elements}
				<div className={`${styles.smallIconContainer} ${iconStyle}`}>
					<Image
						className={`${styles.smallIcon} ${iconStyle}`}
						src={unknownIcon}
						layout={"fill"}
					/>
				</div>
			</>
		);
	}

	return <div className={styles.iconContainer}>{elements}</div>;
};
