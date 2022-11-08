import Head from "next/head";
import Link from "next/link";
import Filter from "../lib/filter";
import FilterView from "../components/filter-view";
import styles from "../styles/index.module.css";
import { API_FILTER_JSON, API_SUBSCRIPTION, API_USER_CODE } from "../constants";
import { useEffect, useState } from "react";
import { DefaultPageProps } from "./_app";
import Router from "next/router";
import { requestNotificationPermission, registerServiceWorker, createNotificationSubscription } from "../lib/notifications";
import { SERVER } from "../config";

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
	}
	return [];
}

export default function Home({
	usercode,
	setUserCode,
	setEditingFilter,
}: DefaultPageProps) {
  let [filterList, setFilterList] = useState<Filter[]>([]);
	let [pageSwitchReady, setPageSwitchReady] = useState(false);
  let [notificationsToggle, setNotificationsToggle] = useState(false);
	// setEditingFilter(null);  // clear the filter we are editing.

	// Retrieve the user's filters from the database.
  const updateFilterviews = async () => {
    if (usercode) {
      let filterList = await getUserFilters(usercode);
      setFilterList(filterList);
    }
  }
  if (filterList.length == 0) {
    updateFilterviews();  // run only once during initial page render
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
    deleteFilter(filterIndex);
  }

  const toggleNotifications = async () => {
    if (notificationsToggle) {
      // Turn OFF notifications
      setNotificationsToggle(false);
    } else {
      // Turn ON notifications
      // Start a local service worker
      await requestNotificationPermission();
      await registerServiceWorker();

      let subscription = await createNotificationSubscription();
      console.log(subscription);
      let subscriptionString = JSON.stringify(subscription);
      console.log(subscriptionString);
      // Send to the server and save.
      let url = `/api/subscribe?${API_SUBSCRIPTION}=${subscriptionString}`;
      url += `&${API_USER_CODE}=${usercode}`;
      let result = await fetch(url);
      console.log(result.status);
    }
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
			<>
        {filterList.map((filter, index) => {
          return (
            <FilterView
              onClickEdit={() => onClickFilter(filter)}
              onClickDelete={() => onClickDeleteFilter(index)}
              filter={filter}
              key={index}
            />
          );
        })}
      </>
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
			<textarea>{usercode}</textarea>
			<button>📄</button>

			<h3>Change User</h3>
			<p>
				Paste in your user ID to sync your notification settings across devices.
			</p>
			<textarea></textarea>
			<button>Login</button>
		</div>
	);
}
