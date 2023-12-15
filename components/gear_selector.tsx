import React, {
	FunctionComponent,
	RefObject,
	memo,
	useDeferredValue,
	useEffect,
	useMemo,
	useRef,
	useState,
	useTransition,
} from "react";
import { Gear } from "../lib/gear";
import styles from "./gear_selector.module.css";
import Fuse from "fuse.js";
import Image from "next/image";
import { loadingIcon, unknownIcon } from "../public/icons/utils";
import { brandIcons } from "../public/icons/brands";
import { mapGetWithDefault } from "../lib/shared_utils";
import { GEAR_NAMES, GEAR_NAME_TO_DATA } from "../lib/geardata";
import { makeLink } from "../lib/frontend_utils";
import CollapsibleHelpBox from "./collapsible_box";

type GearTileProps = {
	/** Gear to render. If null or undefined, shows an unknown icon. */
	gear: Gear | null | undefined;
	/** Callback function when clicked. If none is provided, disables hover */
	onSelection?: (selectedGear: Gear) => void;
};

// Memoized to reduce re-renders
export const GearTile: FunctionComponent<GearTileProps> = memo(
	function GearTile(props: GearTileProps) {
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
		const ref = useRef(Date.now());

		// TODO: Replace gear selector divs with buttons for keyboard accessibility
		return (
			<div
				className={styles.listItem + " " + (disabled ? styles.disabled : "")}
				onClick={onSelection}
				key={gearName}
			>
				<div className={styles.listItemImageContainer}>
					<div className={styles.listItemGearIcon}>
						<Image src={imageSrc} layout={"fill"} alt={gearName} />
					</div>

					{gearBrand === "" ? (
						<></>
					) : (
						<div className={styles.listItemBrandIcon}>
							<Image
								src={mapGetWithDefault(brandIcons, gearBrand, unknownIcon)}
								layout={"fill"}
								alt={gearBrand}
							/>
						</div>
					)}
				</div>
				<div className={styles.listItemLabelContainer}>
					<p className={styles.listItemLabel}>{gearName}</p>
				</div>
			</div>
		);
	}
);

type GearListProps = {
	filteredGear: Gear[];
	/** Callback function when clicked. If none is provided, disables hover */
	onSelection?: (selectedGear: Gear) => void;
};

export const GearList: FunctionComponent<GearListProps> = memo(
	function GearList(props: GearListProps) {
		const gearArray = useMemo(() => [...GEAR_NAME_TO_DATA.values()], []);
		const [fullGearList, setFullGearList] = useState(<></>);
		const [isInitiallyRenderingGearList, startInitialGearListRender] =
			useTransition();
		useEffect(() => {
			// Set state asynchronously so we don't block the main render
			startInitialGearListRender(() => {
				setFullGearList(
					<>
						{[...GEAR_NAME_TO_DATA.values()].map((gear) => {
							return (
								<GearTile
									gear={gear}
									onSelection={props.onSelection}
									key={gear.name}
								/>
							);
						})}
					</>
				);
			});
		}, []);
		let showFullList =
			props.filteredGear === undefined ||
			gearArray.length === props.filteredGear.length;

		// The full gear list is always present but is sometimes invisible
		// (display: none) to ensure it appears faster when search is cleared.
		return (
			<>
				<div
					className={styles.list}
					style={{ display: showFullList ? "grid" : "none" }}
				>
					{fullGearList}
				</div>
				{!showFullList ? (
					<div className={styles.list}>
						{props.filteredGear.map((gear) => {
							return <GearTile gear={gear} onSelection={props.onSelection} />;
						})}
					</div>
				) : (
					<></>
				)}
			</>
		);
	}
);

type GearSelectorProps = {
	onSelection: (selectedGear: Gear) => void;
	/** A reference to be assigned to the searchbar, so the parent can access it. */
	searchbarReference?: RefObject<HTMLInputElement>;
};

const GearSelector: FunctionComponent<GearSelectorProps> = ({
	onSelection,
	searchbarReference,
}) => {
	const gearArray = useMemo(() => {
		return [...GEAR_NAME_TO_DATA.values()];
	}, []);
	const [searchText, setSearchText] = useState("");
	const [showMissingItemPrompt, setShowMissingItemPrompt] = useState(false);

	// Using useDeferredValue to deprioritize rendering of the gear lists.
	// This allows React to throw out a re-render process if the search changes
	// again. See https://react.dev/reference/react/useDeferredValue#deferring-re-rendering-for-a-part-of-the-ui
	const [filteredGear, setFilteredGear] = useState<Gear[]>(gearArray);
	const deferredFilteredGear = useDeferredValue(filteredGear);

	// Set up fuzzy search
	// TODO: Combine both name and brand in searches? https://stackoverflow.com/questions/47436817/search-in-two-properties-using-one-search-query
	const searchOptions = {
		shouldSort: true, // sort by result accuracy
		keys: ["name", "brand"],
		threshold: 0.4,
	};
	const fuzzySearcher = new Fuse([...gearArray.values()], searchOptions);

	const handleSearchChanged = (newSearchText: string) => {
		if (searchText === newSearchText) {
			// Skip update if no changes made.
			return;
		} else if (newSearchText.replaceAll(" ", "") === "") {
			// Exit early if the search text is blank
			setFilteredGear(gearArray);
			setSearchText(newSearchText);
			return;
		}

		// Get the new set of items we need to represent.
		let filteredGear;
		// Modify search text so it doesn't include spaces-- this can cause
		// unexpected behavior because the fuse searcher will try to match with it
		let searchTextNoSpace = newSearchText.replaceAll(" ", "");
		let searchResults = fuzzySearcher.search(searchTextNoSpace);
		filteredGear = searchResults.map((result) => {
			return result.item;
		});
		setFilteredGear(filteredGear);
		setSearchText(newSearchText);
	};

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
				{deferredFilteredGear !== filteredGear /** Show loading spinner */ ? (
					<div className={styles.loadingIcon}>
						<div className={styles.loadingFiller}>
							<Image
								src={loadingIcon}
								layout="fill"
								priority={true}
								alt={"Loading"}
							/>
						</div>
					</div>
				) : (
					<></>
				)}
				<GearList
					filteredGear={deferredFilteredGear}
					onSelection={onSelection}
				/>
			</div>

			<CollapsibleHelpBox
				header={"Why are some items missing?"}
				showFullText={showMissingItemPrompt}
				onClick={() => setShowMissingItemPrompt(!showMissingItemPrompt)}
			>
				<p>
					Items that cannot be purchased from the SplatNet store are not shown
					here. This includes gear received from amiibo, Salmon Run,
					Wandercrust, and singleplayer.
					<br />
					<br />
					If an item seems to be incorrectly missing, please submit an{" "}
					{makeLink(
						"issue on GitHub",
						"https://github.com/ShrimpCryptid/SplatNet-Alerts/issues"
					)}
					. You can check the{" "}
					{makeLink("Splatoon Wiki", "https://splatoonwiki.org/wiki/Gear")} for
					a complete list of gear items.
				</p>
			</CollapsibleHelpBox>
		</div>
	);
};
export default GearSelector;
