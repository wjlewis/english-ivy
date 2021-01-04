import React from 'react';
import { useReducer } from '../hooks/useReducer';
import { Grammar } from '../types/grammar';
import { Action } from '../types/action';
import * as actions from './actions';
import { LayoutFn, generateLayout } from './layout';
import { TreeZipper } from '../tree-zipper';
import './index.css';

export interface BufferProps {
  grammar: Grammar;
  layout: LayoutFn;
}

export enum BufferMode {
  Normal = 'Normal',
  AltOpts = 'AltOpts',
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

  const Layout = generateLayout(props.layout, state.zipper.toTree());

  return (
    <div className="buffer" tabIndex={0} onKeyDown={handleKeyDown}>
      <div className="tree">
        <Layout state={state} onTerminalChange={console.log} />
      </div>
    </div>
  );
};

export interface BufferState {
  zipper: TreeZipper<any, any>;
  mode: BufferMode;
}

function initState(grammar: Grammar): BufferState {
  throw new Error('unimpl!');
}

function reducer(grammar: Grammar) {
  return (state: BufferState, action: Action) => {
    switch (action.type) {
      default:
        return state;
    }
  };
}

function translateAction(grammar: Grammar) {
  return (state: BufferState, dispatch: React.Dispatch<Action>) => {
    return (action: Action) => {
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
