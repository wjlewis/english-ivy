export type Tree = Inner | Leaf;

export interface Inner {
  id: TreeId;
  kind: TreeKind.Inner;
  // This corresponds to the `kind` of the production that was used to create
  // this node:
  type: string;
  children: Tree[];
  complete: boolean;
  focused: boolean;
}

export interface Leaf {
  id: TreeId;
  kind: TreeKind.Leaf;
  // This corresponds to the `kind` of the production that was used to create
  // this node:
  type: string;
  content: null | string;
  complete: boolean;
  focused: boolean;
}

export enum TreeKind {
  Inner = 'Inner',
  Leaf = 'Leaf',
}

export type TreeId = string;
