import { TreeKind, TreeId } from './tree';

export type Node = InnerNode | LeafNode;

export interface InnerNode {
  id: TreeId;
  kind: TreeKind.Inner;
  type: string;
  children: TreeId[];
  parent: null | TreeId;
  complete: boolean;
}

export interface LeafNode {
  id: TreeId;
  kind: TreeKind.Leaf;
  type: string;
  content: null | string;
  parent: null | TreeId;
  complete: boolean;
}
