import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { GrammarBuilder as Gb } from './grammar-builder';

const arith = new Gb()
  .addProduction('Equality', Gb.Seq('Expr', 'Expr'))
  .addProduction('Expr', Gb.Alt('Lit', 'Sum', 'Prod', 'Diff'))
  .addProduction('Lit', Gb.Alt('Num', 'Name'))
  .addProduction('Num', Gb.Terminal(/^\d+$/))
  .addProduction('Name', Gb.Terminal(/^\w[\w\d]*$/))
  .addProduction('Sum', Gb.Seq('Expr', 'Expr'))
  .addProduction('Prod', Gb.Seq('Expr', 'Expr'))
  .addProduction('Diff', Gb.Seq('Expr', 'Expr'))
  .startWith('Equality')
  .build();

ReactDOM.render(
  <React.StrictMode>
    <pre>{JSON.stringify(arith, null, 2)}</pre>
  </React.StrictMode>,
  document.getElementById('root')
);
