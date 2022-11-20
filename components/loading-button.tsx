import { loadingIcon } from "../public/icons/utils";
import Image from "next/image";
import styles from "./loading-button.module.css";

type LoadingButtonProps = {
	children?: React.ReactNode;
	loading?: boolean;
	disabled?: boolean;
	onClick?: CallableFunction;
	buttonStyle?: ButtonStyle;
  style?: any;
};

export enum ButtonStyle {
	DEFAULT = "button",
	ICON = "buttonIcon",
  FILL = "buttonFill"
}

/** Shows a loading animation when loading is set to true.
 * Note: Disables onClick behavior when loading.
 */
export default function LoadingButton({
	children,
	loading = false,
	disabled = false,
	onClick,
  style,
	buttonStyle = ButtonStyle.DEFAULT,
}: LoadingButtonProps) {
	return (
		<div>
			<button
				className={styles[buttonStyle]}
				disabled={disabled}
				onClick={() => {
          if (onClick) {
					  loading ? null : onClick();
          }
				}}
        style={style}
			>
				<div className={loading ? styles.hidden : ""}>{children}</div>
				<div
					className={`${styles.loadingIcon} ${loading ? "" : styles.hidden}`}
				>
					<Image src={loadingIcon} width={50} height={50} layout="fill" />
				</div>
			</button>
		</div>
	);
}
