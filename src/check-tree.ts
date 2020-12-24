import { Grammar, ExpansionKind } from './types/grammar';
import { Tree, Leaf, TreeKind } from './types/tree';

export function checkTree(
  tree: Tree,
  grammar: Grammar,
  parent: Tree | null = null
): void {
  const production = grammar.productions[tree.type];

  if (!production) {
    throw new Error(`Production ${tree.type} does not exist.`);
  }

  // TODO Do we need/want this parent check?
  // if (tree.parent !== parent) {
  //   throw new Error(
  //     `Wrong parent. Expected ${JSON.stringify(
  //       parent
  //     )}, but got ${JSON.stringify(tree.parent)}.`
  //   );
  // }

  if (parent === null && tree.type !== grammar.entry) {
    throw new Error(
      `Toplevel node must match the grammar's entry. Expected ${grammar.entry} but got ${tree.type}.`
    );
  }

  switch (tree.kind) {
    case TreeKind.Inner:
      switch (production.expansion.kind) {
        case ExpansionKind.Epsilon:
          // No children
          // TODO Should this be a `Leaf` node?
          if (tree.children.length > 0) {
            throw new Error(
              `Tree associated with \`Epsilon\` cannot have children (${JSON.stringify(
                tree
              )}).`
            );
          }

          return;

        case ExpansionKind.Terminal:
          // Not possible for inner node
          throw new Error(
            `Inner tree cannot have \`Terminal\` kind (${JSON.stringify(
              tree
            )}).`
          );

        case ExpansionKind.Alt:
          // Exactly one child
          // With one of the alternative types
          if (tree.children.length !== 1) {
            throw new Error(
              `Tree must have exactly 1 child (${JSON.stringify(tree)}).`
            );
          }

          if (!production.expansion.alts.includes(tree.children[0].type)) {
            throw new Error(
              `Tree's child must have one of the following types: ${
                production.expansion.alts
              } (${JSON.stringify(tree)}).`
            );
          }

          return checkTree(tree.children[0], grammar, tree);

        case ExpansionKind.Seq:
          // Same number of children in production expansion
          // Each child has the correct type
          if (tree.children.length !== production.expansion.seq.length) {
            const { length } = production.expansion.seq;
            throw new Error(
              `Tree must have exactly ${length} children (${JSON.stringify(
                tree
              )}).`
            );
          }

          tree.children.forEach((child, i) => {
            // Why is inference failing here?
            const expected = (production.expansion as any).seq[i];
            if (child.type !== expected) {
              throw new Error(
                `Expected child ${i} to have type ${expected}, not ${child.type}.`
              );
            }

            return checkTree(child, grammar, tree);
          });

          return;

        case ExpansionKind.Star:
          // All children have the correct type
          tree.children.forEach(child => {
            if (child.type !== (production.expansion as any).of) {
              throw new Error(
                `Expected all children to have type ${
                  (production.expansion as any).of
                }, not ${child.type} (${JSON.stringify(tree)}).`
              );
            }

            return checkTree(child, grammar, tree);
          });

          return;

        case ExpansionKind.Plus:
          // At least one child
          // All children have the correct type
          if (tree.children.length === 0) {
            throw new Error(
              `\`Plus\` expansion requires at least one child (${JSON.stringify(
                tree
              )}).`
            );
          }

          // Same check as for `Star`, above
          tree.children.forEach(child => {
            if (child.type !== (production.expansion as any).of) {
              throw new Error(
                `Expected all children to have type ${
                  (production.expansion as any).of
                }, not ${child.type} (${JSON.stringify(tree)}).`
              );
            }

            return checkTree(child, grammar, tree);
          });

          return;

        case ExpansionKind.Optional:
          // Exactly zero or one child
          // With the correct type
          if (tree.children.length > 1) {
            throw new Error(
              `\`Optional\` kind requires exactly zero or one children (${JSON.stringify(
                tree
              )})`
            );
          }

          if (tree.children.length === 1) {
            const actual = tree.children[0].type;
            const expected = production.expansion.of;
            if (actual !== expected) {
              throw new Error(
                `Expected child to have type ${expected}, not ${actual} (${JSON.stringify(
                  tree
                )}).`
              );
            }

            return checkTree(tree.children[0], grammar, parent);
          }

          return;
      }

    case TreeKind.Leaf:
      if (production.expansion.kind !== ExpansionKind.Terminal) {
        throw new Error(
          `Leaf must be associated with a terminal, not: ${production.expansion.kind}.`
        );
      }

      if (production.expansion.pattern) {
        const { pattern } = production.expansion;
        const leaf = tree as Leaf;
        if (!pattern.test(leaf.content)) {
          throw new Error(
            `Leaf's content doesn't match pattern: (content: ${leaf.content}, pattern: ${pattern})`
          );
        }
      }
      return;
  }
}
