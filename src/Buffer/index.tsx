import React from 'react';
import { useReducer } from '../hooks/useReducer';
import { replaceWith } from '../tools';
import { createProdInst } from './creation';
import {
  toFirstChild,
  toParent,
  toNextSibling,
  toPreviousSibling,
} from './movement';
import { Grammar, ExpansionKind } from '../types/grammar';
import { LayoutFn } from '../types/misc';
import { Node } from '../types/node';
import { Tree, TreeKind, TreeId } from '../types/tree';
import { Action } from '../types/action';
import { generateLayout } from './layout';
import './index.css';

export interface BufferProps {
  grammar: Grammar;
  layout: LayoutFn;

  // TODO Add optional initial/partial tree
  // Use it to generate initial state (should be easy once this is working)
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
    dispatch(InputAction(evt.key));
  }

  const Layout =
    state.nodes.length > 0
      ? generateLayout(props.layout, buildTree(state.nodes, state.focus))
      : () => null;

  return (
    <div className="buffer" tabIndex={0} onKeyDown={handleKeyDown}>
      <div className="tree">
        <Layout state={state} onTerminalChange={console.log} />
      </div>

      {state.mode === BufferMode.AltOpts && <div>{state.altOpts}</div>}
    </div>
  );
};

export default Buffer;

//
// State
//
export interface BufferState {
  nodes: Node[];
  focus: null | TreeId;
  mode: BufferMode;
  altOpts: null | string[];
}

function initState(grammar: Grammar): BufferState {
  const { rootId, nodes } = createProdInst(grammar, grammar.entry, null);

  return {
    nodes,
    focus: rootId,
    mode: BufferMode.Normal,
    altOpts: null,
  };
}

//
// Actions
//
enum ActionType {
  Key = 'Key',
  BailCommand = 'BailCommand',
  ShowAltOptions = 'ShowAltOptions',
  CreateSeqEntry = 'CreateSeqEntry',
  CreateStarEntry = 'CreateStarEntry',
  ChooseOpt = 'ChooseOpt',
  EditTerminal = 'EditTerminal',
  MoveToFirstChild = 'MoveToFirstChild',
  MoveToParent = 'MoveToParent',
  MoveToNextSibling = 'MoveToNextSibling',
  MoveToPreviousSibling = 'MoveToPreviousSibling',
}

function InputAction(key: string): Action {
  return {
    type: ActionType.Key,
    payload: key,
  };
}

function BailCommand(): Action {
  return {
    type: ActionType.BailCommand,
  };
}

function ShowAltOptions(alts: string[]): Action {
  return {
    type: ActionType.ShowAltOptions,
    payload: alts,
  };
}

function CreateSeqEntry(seq: string[]): Action {
  return {
    type: ActionType.CreateSeqEntry,
    payload: seq,
  };
}

function CreateStarEntry(of: string): Action {
  return {
    type: ActionType.CreateStarEntry,
    payload: of,
  };
}

function ChooseOpt(opt: string): Action {
  return {
    type: ActionType.ChooseOpt,
    payload: opt,
  };
}

function EditTerminal(pattern?: RegExp): Action {
  return {
    type: ActionType.EditTerminal,
    payload: pattern,
  };
}

function MoveToFirstChild(): Action {
  return {
    type: ActionType.MoveToFirstChild,
  };
}

function MoveToParent(): Action {
  return {
    type: ActionType.MoveToParent,
  };
}

function MoveToNextSibling(): Action {
  return {
    type: ActionType.MoveToNextSibling,
  };
}

function MoveToPreviousSibling(): Action {
  return {
    type: ActionType.MoveToPreviousSibling,
  };
}

//
// Reducer
//
function reducer(grammar: Grammar) {
  return (state: BufferState, action: Action) => {
    switch (action.type) {
      case ActionType.BailCommand:
        return bailCommand(state);
      case ActionType.CreateStarEntry:
        return createStarEntry(grammar, state, action);
      case ActionType.ChooseOpt:
        return chooseOpt(grammar, state, action.payload);
      case ActionType.EditTerminal:
        return editTerminal(state, action.payload);
      case ActionType.ShowAltOptions:
        return showAltOptions(state, action.payload);
      case ActionType.MoveToFirstChild:
        return toFirstChild(state);
      case ActionType.MoveToParent:
        return toParent(state);
      case ActionType.MoveToNextSibling:
        return toNextSibling(state);
      case ActionType.MoveToPreviousSibling:
        return toPreviousSibling(state);
      default:
        return state;
    }
  };
}

function bailCommand(state: BufferState): BufferState {
  return {
    ...state,
    mode: BufferMode.Normal,
    altOpts: null,
  };
}

function showAltOptions(state: BufferState, alts: string[]): BufferState {
  return {
    ...state,
    mode: BufferMode.AltOpts,
    altOpts: alts,
  };
}

function createStarEntry(
  grammar: Grammar,
  state: BufferState,
  action: Action
): BufferState {
  const { rootId, nodes } = createProdInst(
    grammar,
    action.payload,
    state.focus
  );

  const newNodes = replaceWith(
    state.nodes,
    node => node.id === state.focus,
    node => ({
      ...node,
      children: [...(node as any).children, rootId],
    })
  );

  return {
    ...state,
    nodes: [...newNodes, ...nodes],
  };
}

function chooseOpt(
  grammar: Grammar,
  state: BufferState,
  prodName: string
): BufferState {
  const { rootId, nodes } = createProdInst(grammar, prodName, state.focus);

  const newNodes = replaceWith(
    state.nodes,
    node => node.id === state.focus,
    node => ({
      ...node,
      complete: true,
      children: [rootId],
    })
  );

  return {
    ...state,
    nodes: [...newNodes, ...nodes],
    mode: BufferMode.Normal,
    altOpts: null,
  };
}

function editTerminal(state: BufferState, pattern?: RegExp): BufferState {
  const focusedNode = state.nodes.find(node => node.id === state.focus);

  // How to make sure there is an input DOM element here?
  // Do we need another state for terminal nodes?
  // complete, incomplete, editable?

  // Attach change listener to DOM node -> get value from state, update state on
  // change?

  // Does this require layout hacks?
  // I think so

  return state;
}

//
// Middleware
//
function translateAction(grammar: Grammar) {
  return (state: BufferState, dispatch: React.Dispatch<Action>) => {
    return (action: Action) => {
      if (action.type !== ActionType.Key) {
        return dispatch(action);
      }

      if (action.payload === 'Escape') {
        return dispatch(BailCommand());
      }

      if (state.mode === BufferMode.Normal) {
        switch (action.payload) {
          // Creation
          case 'i':
            const prodName =
              state.nodes.find(node => node.id === state.focus)?.type ??
              grammar.entry;

            const prod = grammar.productions[prodName];

            switch (prod.expansion.kind) {
              case ExpansionKind.Alt:
                return dispatch(ShowAltOptions(prod.expansion.alts));
              case ExpansionKind.Seq:
                return dispatch(CreateSeqEntry(prod.expansion.seq));
              case ExpansionKind.Star:
                return dispatch(CreateStarEntry(prod.expansion.of));
              case ExpansionKind.Terminal:
                return dispatch(EditTerminal(prod.expansion.pattern));
            }
            break;

          // Removal

          // Movement
          case 'j':
            return dispatch(MoveToFirstChild());

          case 'k':
            return dispatch(MoveToParent());

          case 'e':
            return dispatch(MoveToPreviousSibling());

          case 'f':
            return dispatch(MoveToNextSibling());
        }
      } else if (state.mode === BufferMode.AltOpts) {
        const opt = state.altOpts?.find(opt =>
          opt.toLowerCase().startsWith(action.payload)
        );

        if (opt) {
          return dispatch(ChooseOpt(opt));
        } else {
          return dispatch(BailCommand());
        }
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

//
// Misc Stuff
//
function buildTree(nodes: Node[], focus: null | TreeId, nodeId?: TreeId): Tree {
  const node = nodeId
    ? nodes.find(node => node.id === nodeId)
    : nodes.find(node => node.parent === null);

  if (!node) {
    throw new Error(`Node with ID ${nodeId} doesn't exist`);
  }

  if (node.kind === TreeKind.Leaf) {
    return { ...node, focused: focus === node.id };
  }

  return {
    ...node,
    focused: focus === node.id,
    children: node.children.map(child => buildTree(nodes, focus, child)),
  };
}
