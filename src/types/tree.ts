import { ProductionName } from './grammar';

export type Tree = Inner | Leaf | Todo;

export interface Inner extends Common {
  kind: TreeKind.Inner;
  children: Tree[];
}

export interface Leaf extends Common {
  kind: TreeKind.Leaf;
  content: string;
}

export interface Todo extends Common {
  kind: TreeKind.Todo;
}

export enum TreeKind {
  Inner = 'Inner',
  Leaf = 'Leaf',
  Todo = 'Todo',
}

interface Common {
  prod: ProductionName;
  focused: boolean;
}
