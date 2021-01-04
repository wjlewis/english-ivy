import { v4 as uuid } from 'uuid';
import {
  ExpansionKind,
  Grammar,
  Production,
  ProductionName,
  Seq,
  Plus,
} from '../types/grammar';
import { Id } from '../types/misc';
import { Node, NodeKind } from '../types/node';
import { flatten1 } from '../tools';

export function generateSubtree(
  grammar: Grammar,
  prod: ProductionName,
  parent: null | Id
): NodePackage {
  const production = grammar.productions[prod];

  if (!production) {
    throw new Error(`Missing production "${prod}".`);
  }

  const incomplete = [
    ExpansionKind.Alt,
    ExpansionKind.Optional,
    ExpansionKind.Terminal,
  ].includes(production.expansion.kind);

  if (incomplete) {
    const id = uuid();

    return {
      rootId: id,
      nodes: [
        {
          id,
          parent,
          kind: NodeKind.Todo,
          prod: production.name,
        },
      ],
    };
  }

  switch (production.expansion.kind) {
    case ExpansionKind.Seq:
      return generateSeqSubtree(grammar, production, parent);
    case ExpansionKind.Star:
      return generateStarSubtree(production, parent);
    case ExpansionKind.Plus:
      return generatePlusSubtree(grammar, production, parent);
    default:
      throw new Error('unreachable');
  }
}

function generateSeqSubtree(
  grammar: Grammar,
  prod: Production,
  parent: null | Id
): NodePackage {
  const id = uuid();

  const expansion = prod.expansion as Seq;
  const packages = expansion.seq.map(prod =>
    generateSubtree(grammar, prod, id)
  );

  const children = packages.map(({ rootId }) => rootId);
  const nodes = flatten1(packages.map(({ nodes }) => nodes));

  const seqNode = {
    id,
    parent,
    prod: prod.name,
    kind: NodeKind.Inner as NodeKind.Inner,
    children,
  };

  return {
    rootId: id,
    nodes: [seqNode, ...nodes],
  };
}

function generateStarSubtree(prod: Production, parent: null | Id): NodePackage {
  const id = uuid();

  const starNode = {
    id,
    parent,
    prod: prod.name,
    kind: NodeKind.Inner as NodeKind.Inner,
    children: [],
  };

  return {
    rootId: id,
    nodes: [starNode],
  };
}

function generatePlusSubtree(
  grammar: Grammar,
  prod: Production,
  parent: null | Id
): NodePackage {
  const id = uuid();

  const expansion = prod.expansion as Plus;
  const { rootId, nodes } = generateSubtree(grammar, expansion.of, id);

  const plusNode = {
    id,
    parent,
    prod: prod.name,
    kind: NodeKind.Inner as NodeKind.Inner,
    children: [rootId],
  };

  return {
    rootId: id,
    nodes: [plusNode, ...nodes],
  };
}

export interface NodePackage {
  rootId: Id;
  nodes: Node[];
}
