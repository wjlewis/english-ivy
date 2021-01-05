import React from 'react';
import classNames from 'classnames';
import { BufferState } from './index';
import { BufferTree } from './misc';
import { TreeKind } from '../tree-zipper';
import { ProductionName } from '../types/grammar';
import { Id } from '../types/misc';

export type LayoutFn = (tree: BufferTree, self: RecLayoutFn) => JSX.Element;

export type RecLayoutFn = (tree: BufferTree) => JSX.Element;

export interface LayoutProps {
  state: BufferState;
  onTerminalChange: (path: string[], value: string) => any;
}

export function generateLayout(
  layout: LayoutFn,
  tree: BufferTree,
  focused: Id,
  path: ProductionName[] = []
): React.FC<LayoutProps> {
  return props => {
    const self = (tree: BufferTree) => {
      const Layout = generateLayout(layout, tree, focused, [
        tree.data.prodPath[0],
        ...path,
      ]);

      const isFocused = focused === tree.id;

      const key = path.join('.');

      switch (tree.kind) {
        case TreeKind.Inner:
          return (
            <div
              className={classNames('layout-container', { focused: isFocused })}
              key={key}
            >
              <Layout {...props} />
            </div>
          );
        case TreeKind.Leaf:
          return (
            <div
              className={classNames('layout-container', { focused: isFocused })}
              key={key}
            >
              {tree.content !== null ? (
                <Layout {...props} />
              ) : (
                <input onChange={evt => console.log(evt.target.value)} />
              )}
            </div>
          );
        case TreeKind.Todo:
          return (
            <div
              className={classNames('layout-container', { focused: isFocused })}
              key={key}
            ></div>
          );
      }
    };

    return layout(tree, self);
  };
}
