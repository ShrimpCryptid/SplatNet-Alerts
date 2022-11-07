import Head from "next/head";
import Link from "next/link";
import Filter from "../lib/filter";
import FilterView from "../components/filter-view";
import styles from "../styles/index.module.css";
import { API_USER_CODE } from "../constants";
import { useEffect, useState } from "react";
import { DefaultPageProps } from "./_app";
import Router from "next/router";

/**
 * Retrieves a list of the user's current filters from the database.
 * @param userCode the unique string identifier for this user.
 */
async function getUserFilters(userCode: string): Promise<Filter[]> {
  // TODO: Use SWR fetcher?
  let url = `/api/get-user-filters?${API_USER_CODE}=${userCode}`;
  let response = await fetch(url);
  if (response.status == 200) {  // ok
    let jsonList = await response.json();
    let filterList = []
    for (let json of jsonList) {
      filterList.push(Filter.deserializeObject(json));
    }
    return filterList;
  }
  return [];
};

export default function Home({usercode, setUserCode, setEditingFilter}: DefaultPageProps) {
  // TODO: Some sort of loading menu for the default state
  let [filterViews, setFilterViews] = useState(<></>);
  let [pageSwitchReady, setPageSwitchReady] = useState(false);
  // setEditingFilter(null);  // clear the filter we are editing.

  const onClickFilter = (filter: Filter) => {
    // Switch page contexts, save the editing filter to the state.
    console.log(filter);
    setEditingFilter(filter);
    setPageSwitchReady(true);
  }

  useEffect(() => {
    if (pageSwitchReady) {
      Router.push("/filter");
    }
  })

  // Retrieve the user's filters from the database.
  useEffect(() => {
    async function updateFilterviews() {
      if (usercode) { 
        let filterList = await getUserFilters(usercode);
        setFilterViews(
        <>
          {filterList.map((filter, index) => {
              return (
              <FilterView
                filter={filter}
                key={index}
                onClick={() => onClickFilter(filter)}
              />);})
          }
        </>
        );
      } else {
        // set Filter Views to empty or a default view.
        setFilterViews(<></>);
      }
    }  // end updateFilterViews()
    updateFilterviews();
  }, []);

	let demo_filter1 = new Filter(
		"Annaki Flannel Hoodie",
		1,
		[],
		["Annaki"],
		["Ink Saver (Sub)", "Swim Speed Up"]
	);
	let demo_filter2 = new Filter(
		"",
		0,
		["ClothingGear"],
		["Barazushi", "Rockenberg"],
		[
			"Thermal Ink",
			"Ninja Squid",
			"Respawn Punisher",
			"Ink Saver (Sub)",
			"Ink Saver (Main)",
			"Ink Recovery Up",
			"Swim Speed Up",
			"Run Speed Up",
			"Special Power Up",
			"Special Charge Up",
			"Special Saver",
			"Quick Respawn",
			"Intensify Action",
		]
	);
	let demo_filter3 = new Filter("", 2, ["HeadGear", "ShoesGear"], [], []);

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
			{filterViews}
			<Link href="filter">
				<button>New Filter</button>
			</Link>

			<h2>Settings</h2>
			<h3>Notifications</h3>
			<p>
				You currently have notifications <b>ON/OFF</b>.
			</p>
			<p>
				SSA sends push notifications via your browser. You can turn off notifications at any time.
			</p>
			<button>Turn off notifications</button>
			<h3>User ID</h3>
			<p>This is your unique user ID. Save and copy this somewhere secure!</p>
			<p>
				You can use it to make changes to your notifications if you clear your cookies or use
				another browser.
			</p>
			<p>
				<b>Your unique identifier is:</b>
			</p>
			<textarea>{usercode}</textarea>
			<button>📄</button>

			<h3>Change User</h3>
			<p>Paste in your user ID to sync your notification settings across devices.</p>
			<textarea></textarea>
			<button>Login</button>
		</div>
	);
}
