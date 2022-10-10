import Head from 'next/head';
import Selector from '../components/selector';

let selected = new Map([
  ['Any', true],
  ['Ink Saver (Main)', true],
  ['Ink Saver (Sub)', false],
  ['Run Speed Up', false],
  ['Last-Ditch Effort', true],
  ['Ink Resist Up', true]
]);

export default function Home() {

  let onChanged = (newSelected) => {
    selected = newSelected;
  }

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
        onChanged={onChanged}
      />
    </div>
)
}