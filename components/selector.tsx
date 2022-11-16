import styles from "./selector.module.css";
import { FunctionComponent } from "react";
import Image, { StaticImageData } from "next/image";
import { FE_WILDCARD, GEAR_PROPERTY } from "../constants";
import { mapGetWithDefault } from "../lib/utils";
import { unknownIcon } from "../public/icons/utils";

type SelectorItemProps = {
	id: number;
	category: GEAR_PROPERTY;
	name: string;
	selected?: boolean;
	disabled?: boolean;
	imageUrl?: string;
	image?: any;
	onClick: CallableFunction;
};

/** A single selectable item entry, for internal use in a list Selector. */
const SelectorItem: FunctionComponent<SelectorItemProps> = ({
	id,
	category,
	name,
	selected,
	disabled,
	imageUrl,
	image,
	onClick,
}) => {
	// Use unknownIcon if both url and image source are undefined
	let imageSrc = imageUrl ? imageUrl : image ? image : unknownIcon;

	let className = `${styles.itemContainer} ${selected ? styles.selected : ""} ${
		disabled ? styles.disabled : ""
	}`;

	let onClickCallback = () => {
		if (!disabled) {
			onClick(id);
		}
	};

	return (
		<div className={className} onClick={onClickCallback} key={`${id}-${selected}`}>
			<Image
				className={`${styles.itemIcon} ${styles[category]}`}
				src={imageSrc}
				alt={name}
				layout={"fixed"}
				height={"50px"}
				width={"50px"}
			/>
			<div className={styles.itemLabelContainer}>
				<h3 className={styles.itemLabelText}>{name}</h3>
			</div>
		</div>
	);
};

type SelectorProps = {
	title?: string;
	category: GEAR_PROPERTY;
	items: string[];
	selected: Map<string, boolean>;
	itemImages?: Map<string, StaticImageData|string|undefined>;
	wildcard?: boolean;
	search?: boolean;
	onChanged?: CallableFunction;
};

function countSelected(selections: Map<string, boolean>): number {
	if (mapGetWithDefault(selections, FE_WILDCARD, false)) {
		// Wildcard (any) is selected, return one minus total number of selections
		return selections.size - 1;
	}
	// Count number of true values
	let count = 0;
	for (let value of selections.values()) {
		count += value ? 1 : 0;
	}
	return count;
}

/**
 * Displays a list of selectable items with image icons. Includes optional
 *  behavior for wildcard/Any selections. 
*/
const Selector: FunctionComponent<SelectorProps> = ({
	title,
	category,
	items,
	selected,
	itemImages,
	wildcard,
	search,
	onChanged,
}) => {
	// check if items includes wildcard. if not, insert into our list of items and map of what
	// items are selected.
	if (wildcard && items.indexOf(FE_WILDCARD) !== 0) {
		items = [FE_WILDCARD].concat(items);
		if (!selected.has(FE_WILDCARD)) {
			let newSelected = new Map(selected);
			newSelected.set(FE_WILDCARD, true);
			if (onChanged) {
				onChanged(newSelected);
			} // update map upstream
		}
	}

	const onClick = (id: number) => {
		// invert selection for clicked item, then return new state via callback.
		// MUST make a copy here or React won't recognize a change.
		let newSelected = new Map(selected); // copy map
		let item = items[id];
		newSelected.set(item, !selected.get(item));

		if (onChanged) {
			onChanged(newSelected);
		}
	};

	// Count number of selected values
	let selectedCount = 0;
	let itemTotal = items.length - (wildcard ? 1 : 0); // ignore wildcard
	for (let value in selected.values()) {
		selectedCount += value ? 1 : 0;
	}

	return (
		<div>
			<h2 className={styles.categoryLabel}>
				{title} ({countSelected(selected)}/{itemTotal})
			</h2>
			<div className={styles.itemDisplay}>
				{items.map((item, index) => {
					// Wildcard formatting
					let itemCategory = category;
					if (wildcard && index == 0) {
						itemCategory = GEAR_PROPERTY.ABILITY;
					}

					let isSelected = selected.get(item);
					let disabled = false;
					// Disable every other item if wildcard is active and selected.
					if (wildcard && selected.get(FE_WILDCARD) && index !== 0) {
						isSelected = false;
						disabled = true;
					}

					let image = null;
					if (itemImages) {
						image = itemImages.get(item);
					}
          if (image === undefined || image === null) {
              // Show default image
              itemCategory = GEAR_PROPERTY.ABILITY;  // formatting style
              image = unknownIcon;
          }

					return (
						<SelectorItem
              key={index}
							id={index}
							category={itemCategory}
							name={item}
							image={image}
							selected={isSelected}
							disabled={disabled}
							onClick={onClick}
						/>
					);
				})}
			</div>
		</div>
	);
};

export default Selector;
