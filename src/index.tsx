import React from 'react';
import ReactDOM from 'react-dom';
import Buffer from './Buffer';
import { GrammarBuilder as Gb } from './grammar-builder';
import { RecLayoutFn } from './Buffer/layout';
import { TreeKind } from './tree-zipper';
import { BufferTree } from './Buffer/misc';
import './index.css';

const gram = new Gb()
  .where('Eqs', Gb.Star('Eq'))
  .where('Eq', Gb.Product('Expr', 'Expr'))
  .where('Expr', Gb.Sum('Name', 'Num', 'Sum', 'Prod'))
  .where('Name', Gb.Terminal(/^[a-zA-Z]+$/))
  .where('Num', Gb.Terminal(/^\d+$/))
  .where('Sum', Gb.Product('Expr', 'Expr'))
  .where('Prod', Gb.Product('Expr', 'Expr'))
  .startWith('Eqs')
  .build();

const layout = (tree: BufferTree, self: RecLayoutFn): JSX.Element => {
  switch (tree.kind) {
    case TreeKind.Inner:
      switch (tree.data.prodPath[0]) {
        case 'Eqs':
          return (
            <div className="eqs">{Object.values(tree.children).map(self)}</div>
          );
        case 'Eq':
          return (
            <div className="eq">
              {self(tree.children[0])} = {self(tree.children[1])}
            </div>
          );
        case 'Expr':
          return self(tree.children[0]);
        case 'Sum':
          return (
            <div className="sum">
              {self(tree.children[0])} + {self(tree.children[1])}
            </div>
          );
        case 'Prod':
          return (
            <div className="prod">
              {self(tree.children[0])} * {self(tree.children[1])}
            </div>
          );
      }
      break;
    case TreeKind.Leaf:
      switch (tree.data.prodPath[0]) {
        case 'Name':
          return <span className="name">{tree.content}</span>;
        case 'Num':
          return <span className="num">{tree.content}</span>;
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
