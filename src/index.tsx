import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { GrammarBuilder as GB } from './grammar-builder';

const sexp = new GB()
  .addProduction(
    'Expr',
    GB.Alt(g => [g.Atom, g.Cons])
  )
  .addProduction(
    'Atom',
    GB.Alt(g => [g.Nil, g.Num, g.Name])
  )
  .addProduction('Nil', GB.Terminal())
  .addProduction('Num', GB.Terminal())
  .addProduction('Name', GB.Terminal())
  .addProduction(
    'Cons',
    GB.Seq(g => [g.Expr, g.Expr])
  )
  .startWith(g => g.Expr)
  .build();

console.log(sexp);

const arith = new GB()
  .addProduction(
    'Expr',
    GB.Alt(g => [g.Lit, g.Sum, g.Prod, g.Diff])
  )
  .addProduction(
    'Sum',
    GB.Seq(g => [g.Expr, g.Expr])
  )
  .addProduction(
    'Prod',
    GB.Seq(g => [g.Expr, g.Expr])
  )
  .addProduction(
    'Diff',
    GB.Seq(g => [g.Expr, g.Expr])
  )
  .addProduction(
    'Lit',
    GB.Alt(g => [g.Name, g.Num])
  )
  .addProduction(
    'Name',
    GB.Terminal(input =>
      /^\w[\w\d]*$/.test(input) ? [] : ['Expected a valid name']
    )
  )
  .addProduction(
    'Num',
    GB.Terminal(
      input => (/^\d+$/.test(input) ? [] : ['Expected a number']),
      input => Number(input)
    )
  )
  .startWith(g => g.Expr)
  .build();

console.log(arith);

ReactDOM.render(
  <React.StrictMode>
    <h1>Test</h1>
  </React.StrictMode>,
  document.getElementById('root')
);
