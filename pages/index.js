import Head from "next/head";
import Link from "next/link";
import Filter from "../lib/filter";
import FilterView from "../components/filter-view";
import styles from "../styles/index.module.css";

export default function Home() {
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
			<FilterView filter={demo_filter1} filterID={0} />
			<FilterView filter={demo_filter2} filterID={0} />
			<FilterView filter={demo_filter3} filterID={0} />
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
			<textarea>uuid-8001-349d-34cd-a398</textarea>
			<button>📄</button>

			<h3>Change User</h3>
			<p>Paste in your user ID to sync your notification settings across devices.</p>
			<textarea></textarea>
			<button>Login</button>
		</div>
	);
}
