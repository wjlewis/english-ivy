import { Id } from './misc';
import { ProductionName } from './grammar';

export type Node = Inner | Alt | Leaf;

export interface Inner extends Common {
  kind: NodeKind.Inner;
  children: Id[];
}

export interface Alt extends Common {
  kind: NodeKind.Alt;
  child: null | Id;
}

export interface Leaf extends Common {
  kind: NodeKind.Leaf;
  content: null | string;
}

export enum NodeKind {
  Inner = 'Inner',
  Alt = 'Alt',
  Leaf = 'Leaf',
}

export interface Common {
  id: Id;
  parent: null | Id;
  prod: ProductionName;
}
