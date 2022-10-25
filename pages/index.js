import Head from 'next/head';
import { useState, useEffect } from 'react';
import Selector from '../components/selector';
import Filter from '../lib/filter';
import FilterListItem from '../components/filter-list-item';

export default function Home() {

  let demo_filter1 = new Filter("Annaki Flannel Hoodie", 0, [], ["Annaki"], []);
  let demo_filter2 = new Filter("", 0, [], ["Barazushi", "Rockenberg"], [
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
      "Intensify Action"
  ]);

  return (
    <div id="app">
      <Head>
        Splatnet Shop Alerts
      </Head>
      <div>
        <div>
          <h1>Splatnet Shop Alerts (SSA)</h1>
          <p>Get notified about gear from the SplatNet 3 app!</p>
        </div>
      </div>
      <h2>Your Filters</h2>
      <FilterListItem
        filter={demo_filter1}
        filterID={0}
      />
      <FilterListItem
        filter={demo_filter2}
        filterID={0}
      />

      
    </div>
)
}