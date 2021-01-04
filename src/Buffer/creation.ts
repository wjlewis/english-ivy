import { v4 as uuid } from 'uuid';
import {
  ExpansionKind,
  Grammar,
  Plus,
  Production,
  Seq,
} from '../types/grammar';
import { TreeKind } from '../types/tree';
import { Node } from '../types/node';
import { Id } from '../types/misc';
import { flatten1 } from '../tools';

export interface NodePackage {
  rootId: Id;
  nodes: Node[];
}

// Creates a new structure representing a tree produced with the provided
// production. Returns the ID of the root of the tree, and all the nodes in it.
export function createProdInst(
  grammar: Grammar,
  prodName: string,
  parent: null | Id
): NodePackage {
  const production = grammar.productions[prodName];

  if (!production) {
    throw new Error(`Missing production \`${prodName}\`.`);
  }

  // Terminal nodes have no children, so we treat them separately
  if (production.expansion.kind === ExpansionKind.Terminal) {
    const id = uuid();

    const node = {
      id,
      kind: TreeKind.Leaf as TreeKind.Leaf,
      prod: production.name,
      content: null,
      // A freshly created terminal node is initially incomplete
      complete: false,
      parent,
    };

    return { rootId: id, nodes: [node] };
  } else {
    switch (production.expansion.kind) {
      case ExpansionKind.Alt:
        return createSingle(production, parent, false);
      case ExpansionKind.Star:
      case ExpansionKind.Optional:
        return createSingle(production, parent, true);
      case ExpansionKind.Seq:
        return createSeq(grammar, production, parent);
      case ExpansionKind.Plus:
        return createPlus(grammar, production, parent);
    }
  }
}

function createSingle(
  production: Production,
  parent: null | Id,
  complete: boolean
): NodePackage {
  const id = uuid();

  const node = {
    id,
    kind: TreeKind.Inner as TreeKind.Inner,
    type: production.name,
    children: [],
    complete,
    parent,
  };

  return { rootId: id, nodes: [node] };
}

function createSeq(
  grammar: Grammar,
  production: Production,
  parent: null | Id
): NodePackage {
  const id = uuid();

  const expansion = production.expansion as Seq;
  const childrenPackage = expansion.seq.map(prodName =>
    createProdInst(grammar, prodName, id)
  );

  const children = childrenPackage.map(({ rootId }) => rootId);
  const newNodes = flatten1(childrenPackage.map(({ nodes }) => nodes));

  const rootNode = {
    id,
    kind: TreeKind.Inner as TreeKind.Inner,
    type: production.name,
    children,
    complete: true,
    parent,
  };

  return {
    rootId: id,
    nodes: [rootNode, ...newNodes],
  };
}

function createPlus(
  grammar: Grammar,
  production: Production,
  parent: null | Id
): NodePackage {
  const id = uuid();

  const expansion = production.expansion as Plus;
  const childPackage = createProdInst(grammar, expansion.of, id);

  const children = [childPackage.rootId];
  const newNodes = childPackage.nodes;

  const rootNode = {
    id,
    kind: TreeKind.Inner as TreeKind.Inner,
    type: production.name,
    children,
    complete: true,
    parent,
  };

  return {
    rootId: id,
    nodes: [rootNode, ...newNodes],
  };
}
