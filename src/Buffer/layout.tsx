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
    const self = (tree: BufferTree) => {
      const Layout = generateLayout(layout, tree, focused, mode);
      return wrap(<Layout {...props} />, props, tree, focused, mode);
    };

    // THINK Is there a way to avoid calling `wrap` from two separate places?
    return wrap(layout(tree, self), props, tree, focused, mode);
  };
}

function wrap(
  elt: JSX.Element,
  props: LayoutProps,
  tree: BufferTree,
  focused: Id,
  mode: BufferMode
): JSX.Element {
  const isFocused = focused === tree.id;

  switch (tree.kind) {
    case TreeKind.Inner:
      return (
        <div
          className={classNames('layout-container', { focused: isFocused })}
          key={tree.id}
        >
          {elt}
        </div>
      );
    case TreeKind.Leaf:
      return (
        <div
          className={classNames('layout-container', { focused: isFocused })}
          key={tree.id}
        >
          {mode !== BufferMode.TerminalInput ? (
            { elt }
          ) : (
            <input onChange={evt => console.log(evt.target.value)} />
          )}
        </div>
      );
    case TreeKind.Todo:
      return (
        <div
          className={classNames('layout-container', { focused: isFocused })}
          key={tree.id}
        >
          <div className="todo"></div>
        </div>
      );
  }
}
