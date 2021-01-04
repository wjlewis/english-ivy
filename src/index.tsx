import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import Buffer from './Buffer';
import { GrammarBuilder as Gb } from './grammar-builder';
import { Tree, TreeKind } from './types/tree';
import { RecLayoutFn } from './types/layout';
import './index.css';

const gram = new Gb()
  .addProduction('Eqs', Gb.Star('Eq'))
  .addProduction('Eq', Gb.Seq('Expr', 'Expr'))
  .addProduction('Expr', Gb.Alt('Name', 'Num', 'Sum', 'Prod'))
  .addProduction('Name', Gb.Terminal(/^[a-zA-Z]+$/))
  .addProduction('Num', Gb.Terminal(/^\d+$/))
  .addProduction('Sum', Gb.Seq('Expr', 'Expr'))
  .addProduction('Prod', Gb.Seq('Expr', 'Expr'))
  .startWith('Eqs')
  .build();

const layout = (tree: Tree, self: RecLayoutFn): JSX.Element => {
  const { focused } = tree;
  switch (tree.kind) {
    case TreeKind.Inner:
      switch (tree.prod) {
        case 'Eqs':
          return (
            <div className={classNames('eqs', { focused })}>
              {tree.children.map(self)}
            </div>
          );
        case 'Eq':
          return (
            <div className={classNames('eq', { focused })}>
              {self(tree.children[0])} = {self(tree.children[1])}
            </div>
          );
        case 'Expr':
          return self(tree.children[0]);
        case 'Sum':
          return (
            <div className={classNames('sum', { focused })}>
              {self(tree.children[0])} + {self(tree.children[1])}
            </div>
          );
        case 'Prod':
          return (
            <div className={classNames('prod', { focused })}>
              {self(tree.children[0])} * {self(tree.children[1])}
            </div>
          );
      }
      break;
    case TreeKind.Leaf:
      switch (tree.prod) {
        case 'Name':
          return (
            <span className={classNames('name', { focused })}>
              {tree.content}
            </span>
          );
        case 'Num':
          return (
            <span className={classNames('num', { focused })}>
              {tree.content}
            </span>
          );
      }
      break;
  }
  throw new Error('unreachable');
};

ReactDOM.render(
  <React.StrictMode>
    <Buffer grammar={gram} layout={layout} />
  </React.StrictMode>,
  document.getElementById('root')
);
