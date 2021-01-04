import { Node, NodeKind } from '../types/node';
import { Id } from '../types/misc';
import { replaceWith } from '../tools';
import { ExpansionKind, Grammar, ProductionName } from '../types/grammar';

export function removeSubtree(
  grammar: Grammar,
  nodes: Node[],
  rootId: Id
): Node[] {
  const root = nodes.find(node => node.id === rootId);

  if (!root) {
    throw new Error(`Node with ID "${rootId}" does not exist.`);
  }

  // If root kind is Leaf, replace with Todo
  if (root.kind === NodeKind.Leaf) {
    return replaceWith(
      nodes,
      node => node.id === rootId,
      node => ({
        id: node.id,
        parent: node.parent,
        prod: node.prod,
        kind: NodeKind.TerminalTodo as NodeKind.TerminalTodo,
      })
    );
  }

  // If root came from Alt, replace with appropriate Todo
  if (root.kind === NodeKind.Inner && root.altVariant !== undefined) {
    return replaceWith(
      nodes,
      node => node.id === rootId,
      node => ({
        id: node.id,
        parent: node.parent,
        prod: root.altVariant as ProductionName,
        kind: NodeKind.Todo as NodeKind.Todo,
      })
    );
  }

  const parent = nodes.find(node => node.id === root.parent);

  // If no parent, remove subtree
  if (!parent) {
    return nodes;
  }

  if (parent.kind !== NodeKind.Inner) {
    throw new Error(
      `A parent must have kind \`${NodeKind.Inner}\`, not \`${parent.kind}\`.`
    );
  }

  const production = grammar.productions[parent.prod];

  // If parent prod is Star, remove subtree
  if (production.expansion.kind === ExpansionKind.Star) {
    //
  }

  // If parent prod is Plus with more than one child, remove subtree
  // If parent prod is Optional with more than one child, remove subtree
  if (
    [ExpansionKind.Plus, ExpansionKind.Optional].includes(
      production.expansion.kind
    ) &&
    parent.children.length > 0
  ) {
    //
  }

  // Otherwise do nothing
  return nodes;
}
