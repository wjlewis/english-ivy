import React from 'react';
import { useReducer } from '../hooks/useReducer';
import { ExpansionKind, Grammar } from '../types/grammar';
import { Action } from '../types/action';
import * as actions from './actions';
import { LayoutFn, generateLayout } from './layout';
import {
  Zipper,
  createInhabitant,
  addChild,
  toFirstChild,
  toParent,
  toNextSibling,
  toPrevSibling,
} from './misc';
import { TreeZipper } from '../tree-zipper';
import './index.css';

export interface BufferProps {
  grammar: Grammar;
  layout: LayoutFn;
}

export enum BufferMode {
  Normal = 'Normal',
  SumOptions = 'SumOptions',
  TerminalInput = 'TerminalInput',
}

const Buffer: React.FC<BufferProps> = props => {
  const [state, dispatch] = useReducer(
    reducer(props.grammar),
    initState(props.grammar),
    translateAction(props.grammar),
    log
  );

  function handleKeyDown(evt: React.KeyboardEvent) {
    dispatch(actions.Input(evt.key));
  }

  const { tree, focused } = state.zipper.toTreePkg();
  const Layout = generateLayout(props.layout, tree, focused, state.mode);

  return (
    <div className="buffer" tabIndex={0} onKeyDown={handleKeyDown}>
      <div className="tree">
        <Layout state={state} onTerminalChange={console.log} />
      </div>
    </div>
  );
};

export interface BufferState {
  zipper: Zipper;
  mode: BufferMode;
}

function initState(grammar: Grammar): BufferState {
  return {
    zipper: TreeZipper.fromTree(createInhabitant(grammar, grammar.entry)),
    mode: BufferMode.Normal,
  };
}

function reducer(grammar: Grammar) {
  return (state: BufferState, action: Action) => {
    switch (action.type) {
      case actions.ActionType.AddChild:
        return addChild(state, action.payload, grammar);
      case actions.ActionType.ToFirstChild:
        return toFirstChild(state);
      case actions.ActionType.ToParent:
        return toParent(state);
      case actions.ActionType.ToPrevSibling:
        return toPrevSibling(state);
      case actions.ActionType.ToNextSibling:
        return toNextSibling(state);
      default:
        return state;
    }
  };
}

function translateAction(grammar: Grammar) {
  return (state: BufferState, dispatch: React.Dispatch<Action>) => {
    return (action: Action) => {
      switch (state.mode) {
        case BufferMode.Normal:
          switch (action.type) {
            case actions.ActionType.Input:
              const focusedProdName = state.zipper.getFocus().data.prodPath[0];
              const focusedProd = grammar.productions[focusedProdName];

              switch (action.payload) {
                case 'i':
                  switch (focusedProd.expansion.kind) {
                    case ExpansionKind.Terminal:
                      console.log('Switch to `TerminalInput` mode');
                      break;
                    case ExpansionKind.Product:
                      // Do nothing: there is nothing to add to a product
                      break;
                    case ExpansionKind.Sum:
                      console.log(
                        'Swich to `SumOptions` mode and populate options'
                      );
                      break;
                    case ExpansionKind.Star:
                    case ExpansionKind.Plus:
                      return dispatch(
                        actions.AddChild(focusedProd.expansion.of)
                      );
                  }
                  break;
                case 'j':
                  return dispatch(actions.ToFirstChild());
                case 'k':
                  return dispatch(actions.ToParent());
                case 'f':
                  return dispatch(actions.ToNextSibling());
                case 'd':
                  return dispatch(actions.ToPrevSibling());
              }
          }
          break;

        default:
          break;
      }

      return dispatch(action);
    };
  };
}

function log(state: BufferState, dispatch: React.Dispatch<Action>) {
  return (action: Action) => {
    console.log(JSON.stringify(action, null, 2));
    dispatch(action);
  };
}

export default Buffer;
