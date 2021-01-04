import React from 'react';
import classNames from 'classnames';
import { BufferState } from './index';
import { Tree, TreeKind } from '../tree-zipper';

export type LayoutFn = (tree: Tree, self: RecLayoutFn) => JSX.Element;

export type RecLayoutFn = (tree: Tree) => JSX.Element;

export interface LayoutProps {
  state: BufferState;
  onTerminalChange: (path: string[], value: string) => any;
}

export function generateLayout(
  layout: LayoutFn,
  tree: Tree
): React.FC<LayoutProps> {
  return props => {
    const self = (tree: Tree) => {
      const { focused } = tree;
      const Layout = generateLayout(layout, tree);

      switch (tree.kind) {
        case TreeKind.Inner:
          return (
            <div
              className={classNames('layout-container', { focused })}
              key={tree.id}
            >
              {tree.complete ? (
                <Layout {...props} />
              ) : (
                <div className="incomplete"></div>
              )}
            </div>
          );
        case TreeKind.Leaf:
          return (
            <div
              className={classNames('layout-container', { focused })}
              key={tree.id}
            >
              {tree.complete ? (
                <Layout {...props} />
              ) : (
                <input onChange={evt => console.log(evt.target.value)} />
              )}
            </div>
          );
      }
    };

    return layout(tree, self);
  };
}
