export type Tree = Inner | Leaf;

export interface Inner {
  kind: TreeKind.Inner;
  // This corresponds to the `kind` of the production that was used to create
  // this node:
  type: string;
  children: Tree[];
  parent: null | Tree;
  meta: TreeMeta;
}

export interface Leaf {
  kind: TreeKind.Leaf;
  // This corresponds to the `kind` of the production that was used to create
  // this node:
  type: string;
  content: string;
  parent: Tree;
  meta: TreeMeta;
}

export interface TreeMeta {
  focused: boolean;
}

export enum TreeKind {
  Inner = 'Inner',
  Leaf = 'Leaf',
}
