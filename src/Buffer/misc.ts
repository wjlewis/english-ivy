import { v4 as uuid } from 'uuid';
import { BufferState } from '.';
import { Tree, TreeKind, TreeZipper, Inner } from '../tree-zipper';
import { Grammar, ProductionName, ExpansionKind } from '../types/grammar';

export type BufferTree = Tree<BufferTreeData, string>;

export type Zipper = TreeZipper<BufferTreeData, string>;

export interface BufferTreeData {
  prodPath: ProductionName[];
}

export function createInhabitant(
  grammar: Grammar,
  prodName: ProductionName
): BufferTree {
  const prod = grammar.productions[prodName];

  const id = uuid();
  const data = { prodPath: [prodName] };
  const common = { id, data };

  switch (prod.expansion.kind) {
    case ExpansionKind.Terminal:
    case ExpansionKind.Sum:
      return {
        kind: TreeKind.Todo,
        ...common,
      };
    case ExpansionKind.Product:
      return {
        kind: TreeKind.Inner,
        ...common,
        children: prod.expansion.members.map(mem =>
          createInhabitant(grammar, mem)
        ),
      };
    case ExpansionKind.Star:
      return {
        kind: TreeKind.Inner,
        ...common,
        children: [],
      };
    case ExpansionKind.Plus:
      return {
        kind: TreeKind.Inner,
        ...common,
        children: [createInhabitant(grammar, prod.expansion.of)],
      };
  }
}

export function addChild(
  state: BufferState,
  prodName: ProductionName,
  grammar: Grammar
): BufferState {
  const subtree = createInhabitant(grammar, prodName);

  return {
    ...state,
    zipper: state.zipper.withFocus(focus => ({
      ...focus,
      children: [...(focus as Inner<BufferTreeData, string>).children, subtree],
    })),
  };
}

export function toFirstChild(state: BufferState): BufferState {
  return {
    ...state,
    zipper: state.zipper.toFirstChild(),
  };
}

export function toParent(state: BufferState): BufferState {
  return {
    ...state,
    zipper: state.zipper.toParent(),
  };
}

export function toNextSibling(state: BufferState): BufferState {
  return {
    ...state,
    zipper: state.zipper.toNextSibling(),
  };
}

export function toPrevSibling(state: BufferState): BufferState {
  return {
    ...state,
    zipper: state.zipper.toPrevSibling(),
  };
}
