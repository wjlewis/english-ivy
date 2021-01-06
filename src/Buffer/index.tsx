import React from 'react';
import { useReducer } from '../hooks/useReducer';
import { ExpansionKind, Grammar, ProductionName } from '../types/grammar';
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
  toSumOptionsMode,
  filterSumOptions,
  returnToNormalMode,
  selectSumOption,
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
  const bufferRef = React.useRef(null);
  const [state, dispatch] = useReducer(
    reducer(props.grammar),
    initState(props.grammar),
    translateAction(props.grammar),
    refocusBuffer(bufferRef),
    log
  );

  function handleKeyDown(evt: React.KeyboardEvent) {
    dispatch(actions.Input(evt.key));
  }

  const { tree, focused } = state.zipper.toTreePkg();
  const Layout = generateLayout(props.layout, tree, focused, state);

  return (
    <div
      className="buffer"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      ref={bufferRef}
    >
      <div className="tree">
        <Layout
          state={state}
          onTerminalChange={t => console.log(t)}
          onFilterChange={filter => dispatch(actions.FilterSumOptions(filter))}
        />
      </div>
    </div>
  );
};

export interface BufferState {
  zipper: Zipper;
  mode: BufferMode;
  sumOptions: ProductionName[];
  sumOptionsFilter: string;
}

function initState(grammar: Grammar): BufferState {
  return {
    zipper: TreeZipper.fromTree(createInhabitant(grammar, grammar.entry)),
    mode: BufferMode.Normal,
    sumOptions: [],
    sumOptionsFilter: '',
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
      case actions.ActionType.ToSumOptionsMode:
        return toSumOptionsMode(state, action.payload);
      case actions.ActionType.FilterSumOptions:
        return filterSumOptions(state, action.payload);
      case actions.ActionType.ReturnToNormalMode:
        return returnToNormalMode(state);
      case actions.ActionType.SelectSumOption:
        return selectSumOption(state, grammar);
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
                      // Switch to `TerminalInput` mode
                      break;
                    case ExpansionKind.Product:
                      // Do nothing: there is nothing to add to a product
                      break;
                    case ExpansionKind.Sum:
                      return dispatch(
                        actions.ToSumOptionsMode(focusedProd.expansion.variants)
                      );
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

        case BufferMode.SumOptions:
          switch (action.type) {
            case actions.ActionType.Input:
              switch (action.payload) {
                case 'Enter':
                  return dispatch(actions.SelectSumOption());
                case 'Escape':
                  return dispatch(actions.ReturnToNormalMode());
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

function refocusBuffer(bufferRef: React.RefObject<HTMLDivElement>) {
  return (state: BufferState, dispatch: React.Dispatch<Action>) => {
    return (action: Action) => {
      switch (action.type) {
        case actions.ActionType.SelectSumOption:
        case actions.ActionType.ReturnToNormalMode:
          dispatch(action);
          return bufferRef.current?.focus();
        default:
          return dispatch(action);
      }
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
