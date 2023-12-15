import { FunctionComponent } from "react";
import styles from "./switch.module.css";

type Props = {
	state: boolean;
	disabled?: boolean;
	loading?: boolean;
	onToggled: (newState: boolean) => void;
};

const Switch: FunctionComponent<Props> = (props) => {
	let stateClass = "";
	stateClass += props.state ? " " + styles.stateTrue : "";
	stateClass += props.loading ? " " + styles.loading : "";
	stateClass += props.disabled ? " " + styles.disabled : "";

	let containerClass = styles.sliderContainer + stateClass;
	let sliderClass = styles.slider + stateClass;
	return (
		<button
			className={containerClass}
			onClick={() => {
				if (!props.loading && !props.disabled) {
					// Don't toggle for loading or disabled states
					props.onToggled(!props.state);
				}
			}}
		>
			<div className={sliderClass}>
				<div style={{ width: "100%", height: "100%", position: "relative" }}>
					<div className={styles.loadingIcon} />
					<span className={"material-symbols-rounded " + styles.disabledIcon}>
						close
					</span>
				</div>
			</div>
		</button>
	);
};

export default Switch;
