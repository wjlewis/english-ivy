import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { GrammarBuilder as Gb } from './grammar-builder';
import { TreeKind } from './types/tree';
import { checkTree } from './check-tree';

const gram = new Gb()
  .addProduction('Derivs', Gb.Star('Deriv'))
  .addProduction('Deriv', Gb.Seq('Prems', 'Expr'))
  .addProduction('Prems', Gb.Star('Deriv'))
  .addProduction('Expr', Gb.Terminal(/^[a-zA-Z]+$/))
  .startWith('Derivs')
  .build();

const tree = {
  kind: TreeKind.Inner,
  type: 'Derivs',
  children: [
    {
      kind: TreeKind.Inner,
      type: 'Deriv',
      children: [
        {
          kind: TreeKind.Inner,
          type: 'Prems',
          children: [],
        },
        {
          kind: TreeKind.Leaf,
          type: 'Expr',
          content: 'test',
        },
      ],
    },
    {
      kind: TreeKind.Inner,
      type: 'Deriv',
      children: [
        {
          kind: TreeKind.Inner,
          type: 'Prems',
          children: [
            {
              kind: TreeKind.Inner,
              type: 'Deriv',
              children: [
                {
                  kind: TreeKind.Inner,
                  type: 'Prems',
                  children: [],
                },
                {
                  kind: TreeKind.Leaf,
                  type: 'Expr',
                  content: 'A',
                },
              ],
            },
            {
              kind: TreeKind.Inner,
              type: 'Deriv',
              children: [
                {
                  kind: TreeKind.Inner,
                  type: 'Prems',
                  children: [],
                },
                {
                  kind: TreeKind.Leaf,
                  type: 'Expr',
                  content: 'C',
                },
              ],
            },
          ],
        },
        {
          kind: TreeKind.Leaf,
          type: 'Expr',
          content: 'B',
        },
      ],
    },
  ],
};

checkTree(tree as any, gram);

ReactDOM.render(
  <React.StrictMode>
    <h1>Test</h1>
  </React.StrictMode>,
  document.getElementById('root')
);
