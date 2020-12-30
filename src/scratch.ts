export enum BufferMode {
  Normal,
  AltOpts,
  TermInput,
}

const addCommand: Command = {
  matchingContext: {
    commandString: ['a'],
    mode: BufferMode.Normal,
  },
  exec: ['ADD_AFTER_FOCUS', 'FOCUS_NEXT_SIBLING'],
};

const paramComma: Command = {
  matchingContext: {
    commandString: [','],
    mode: BufferMode.TermInput,
    tree: {
      kind: 'Params',
      children: ['_*', '@', '_*'],
    },
  },
  exec: ['NORMAL_MODE', 'ADD_AFTER_FOCUS', 'FOCUS_NEXT_SIBLING', 'INSERT_MODE'],
};

const paramEnd: Command = {
  matchingContext: {
    commandString: [')'],
    mode: BufferMode.TermInput,
    tree: {
      kind: 'Params',
      children: ['_*', '@'],
    },
  },
  exec: ['NORMAL_MODE', 'FOCUS_PARENT'],
};

// What about defining custom operations?
// e.g. 'ROTATE_LEFT'
//
// For both Commands and Operations, we will need a suitable way of describing
// trees, including the types of parent nodes, the current focus, whether a node
// is complete, etc.
// These descriptions will need to be able to be matched against an existing
// tree.

export interface Command {
  matchingContext: Partial<CommandContext>;
  exec: OpId[];
}

export interface CommandContext {
  commandString: string[];
  mode: BufferMode;
  // Memoize `buildTree` so we don't waste energy on this twice?
  tree: Tree;
  altOpts: AltOpt[];
  // ...
}

export type OpId = string;

export type Tree = any;

export interface AltOpt {
  prodName: string;
  hints: string[];
}

// How should we handle `Alt` nodes?
// Specifically, should we include a node for the parent `Alt` node itself, or
// just the children?
// In other words, are `Alt` nodes _replaced_ by the selected variant, or do
// they _include_ the selected variant as a child?

// Here's what Haskell does:
//
// data Eq = Eq Expr Expr
//
// data Expr = Name | Num
//
// data Name = Name String
//
// data NUm = Num String
//
// withEq :: Eq -> ()
// withEq (Eq (Name n) (Num m)) = ()
//
// -- And not
// withEq' :: Eq -> ()
// withEq' (Eq (Expr (Name n)) (Expr (Num m))) = ()

const withNode = {
  type: 'Eq',
  children: [
    {
      type: 'Expr',
      children: [
        {
          type: 'Name',
          content: 'a',
        },
      ],
    },
    {
      type: 'Expr',
      children: [
        {
          type: 'Num',
          content: '42',
        },
      ],
    },
  ],
};

const withoutNode = {
  type: 'Eq',
  children: [
    {
      type: 'Name',
      content: 'a',
    },
    {
      type: 'Num',
      content: '42',
    },
  ],
};

// What about this?
export enum TreeKind {
  Inner = 'Inner',
  Leaf = 'Leaf',
  Todo = 'Todo',
}

export type TreeId = string;

export interface Inner {
  kind: TreeKind.Inner;
  id: TreeId;
  prodName: string;
  children: Tree[];
  focused: boolean;
}

export interface Leaf {
  kind: TreeKind.Leaf;
  id: TreeId;
  prodName: string;
  content: string;
  focused: boolean;
}

export interface Todo {
  kind: TreeKind.Todo;
  id: TreeId;
  prodName: string;
  focused: boolean;
}
