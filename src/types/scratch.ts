import { ProductionName } from './grammar';
import { Grammar } from './grammar';

export enum TreeKind {
  Inner = 'Inner',
  Leaf = 'Leaf',
  AltTodo = 'AltTodo',
  TerminalTodo = 'TerminalTodo',
}

export class Tree {
  public children?: Tree[];
  public content?: string;

  constructor(public kind: TreeKind, public prod: ProductionName) {}

  static Inner(prod: ProductionName, children: Tree[]): Tree {
    const t = new Tree(TreeKind.Inner, prod);
    t.children = children;
    return t;
  }

  static Leaf(prod: ProductionName, content: string): Tree {
    const t = new Tree(TreeKind.Leaf, prod);
    t.content = content;
    return t;
  }

  static AltTodo(prod: ProductionName): Tree {
    return new Tree(TreeKind.AltTodo, prod);
  }

  static TerminalTodo(prod: ProductionName): Tree {
    return new Tree(TreeKind.TerminalTodo, prod);
  }
}

export enum NodeKind {
  Inner = 'Inner',
  Alt = 'Alt',
  Terminal = 'Terminal',
}

export class Node {
  children?: ZippedArray<Node>;
  child?: Node;
  content?: string;

  constructor(public kind: NodeKind, public prod: ProductionName) {}

  static fromTree(tree: Tree, grammar: Grammar): Node {
    switch (tree.kind) {
      case TreeKind.Inner:
        return Node.fromInner(tree, grammar);
      case TreeKind.Leaf:
        return Node.fromLeaf(tree);
      case TreeKind.AltTodo:
        return Node.fromAltTodo(tree);
      case TreeKind.TerminalTodo:
        return Node.fromTerminalTodo(tree);
    }
  }

  private static fromInner(tree: Tree, grammar: Grammar): Node {
    const node = new Node(NodeKind.Inner, tree.prod);
    if (!tree.children) {
      throw new Error('Expected `Inner` tree to have children.');
    }

    const prod = grammar.productions[tree.prod];

    node.children = ZippedArray.fromArray(
      tree.children?.map(child => Node.fromTree(child, grammar))
    );
    return node;
  }

  private static fromLeaf(tree: Tree): Node {
    const node = new Node(NodeKind.Terminal, tree.prod);
    node.content = tree.content;
    return node;
  }

  private static fromAltTodo(tree: Tree): Node {
    return new Node(NodeKind.Inner, tree.prod);
  }

  private static fromTerminalTodo(tree: Tree): Node {
    return new Node(NodeKind.Terminal, tree.prod);
  }
}

export class ZippedArray<A> {
  private before: A[];
  private after: A[];
  public focus: A;

  static fromArray<A>(xs: A[]): ZippedArray<A> {
    if (xs.length === 0) {
      throw new Error('Cannot create zipper from empty array.');
    }

    const arr = new ZippedArray<A>();
    arr.before = [];
    const [focus, ...after] = xs;
    arr.focus = focus;
    arr.after = after;
    return arr;
  }

  update(x: A): ZippedArray<A> {
    const arr = new ZippedArray<A>();
    arr.before = this.before;
    arr.after = this.after;
    arr.focus = x;
    return arr;
  }

  next(): ZippedArray<A> {
    if (this.after.length === 0) {
      return this;
    }

    const arr = new ZippedArray<A>();
    arr.before = [this.focus, ...this.before];
    const [focus, ...after] = this.after;
    arr.focus = focus;
    arr.after = after;

    return arr;
  }

  prev(): ZippedArray<A> {
    if (this.before.length === 0) {
      return this;
    }

    const arr = new ZippedArray<A>();
    arr.after = [this.focus, ...this.after];
    const [focus, ...before] = this.before;
    arr.focus = focus;
    arr.before = before;

    return arr;
  }
}
