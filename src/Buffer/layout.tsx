import React from 'react';
import classNames from 'classnames';
import { BufferMode, BufferState } from './index';
import { BufferTree, filteredSumOptions } from './misc';
import { TreeKind } from '../tree-zipper';
import { Id } from '../types/misc';

export type LayoutFn = (tree: BufferTree, self: RecLayoutFn) => JSX.Element;

export type RecLayoutFn = (tree: BufferTree) => JSX.Element;

export interface LayoutProps {
  state: BufferState;
  onTerminalChange: (value: string) => any;
  onFilterChange: (value: string) => any;
}

export function generateLayout(
  layout: LayoutFn,
  tree: BufferTree,
  focused: Id,
  state: BufferState
): React.FC<LayoutProps> {
  return props => {
    const terminalRef = useVolatileInput();
    const filterRef = useVolatileInput();

    // This component renders the user's desired layout while wrapping subtrees
    // appropriately. Note the second argument to `layout`: here we recursively
    // invoke `generateLayout` in order to "wrap" subtrees.
    const UserLayout = () =>
      layout(tree, subtree => {
        const Subtree = generateLayout(layout, subtree, focused, state);

        return <Subtree {...props} key={subtree.id} />;
      });

    const isFocused = focused === tree.id;

    function handleTerminalChange(e: React.ChangeEvent<HTMLInputElement>) {
      props.onTerminalChange(e.target.value);
    }

    function handleFilterChange(e: React.ChangeEvent<HTMLInputElement>) {
      props.onFilterChange(e.target.value);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      switch (e.key) {
        case 'Enter':
        case 'Escape':
          break;
        default:
          e.stopPropagation();
      }
    }

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
            {state.mode === BufferMode.TerminalInput && isFocused ? (
              <input
                ref={terminalRef}
                value={state.terminalValue}
                onChange={handleTerminalChange}
                onKeyDown={handleKeyDown}
              />
            ) : (
              <UserLayout />
            )}
          </div>
        );

      case TreeKind.TerminalTodo:
        return (
          <div
            className={classNames('layout-container', { focused: isFocused })}
          >
            {state.mode === BufferMode.TerminalInput && isFocused ? (
              <input
                ref={terminalRef}
                value={state.terminalValue}
                onChange={handleTerminalChange}
                onKeyDown={handleKeyDown}
              />
            ) : (
              <div className="todo"></div>
            )}
          </div>
        );

      case TreeKind.SumTodo:
        return (
          <div
            className={classNames('layout-container', { focused: isFocused })}
          >
            <div className="todo"></div>

            {state.mode === BufferMode.SumOptions && isFocused && (
              <div className="todo-menu">
                <input
                  ref={filterRef}
                  value={state.sumOptionsFilter}
                  onChange={handleFilterChange}
                  onKeyDown={handleKeyDown}
                />
                {filteredSumOptions(state).map(opt => (
                  <div className="todo-menu__option" key={opt}>
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
    }
  };
}

function useVolatileInput() {
  const ref: React.RefObject<HTMLInputElement> = React.useRef(null);
  React.useEffect(() => {
    ref.current?.focus();
  }, []);

  return ref;
}
