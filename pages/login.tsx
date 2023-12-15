import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import LabeledAlertbox from "../components/alertbox";
import { FE_USER_CODE_URL } from "../constants";
import { isValidUserCode } from "../lib/shared_utils";
import { DefaultPageProps } from "./_app";
import styles from "../styles/login.module.css";
import LoadingButton from "../components/loading-button";
import Image from "next/image";
import { loadingIcon } from "../public/icons/utils";
import Filter from "../lib/filter";

export default function Login({
	userCode,
	setUserCode,
	getUserData,
}: DefaultPageProps) {
	// Wait until we receive the usercode to show the alert box.
	const [showAlertbox, setShowAlertbox] = useState(false);
	const [newUserCode, setNewUserCode] = useState("");
	const [canChangePage, setCanChangePage] = useState(false);

	const [newUserData, setNewUserData] = useState<[Filter[], string] | null>(
		null
	);

	const [useCurrentSelected, setUseCurrentSelected] = useState(false);
	const [useNewSelected, setUseNewSelected] = useState(false);
	const router = useRouter();

	useEffect(() => {
		if (userCode !== undefined && router.isReady) {
			// Wait until app has retrieved user code
			let urlUserCode = router.query[FE_USER_CODE_URL]; // login code is in url

			if (typeof urlUserCode !== "string" || !isValidUserCode(urlUserCode)) {
				router.push("/"); // ignore because user code is unusable
			} else {
				// newUserCode is valid
				// TODO: Check if server has this user registered
				if (urlUserCode === userCode) {
					// No change to user code, so log in user right away.
					router.push("/");
				} else if (urlUserCode && userCode === null) {
					// No usercode is set locally, so we override it.
					setUserCode(urlUserCode);
					router.push("/");
				} else if (urlUserCode && userCode) {
					// There are two usercodes, so check that the user exists and then
					// prompt the user about which one they want to use.
					setNewUserCode(urlUserCode);
					getUserData(urlUserCode).then((result) => {
						if (result == null) {
							// The new user does not exist (or server encountered an error),
							// so ignore them.
							router.push("/");
						} else {
							setNewUserData(result);
							setShowAlertbox(true);
						}
					});
				}
			}
		}
	});

	useEffect(() => {
		if (canChangePage) {
			router.push("/");
		}
	});

	return (
		<div>
			{showAlertbox ? (
				<LabeledAlertbox header="Welcome back!">
					<p>
						It looks like the link you used is from a{" "}
						<b className="highlight">different user account.</b>
						<br />
						Do you want to use your existing user ID, or log in with the new
						one?
					</p>

					<div className={styles.mainContent}>
						<div className={styles.codeContainer}>
							<div style={{ height: "fit-content" }}>
								<h3 style={{ marginBottom: "0" }}>Current user code:</h3>
								<p style={{ marginTop: "0" }} className={styles.usercodeText}>
									{userCode}
								</p>
							</div>
							<div className={styles.buttonDiv}>
								<LoadingButton
									onClick={() => {
										setUseCurrentSelected(true);
										setCanChangePage(true);
									}}
									loading={useCurrentSelected}
									disabled={useNewSelected}
								>
									Use Current
								</LoadingButton>
							</div>
						</div>

						<div className={styles.codeContainer}>
							<div style={{ height: "fit-content" }}>
								<h3 style={{ marginBottom: "0" }}>New user code:</h3>
								<p style={{ marginTop: "0" }} className={styles.usercodeText}>
									{newUserCode}
								</p>
							</div>
							<div className={styles.buttonDiv}>
								<LoadingButton
									onClick={() => {
										setUseNewSelected(true);
										setUserCode(newUserCode);
										setCanChangePage(true);
									}}
									loading={useNewSelected}
									disabled={useCurrentSelected}
								>
									Use New
								</LoadingButton>
							</div>
						</div>
					</div>
				</LabeledAlertbox>
			) : (
				<div className={styles.loadingSpinner}>
					<Image
						src={loadingIcon}
						layout="fill"
						priority={true}
						alt={"Loading"}
					/>
				</div>
			)}
		</div>
	);
}
