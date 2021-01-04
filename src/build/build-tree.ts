import {
  Node,
  NodeKind,
  Inner as InnerNode,
  Alt as AltNode,
  Leaf as LeafNode,
} from '../types/node';
import { Tree, TreeKind } from '../types/tree';
import { Id } from '../types/misc';

export function buildTree(
  rootId: null | Id = null,
  nodes: Node[],
  focus: Id
): Tree {
  const root = nodes.find(node => node.id === rootId);

  if (!root) {
    throw new Error(`Node with ID "${rootId}" doesn't exist.`);
  }

  switch (root.kind) {
    case NodeKind.Inner:
      return buildInner(root, nodes, focus);
    case NodeKind.Alt:
      return buildAlt(root, nodes, focus);
    case NodeKind.Leaf:
      return buildLeaf(root, focus);
  }
}

function buildInner(node: InnerNode, nodes: Node[], focus: Id): Tree {
  const children = node.children.map(child => buildTree(child, nodes, focus));

  const { id, prod } = node;
  return {
    id,
    prod,
    focused: focus === node.id,
    kind: TreeKind.Inner,
    children,
  };
}

function buildAlt(node: AltNode, nodes: Node[], focus: Id): Tree {
  if (node.child === null) {
    const { id, prod } = node;
    return {
      id,
      prod,
      focused: id === focus,
      kind: TreeKind.AltTodo,
    };
  } else {
    // Elide this node in the tree if it has a child
    return buildTree(node.child, nodes, focus);
  }
}

function buildLeaf(node: LeafNode, focus: Id): Tree {
  const { id, prod } = node;
  const common = { id, prod, focused: id === focus };

  if (node.content === null) {
    return {
      ...common,
      kind: TreeKind.TerminalTodo,
    };
  } else {
    return {
      ...common,
      kind: TreeKind.Leaf,
      content: node.content,
    };
  }
}
