import React from 'react';
import classNames from 'classnames';
import { BufferMode, BufferState } from './index';
import { BufferTree } from './misc';
import { TreeKind } from '../tree-zipper';
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
  mode: BufferMode
): React.FC<LayoutProps> {
  return props => {
    // This component renders the user's desired layout while wrapping subtrees
    // appropriately. Note the second argument to `layout`: here we recursively
    // invoke `generateLayout` in order to "wrap" subtrees.
    const UserLayout = () =>
      layout(tree, subtree => {
        const Subtree = generateLayout(layout, subtree, focused, mode);

        return <Subtree {...props} key={subtree.id} />;
      });

    const isFocused = focused === tree.id;

    switch (tree.kind) {
      case TreeKind.Inner:
        return (
          <div
            className={classNames('layout-container', { focused: isFocused })}
          >
            <UserLayout />
          </div>
        );
      case TreeKind.Leaf:
        return (
          <div
            className={classNames('layout-container', { focused: isFocused })}
          >
            {mode !== BufferMode.TerminalInput ? (
              <UserLayout />
            ) : (
              <input onChange={evt => console.log(evt.target.value)} />
            )}
          </div>
        );
      case TreeKind.Todo:
        return (
          <div
            className={classNames('layout-container', { focused: isFocused })}
          >
            <div className="todo"></div>
          </div>
        );
    }
  };
}
