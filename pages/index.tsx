import Head from "next/head";
import Link from "next/link";
import Filter from "../lib/filter";
import FilterView from "../components/filter-view";
import styles from "../styles/index.module.css";
import { API_FILTER_JSON, API_SEND_TEST_NOTIFICATION, API_SUBSCRIPTION, API_USER_CODE, FE_ERROR_404_MSG, FE_ERROR_500_MSG } from "../constants";
import { useEffect, useState } from "react";
import { DefaultPageProps } from "./_app";
import Router from "next/router";
import { requestNotificationPermission, registerServiceWorker, createNotificationSubscription } from "../lib/notifications";
import { SERVER, VAPID_PUBLIC_KEY } from "../config";
import SuperJumpLoadAnimation from "../components/superjump/superjump";

import testImage from '../public/images/superjump/superjumpmarker_tail.svg';
import { toast } from "react-toastify";

/**
 * Retrieves a list of the user's current filters from the database.
 * @param userCode the unique string identifier for this user.
 */
async function getUserFilters(userCode: string): Promise<Filter[]> {
	// TODO: Use SWR fetcher?
	let url = `/api/get-user-filters?${API_USER_CODE}=${userCode}`;
	let response = await fetch(url);
	if (response.status == 200) {
		// ok
		let jsonList = await response.json();
		let filterList = [];
		for (let json of jsonList) {
			filterList.push(Filter.deserializeObject(json));
		}
		return filterList;
	} else if (response.status === 404) {
    toast.error(FE_ERROR_404_MSG);
  } else if (response.status === 500 || response.status === 400) {
    toast.error(FE_ERROR_500_MSG);
  }
  return [];
}


export default function Home({
	usercode,
	setUserCode,
	setEditingFilter,
}: DefaultPageProps) {
  let [filterList, setFilterList] = useState<Filter[]|null>(null);
	let [pageSwitchReady, setPageSwitchReady] = useState(false);
  let [notificationsToggle, setNotificationsToggle] = useState(false);
  let [lastFetchedUserCode, setLastFetchedUserCode] = useState<string|null>(null);
  let [loginUserCode, setLoginUserCode] = useState("");
  let [filterText, setFilterText] = useState("Loading...");

	// Retrieve the user's filters from the database.
  const updateFilterViews = async () => {
    if (usercode !== null && usercode !== undefined) {
      getUserFilters(usercode).then((filterList) => {
          setFilterList(filterList);
        }
      );
    } else if (usercode !== undefined) {
      setFilterList([]);  // store empty list
      setFilterText("There's nothing here yet.");
    }
  }
  // On initial render only, or whenever our usercode has changed.
  if (usercode !== lastFetchedUserCode || (usercode === null && filterList === null)) {
    setEditingFilter(null);  // clear the filter we are editing.
    updateFilterViews();  // run only once during initial page render
    setLastFetchedUserCode(usercode);  // Store this usercode
  }

  // Click and edit a filter.
	const onClickFilter = (filter: Filter) => {
		// Switch page contexts, save the editing filter to the state.
		console.log(filter);
		setEditingFilter(filter);
		setPageSwitchReady(true);
	};

  // Switches page to the filter edit/creation, but only when state has finished
  // changing.
	useEffect(() => {
		if (pageSwitchReady) {
			Router.push("/filter");
		}
	});

  // Click and remove a filter-- callback function
  const onClickDeleteFilter = (filterIndex: number) => {
    async function deleteFilter(filterIndex: number) {
      if (filterList) {
        let filter = filterList[filterIndex];
        let url = `/api/delete-filter?${API_USER_CODE}=${usercode}`;
        url += `&${API_FILTER_JSON}=${filter.serialize()}`
        let result = await fetch(url);
        if (result.status == 200) {
          // Remove filter from the list locally too
          let newFilterList = [...filterList];  // shallow copy
          newFilterList.splice(filterIndex, 1);
          setFilterList(newFilterList);
        } else {
          // TODO: Error message
        }
      }
    }
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

      let subscription = await createNotificationSubscription(VAPID_PUBLIC_KEY);
      let subscriptionString = JSON.stringify(subscription);
      // TODO: Store locally?
      
      // Send the subscription data to the server and save.
      let url = `/api/subscribe?${API_SUBSCRIPTION}=${subscriptionString}`;
      url += `&${API_USER_CODE}=${usercode}`;
      url += `&${API_SEND_TEST_NOTIFICATION}`;  // flag: send test notif.
      let result = await fetch(url);
      if (result.status === 200) {
        // TODO: Try sending a test notification to the device.
        toast.success("Success! A test notification has been sent to your device.");
      } else if (result.status === 404) {
        toast.error(FE_ERROR_404_MSG);
      } else if (result.status === 500) {
        toast.error(FE_ERROR_500_MSG);
      }
    }
  }

  const handleLoginChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLoginUserCode(event.currentTarget.value);
  }

  const onClickLogin = () => {
    // TODO: Validae usercode, show some sort of error message if it's invalid
    setUserCode(loginUserCode);
  }

	return (
		<div className={styles.main}>
			<Head>Splatnet Shop Alerts</Head>
			<div>
				<div>
					<h1>Splatnet Shop Alerts (SSA)</h1>
					<p>Get notified about gear from the SplatNet 3 app!</p>
				</div>
			</div>
      <h2>Your Filters</h2>
      <div className={styles.emptyFilterList}>
        <SuperJumpLoadAnimation filterText={filterText}/>
      </div>
			<h2>Your Filters</h2>
      <button onClick={updateFilterViews}>Refresh</button>
			<div className={styles.filterListContainer}>
        {(filterList && filterList.length > 0) ? filterList.map((filter, index) => {
          return (
            <FilterView
              onClickEdit={() => onClickFilter(filter)}
              onClickDelete={() => onClickDeleteFilter(index)}
              filter={filter}
              key={index}
            />
          );
        }) : <></>}

        {(filterList && filterList.length == 0) ? 
          <div className={styles.emptyFilterList}/> : <></>}

        {(!filterList) ?
          <div className={styles.emptyFilterList}>
            <SuperJumpLoadAnimation
              filterText={filterText}
              fillLevel={0.5}
            />
          </div>
          : <></>}
      </div>
			<Link href="filter">
				<button>New Filter</button>
			</Link>

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
			<button>📄</button>

			<h3>Change User</h3>
			<p>
				Paste in your user ID to sync your notification settings across devices.
			</p>
			<textarea value={loginUserCode} onChange={handleLoginChange} />
			<button onClick={onClickLogin}>Login</button>
		</div>
	);
}
