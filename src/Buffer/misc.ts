import { v4 as uuid } from 'uuid';
import { BufferMode, BufferState } from '.';
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
      return {
        kind: TreeKind.TerminalTodo,
        ...common,
      };
    case ExpansionKind.Sum:
      return {
        kind: TreeKind.SumTodo,
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

export function toSumOptionsMode(
  state: BufferState,
  variants: ProductionName[]
): BufferState {
  return {
    ...state,
    mode: BufferMode.SumOptions,
    sumOptions: variants,
  };
}

export function filterSumOptions(
  state: BufferState,
  filter: string
): BufferState {
  return {
    ...state,
    sumOptionsFilter: filter,
  };
}

export function returnToNormalMode(state: BufferState): BufferState {
  return {
    ...state,
    mode: BufferMode.Normal,
    sumOptions: [],
    sumOptionsFilter: '',
    terminalValue: '',
  };
}

export function selectSumOption(
  state: BufferState,
  grammar: Grammar
): BufferState {
  const filtered = filteredSumOptions(state);

  if (filtered.length === 0) {
    return state;
  }

  const subtree = createInhabitant(grammar, filtered[0]);

  return {
    ...state,
    // THINK Write a general-purpose updating function for objects
    zipper: state.zipper.withFocus(focus => ({
      ...subtree,
      data: {
        ...subtree.data,
        prodPath: [...subtree.data.prodPath, focus.data.prodPath[0]],
      },
    })),
  };
}

export function filteredSumOptions(state: BufferState): ProductionName[] {
  return state.sumOptions.filter(opt =>
    opt.toLowerCase().startsWith(state.sumOptionsFilter.toLowerCase())
  );
}

export function toTerminalInputMode(state: BufferState): BufferState {
  const focus = state.zipper.getFocus();
  const terminalValue = focus.kind === TreeKind.Leaf ? focus.content : '';

  return {
    ...state,
    mode: BufferMode.TerminalInput,
    terminalValue,
  };
}

export function updateTerminal(state: BufferState, value: string): BufferState {
  return {
    ...state,
    terminalValue: value,
  };
}

export function commitTerminalValue(state: BufferState): BufferState {
  return {
    ...state,
    zipper: state.zipper.withFocus(focus => ({
      ...focus,
      kind: TreeKind.Leaf,
      content: state.terminalValue,
    })),
  };
}
