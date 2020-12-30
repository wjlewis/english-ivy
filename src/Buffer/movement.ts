import { BufferState } from './index';
import { TreeId, TreeKind } from '../types/tree';
import { Node } from '../types/node';

// TODO Hop over `Alt` and `Optional` nodes if they are "complete".
export function toFirstChild(state: BufferState): BufferState {
  const focusedNode = getNode(state, state.focus);

  if (focusedNode.kind === TreeKind.Leaf) {
    return state;
  } else if (focusedNode.children.length === 0) {
    return state;
  }

  const focus = focusedNode.children[0];

  return {
    ...state,
    focus,
  };
}

export function toParent(state: BufferState): BufferState {
  const focusedNode = getNode(state, state.focus);

  if (focusedNode.parent === null) {
    return state;
  }

  return {
    ...state,
    focus: focusedNode.parent,
  };
}

export function toNextSibling(state: BufferState): BufferState {
  const focusedNode = getNode(state, state.focus);

  if (focusedNode.parent === null) {
    return state;
  }

  const parentNode = getNode(state, focusedNode.parent);

  // This is technically impossible
  if (parentNode.kind === TreeKind.Leaf) {
    return state;
  }

  // TODO We should probably check for consistency here
  const currentIndex = parentNode.children.findIndex(
    childId => childId === focusedNode.id
  );

  if (currentIndex === parentNode.children.length - 1) {
    return state;
  }

  const nextFocus = parentNode.children[currentIndex + 1];

  return {
    ...state,
    focus: nextFocus,
  };
}

export function toPreviousSibling(state: BufferState): BufferState {
  const focusedNode = getNode(state, state.focus);

  if (focusedNode.parent === null) {
    return state;
  }

  const parentNode = getNode(state, focusedNode.parent);

  if (parentNode.kind === TreeKind.Leaf) {
    return state;
  }

  const currentIndex = parentNode.children.findIndex(
    childId => childId === focusedNode.id
  );

  if (currentIndex === 0) {
    return state;
  }

  const nextFocus = parentNode.children[currentIndex - 1];

  return {
    ...state,
    focus: nextFocus,
  };
}

function getNode(state: BufferState, nodeId: null | TreeId): Node {
  const node = state.nodes.find(node => node.id === nodeId);

  if (!node) {
    throw new Error(
      `[Inconsistency] Node with ID "${state.focus}" does not exist.`
    );
  }

  return node;
}
