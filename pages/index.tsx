import Head from "next/head";
import Link from "next/link";
import Router from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import Filter from "../lib/filter";
import FilterView from "../components/filter-view";
import styles from "../styles/index.module.css";
import {
	API_FILTER_JSON,
	API_SEND_TEST_NOTIFICATION,
	API_SUBSCRIPTION,
	API_USER_CODE,
	FE_ERROR_404_MSG,
	FE_ERROR_500_MSG,
	FE_ERROR_INVALID_USERCODE,
	FE_UNKNOWN_MSG,
} from "../constants";
import { DefaultPageProps } from "./_app";
import {
	requestNotificationPermission,
	registerServiceWorker,
	createNotificationSubscription,
} from "../lib/notifications";
import SuperJumpLoadAnimation from "../components/superjump/superjump";
import { isValidUserCode, sleep } from "../lib/shared_utils";
import LoadingButton, { ButtonStyle } from "../components/loading-button";
import LabeledAlertbox, { WelcomeAlertbox } from "../components/alertbox";

export default function Home({
	userCode,
	setUserCode,
	setEditingFilter,
	updateLocalUserData,
	userFilters,
  userNickname,
	setUserFilters,
}: DefaultPageProps) {
	// Flags for UI loading buttons
	/** The index of any filter we are waiting to edit. -1 by default. */
	let [awaitingEdit, setAwaitingEdit] = useState(-1);
	/** The index of any filters we are waiting to delete. -1 by default. */
	let [awaitingDelete, setAwaitingDelete] = useState(-1);
	/** Whether we are currently awaiting updated user data. */
	let [awaitingRefresh, setAwaitingRefresh] = useState(false);
	/** Whether we are currently waiting for the new filter page to load. */
	let [awaitingNewFilter, setAwaitingNewFilter] = useState(false);
  let [awaitingLogin, setAwaitingLogin] = useState(false);

	let [pageSwitchReady, setPageSwitchReady] = useState(false);
	let [notificationsToggle, setNotificationsToggle] = useState(false);
	let [loginUserCode, setLoginUserCode] = useState("");

	// Retrieve the user's filters from the database.
	const updateFilterViews = async () => {
		setAwaitingRefresh(true);
		if (userCode === null || userCode === undefined) {
			// There is no user to retrieve data for, so we do not attempt to load.
			// Delay reset so user knows that an action is being taken.
			sleep(500).then(() => setAwaitingRefresh(false));
		} else {
			// Request latest user data
			updateLocalUserData(userCode, true).then(() => {
				sleep(500).then(() => setAwaitingRefresh(false));
			});
		}
	};

	/** Edit an existing filter */
	const onClickEditFilter = (filterIndex: number) => {
		// Switch page contexts, save the editing filter to the state.
		if (userFilters && !pageSwitchReady) {
			setEditingFilter(userFilters[filterIndex]);
			setAwaitingEdit(filterIndex);
			setPageSwitchReady(true);
		}
	};

	// Switches page to the filter edit/creation, but only when state has finished
	// changing.
	useEffect(() => {
		// Manually prefetch the filters page (since we're not using a Next.js Link
		// which normally handles this for us!).
		Router.prefetch("filter");
		if (pageSwitchReady) {
			Router.push("filter");
		}
	});

	/** Attempts to delete the filter given by the index from the server. */
	const onClickDeleteFilter = (filterIndex: number) => {
		async function deleteFilter(filterIndex: number) {
			if (userFilters && filterIndex >= 0 && filterIndex < userFilters.length) {
				try {
					let filter = userFilters[filterIndex];
					// Query the backend, requesting deletion
					let url = `/api/delete-filter?${API_USER_CODE}=${userCode}`;
					url += `&${API_FILTER_JSON}=${filter.serialize()}`;
					let result = await fetch(url);
					if (result.status == 200) {
						// Remove filter from the list locally too
						let newUserFilters = [...userFilters]; // shallow copy
						newUserFilters.splice(filterIndex, 1);
						setUserFilters(newUserFilters);
					} else {
						// TODO: Error message
					}
				} catch (e) {
					toast.error(FE_UNKNOWN_MSG);
				}
			}
			setAwaitingDelete(-1);
		}
		setAwaitingDelete(filterIndex);
		deleteFilter(filterIndex);
	};

	const toggleNotifications = async () => {
		if (notificationsToggle) {
			// Turn OFF notifications
			// TODO: Remove subscription from server -> await then
			toast("Notifications have been disabled for this device.");
			setNotificationsToggle(false);
		} else {
			// Turn ON notifications
			// Start a local service worker
			await requestNotificationPermission();
			await registerServiceWorker();

			const publicVAPIDKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
			if (!publicVAPIDKey) {
				console.error("Cannot find public VAPID key environment variable.");
				return;
			}
			// TODO: Handle 'DOMException: Registration failed' when VAPID keys have changed.
			// TODO: Determine why notifications don't work correctly the first time they're registered?
			let subscription = await createNotificationSubscription(publicVAPIDKey);
			let subscriptionString = JSON.stringify(subscription);
			// TODO: Store locally?

			// Send the subscription data to the server and save.
			let url = `/api/subscribe?${API_SUBSCRIPTION}=${subscriptionString}`;
			url += `&${API_USER_CODE}=${userCode}`;
			url += `&${API_SEND_TEST_NOTIFICATION}`; // flag: send test notif.
			let result = await fetch(url);
			if (result.status === 200) {
				toast.success(
					"Success! A test notification has been sent to your device."
				);
			} else if (result.status === 404) {
				toast.error(FE_ERROR_404_MSG);
			} else if (result.status === 500) {
				toast.error(FE_ERROR_500_MSG);
			}
		}
	};

	/** Updates the login field as the user types. */
	const handleLoginChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setLoginUserCode(event.currentTarget.value);
	};

	const onClickLogin = () => {
    let formattedUserCode = loginUserCode.trim();

		if (!isValidUserCode(formattedUserCode)) {
			toast.error(FE_ERROR_INVALID_USERCODE);
			return;
		}
    setAwaitingLogin(true);
		updateLocalUserData(formattedUserCode, true, false).then((didUpdateSuccessfully) => {
      if (didUpdateSuccessfully) {
        // Update our local user code
        setUserCode(formattedUserCode);
        setLoginUserCode(""); // blank login box
        toast.success("Logged in as '" + userNickname + "'!");
      }
      setAwaitingLogin(false);
    });
	};

	// Set different text prompts for the filter loading screen
	let loadingText = "Loading...";
	if (userCode === null) {
		// No user filters could be loaded because the user does not exist yet.
		loadingText = "There's nothing here yet. Make a new filter to get started!";
	} else if (userFilters && userFilters.length === 0) {
		// User was loaded but has no filters.
		loadingText = "There's nothing here yet.";
	}
	// Otherwise, filter list will be shown instead.

	return (
		<div className={styles.main}>
			<Head>Splatnet Shop Alerts</Head>

			{/**
        <WelcomeAlertbox
        onClickClose={() => {}}
        usercode={userCode ? userCode : ""}
        onClickSubmitNickname={() => {}}
      />*/}

			<div>
				<h1>Splatnet Alerts</h1>
			</div>
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<h2>Your Filters</h2>
				<LoadingButton
					onClick={updateFilterViews}
					loading={awaitingRefresh}
					disabled={!userCode}
				>
					Refresh
				</LoadingButton>
			</div>
			<div className={styles.filterListContainer}>
				{userFilters && userFilters.length > 0 ? (
					// User has filters, so we can show them the filter list!
					userFilters.map((filter, index) => {
						return (
							<FilterView
								onClickEdit={() => onClickEditFilter(index)}
								onClickDelete={() => onClickDeleteFilter(index)}
								awaitingEdit={index === awaitingEdit}
								awaitingDelete={index === awaitingDelete}
								filter={filter}
								key={index}
							/>
						);
					})
				) : (
					// Show loading animation and text
					<div className={styles.emptyFilterList}>
						<SuperJumpLoadAnimation filterText={loadingText} fillLevel={0.5} />
					</div>
				)}
			</div>
			<LoadingButton
				onClick={() => {
					setEditingFilter(null); // clear any filters being edited
					setAwaitingNewFilter(true); // set loading animation on new filter
					setPageSwitchReady(true); // ready page to transition
				}}
				loading={awaitingNewFilter}
				disabled={awaitingEdit !== -1}
			>
				New Filter
			</LoadingButton>

			<h3>Get notified about gear from the SplatNet 3 app!</h3>
			<p>
				Splatnet Alerts lets you sign up for notifications about new gear items.
				You can set <b>filters</b> to search for certain brand, ability, or gear
				combinations, and sync notifications across devices. You'll be notified
				within 30 minutes of new items arriving in the shop!
				<br />
				<br />
				Splatnet Alerts is maintained by @ShrimpCryptid. You can contribute
				directly to the project on GitHub!
			</p>

			<h2 style={{marginBottom: "0"}}>Settings</h2>
			<h3 style={{marginBottom: "0"}}>Notifications</h3>
			<p style={{marginTop: "0"}}>
				You currently have notifications <b>ON/OFF</b>.
			</p>
			<p>
				SSA sends push notifications via your browser. You can turn off
				notifications at any time.
			</p>
			<button disabled={false} onClick={toggleNotifications}>
				Turn on notifications
			</button>
			<h3 style={{marginBottom: "0"}}>User ID</h3>
			<p style={{marginTop: "0"}}>This is your unique user ID. Save and copy this somewhere secure!</p>
			<p>
				You can use it to make changes to your notifications if you clear your
				cookies or use another browser.
			</p>
			<p>
				<b>Your unique identifier is:</b>
			</p>
      <div style={{display: "flex", flexDirection: "row", gap: "10px"}}>
        <textarea value={userCode ? userCode : ""} readOnly={true} />
        <LoadingButton buttonStyle={ButtonStyle.ICON}>
          <span className="material-symbols-rounded">content_copy</span>
        </LoadingButton>
      </div>

			<h3 style={{marginBottom: "0"}}>Change User</h3>
			<p style={{marginTop: "0"}}>
				Paste in your user ID to sync your notification settings across devices.
			</p>
      <div style={{display: "flex", flexDirection: "row", gap: "10px"}}>
        <textarea value={loginUserCode} onChange={handleLoginChange} />
        <LoadingButton
          onClick={onClickLogin}
          loading={awaitingLogin}
          disabled={!isValidUserCode(loginUserCode.trim())}
        >
          Login
        </LoadingButton>
      </div>
		</div>
	);
}
