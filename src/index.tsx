import React from 'react';
import ReactDOM from 'react-dom';
import Buffer from './Buffer';
import { gram1, layout1 } from './lang1';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <div className="window">
      <Buffer grammar={gram1} layout={layout1} />
    </div>
  </React.StrictMode>,
  document.getElementById('root')
);
