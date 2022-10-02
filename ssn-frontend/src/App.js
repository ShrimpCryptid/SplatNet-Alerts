import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

import { addUserAgent } from 'nxapi';

addUserAgent('test-shop-notifications/1.0.0 (+https://github.com/ShrimpCryptid)');

// This could also be read from a package.json file
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
const pkg = JSON.parse(await readFile(resolve(fileURLToPath(import.meta.url), '..', 'package.json'), 'utf-8'));
addUserAgent(pkg.name + '/' + pkg.version + ' (+' + pkg.repository.url + ')');

export default App;
