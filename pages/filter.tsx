import Head from 'next/head';
import { useState, useEffect, SetStateAction } from 'react';
import Selector from '../components/selector';

export default function Home() {

  const [selected, setSelected] = useState(new Map([
    ['Any', false],
    ['Ink Saver (Main)', true],
    ['Ink Saver (Sub)', false],
    ['Run Speed Up', false],
    ['Last-Ditch Effort', true],
    ['Ink Resist Up', true]
  ]));

  return (
    <div id="app">
      <Head>
        Splatnet Shop Alerts
      </Head>
      <p>Placeholder text</p>
      <Selector
            items={Array.from(selected.keys())}
            selected={selected}
            wildcard={true}
            onChanged={(newSelected: Map<string, boolean>) => {setSelected(newSelected)}}
      />
      <p>Any is {selected.get("Any") ? "true!" : "false!"}</p>
    </div>
)
}