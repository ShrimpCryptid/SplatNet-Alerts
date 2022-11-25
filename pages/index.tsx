import Head from "next/head";
import Link from "next/link";
import Router from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import Filter from "../lib/filter";
import FilterView from "../components/filter-view";
import styles from "../styles/index.module.css";
import { API_FILTER_JSON, API_SEND_TEST_NOTIFICATION, API_SUBSCRIPTION, API_USER_CODE, FE_ERROR_404_MSG, FE_ERROR_500_MSG, FE_ERROR_INVALID_USERCODE, FE_UNKNOWN_MSG } from "../constants";
import { DefaultPageProps } from "./_app";
import { requestNotificationPermission, registerServiceWorker, createNotificationSubscription } from "../lib/notifications";
import SuperJumpLoadAnimation from "../components/superjump/superjump";
import { isValidUserCode } from "../lib/shared_utils";
import LoadingButton, { ButtonStyle } from "../components/loading-button";
import LabeledAlertbox, { Alertbox, WelcomeAlertbox } from "../components/alertbox";

/**
 * Retrieves a list of the user's current filters from the database. Returns
 * null if filters could not be retrieved (due to a 404 or 500 error).
 * @param userCode the unique string identifier for this user.
 */
async function getUserFilters(userCode: string): Promise<Filter[]|null> {
	// TODO: Use SWR fetcher?
  // TODO: URL-ify usercode.
  // TODO: Make multiple attempts to get a 200 response in case the server is
  // misbehaving.
	let url = `/api/get-user-filters?${API_USER_CODE}=${userCode}`;
  try {
    let response = await fetch(url);
    if (response.status == 200) {
      // ok
      let jsonList = await response.json();
      let filterList = [];
      for (let json of jsonList) {
        filterList.push(Filter.deserializeObject(json));
      }
      return filterList;
    } else if (response.status === 404 && isValidUserCode(userCode)) {
      toast.error(FE_ERROR_404_MSG);
    } else if (response.status === 500 || response.status === 400) {
      toast.error(FE_ERROR_500_MSG);
    }
  } catch (e) {
    toast.error(FE_UNKNOWN_MSG);
  }
  return null;
}


export default function Home({
	usercode,
	setUserCode,
	setEditingFilter,
}: DefaultPageProps) {
  let [filterList, setFilterList] = useState<Filter[]|null>(null);
  let [lastUserCode, setLastUserCode] = useState<string|null>(usercode);

  // Flags for UI loading buttons
  /** The index of any filter we are waiting to edit. -1 by default. */
  let [awaitingEdit, setAwaitingEdit] = useState(-1);
  /** The index of any filters we are waiting to delete. -1 by default. */
  let [awaitingDelete, setAwaitingDelete] = useState(-1);
  let [awaitingRefresh, setAwaitingRefresh] = useState(false);

	let [pageSwitchReady, setPageSwitchReady] = useState(false);
  let [notificationsToggle, setNotificationsToggle] = useState(false);
  let [shouldFetchFilters, setShouldFetchFilters] = useState<boolean>(true);
  let [loginUserCode, setLoginUserCode] = useState("");
  let [filterText, setFilterText] = useState("Loading...");

	// Retrieve the user's filters from the database.
  const updateFilterViews = async () => {
    setAwaitingRefresh(true);
    setFilterText("Loading...");  // Reset filter text while loading in text
    if (usercode !== null && usercode !== undefined) {
      getUserFilters(usercode).then((filterList) => {
          if (filterList && filterList.length > 0) {
            setFilterList(filterList);
          } else {
            // TODO: Check for an error state here (filter list === null)
            setFilterList([]);
            setFilterText("There's nothing here yet.");
          }
          setAwaitingRefresh(false);
        }
      );
    } else {
      setFilterList(null);  // store empty list
      setFilterText("There's nothing here yet. Make a new filter to get started.");
      setAwaitingRefresh(false);
    }
  }
  // Check for changes to the user code and fetch filter views again if changed
  // this is necessary because retrieval of the user code happens AFTER initial
  // render)
  if (lastUserCode !== usercode) {
    setShouldFetchFilters(true);
    setLastUserCode(usercode);
  }
  // Reload filters
  if (shouldFetchFilters) {
    setEditingFilter(null);  // clear any filters that we may have been editing
    updateFilterViews();
    setShouldFetchFilters(false);
  }

  /** Edit an existing filter */
	const onClickEditFilter = (filterIndex: number) => {
		// Switch page contexts, save the editing filter to the state.
    if (filterList) {
      setEditingFilter(filterList[filterIndex]);
      setAwaitingEdit(filterIndex);
      setPageSwitchReady(true);
    }
	};

  // Switches page to the filter edit/creation, but only when state has finished
  // changing.
	useEffect(() => {
		if (pageSwitchReady) {
			Router.push("/filter");
		}
	});

  /** Attempts to delete the filter given by the index from the server. */
  const onClickDeleteFilter = (filterIndex: number) => {
    async function deleteFilter(filterIndex: number) {
      if (filterList) {
        try {

          let filter = filterList[filterIndex];
          let url = `/api/delete-filter?${API_USER_CODE}=${usercode}`;
          url += `&${API_FILTER_JSON}=${filter.serialize()}`
          let result = await fetch(url);
          if (result.status == 200) {
            // Remove filter from the list locally too
            let newFilterList = [...filterList];  // shallow copy
            newFilterList.splice(filterIndex, 1);
            setFilterList(newFilterList);
            if (newFilterList.length === 0) {
              // Reset filter text
              setFilterText("There's nothing here yet.");
            }
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
  }

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
      url += `&${API_USER_CODE}=${usercode}`;
      url += `&${API_SEND_TEST_NOTIFICATION}`;  // flag: send test notif.
      let result = await fetch(url);
      if (result.status === 200) {
        toast.success("Success! A test notification has been sent to your device.");
      } else if (result.status === 404) {
        toast.error(FE_ERROR_404_MSG);
      } else if (result.status === 500) {
        toast.error(FE_ERROR_500_MSG);
      }
    }
  }

  /** Updates the login field as the user types. */
  const handleLoginChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLoginUserCode(event.currentTarget.value);
  }

  const onClickLogin = () => {
    if (!isValidUserCode(loginUserCode)) {
      toast.error(FE_ERROR_INVALID_USERCODE);
      return;
    }
    // TODO: Attempt to log user in, and only allow switch if the server has
    // a valid entry for the user.
    setUserCode(loginUserCode);
    setShouldFetchFilters(true);
  }

	return (
		<div className={styles.main}>
			<Head>Splatnet Shop Alerts</Head>

      {/** 
      <WelcomeAlertbox
        onClickClose={() => {}}
        usercode={usercode ? usercode : ""}
        onClickSubmitNickname={() => {}}
      />*/}

			<div>
					<h1>Splatnet Alerts</h1>
			</div>
      <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
        <h2>Your Filters</h2>
        <LoadingButton onClick={updateFilterViews} loading={awaitingRefresh}>Refresh</LoadingButton>
      </div>
			<div className={styles.filterListContainer}>
        {(filterList && filterList.length > 0) ? filterList.map((filter, index) => {
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
        }) :
        (<div className={styles.emptyFilterList}>
          <SuperJumpLoadAnimation
            filterText={filterText}
            fillLevel={0.5}
          />
        </div>)}
      </div>
			<Link href="filter">
				<button>New Filter</button>
			</Link>

      <h3>Get notified about gear from the SplatNet 3 app!</h3>
        <p>
          Splatnet Alerts lets you sign up for notifications about new gear
          items. You can set <b>filters</b> to search for certain brand,
          ability, or gear combinations, and sync notifications across
          devices. You'll be notified within 30 minutes of new items arriving
          in the shop!
          <br/>
          <br/>
          Splatnet Alerts is maintained by @ShrimpCryptid. You can contribute directly to the
          project on GitHub!
      </p>

			<h2>Settings</h2>
			<h3>Notifications</h3>
			<p>
				You currently have notifications <b>ON/OFF</b>.
			</p>
			<p>
				SSA sends push notifications via your browser. You can turn off
				notifications at any time.
			</p>
			<button disabled={false} onClick={toggleNotifications}>
        Turn on notifications
      </button>
			<h3>User ID</h3>
			<p>This is your unique user ID. Save and copy this somewhere secure!</p>
			<p>
				You can use it to make changes to your notifications if you clear your
				cookies or use another browser.
			</p>
			<p>
				<b>Your unique identifier is:</b>
			</p>
			<textarea value={usercode ? usercode : ""} readOnly={true}/>
      <LoadingButton buttonStyle={ButtonStyle.ICON}>
        <span className="material-symbols-rounded">content_copy</span>
      </LoadingButton>

			<h3>Change User</h3>
			<p>
				Paste in your user ID to sync your notification settings across devices.
			</p>
			<textarea value={loginUserCode} onChange={handleLoginChange} />
			<button onClick={onClickLogin}>Login</button>
		</div>
	);
}
