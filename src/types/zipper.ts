import { Tree } from './tree';

//
// Focus
//
type Node = Inner | Terminal;

export interface Inner {
  kind: NodeKind.Inner;
  children: ZippedArray<Node>;
}

export interface Terminal {
  kind: NodeKind.Terminal;
  content: null | string;
}

export enum NodeKind {
  Inner = 'Inner',
  Terminal = 'Terminal',
}

//
// Context
//
export type Context = AtRoot | ToChildren;

export interface AtRoot {
  kind: ContextKind.AtRoot;
}

export interface ToChildren {
  kind: ContextKind.ToChildren;
  parentCtx: Context;
}

export enum ContextKind {
  AtRoot = 'AtRoot',
  ToChildren = 'ToChildren',
}

export class ZippedTree {
  private focus: Node;
  private context: Context;

  static fromTree(tree: Tree): ZippedTree {
    const zippedTree = new ZippedTree();

    return zippedTree;
  }

  toTree(): Tree {
    throw new Error('unimpl!');
  }

  toParent(): ZippedTree {
    return this;
  }

  toFirstChild(): ZippedTree {
    return this;
  }

  toNextSibling(): ZippedTree {
    return this;
  }

  toPrevSibling(): ZippedTree {
    return this;
  }

  // TODO
  // More complicated movements like swaps, rotations, etc.

  // Creation
  // Adds a new child when appropriate (Star, Plus, Optional when no existing
  // children).
  addChild(): ZippedTree {
    return this;
  }

  addSiblingBefore(): ZippedTree {
    return this;
  }

  addSiblingAfter(): ZippedTree {
    return this;
  }

  chooseAlt(tree: Tree): ZippedTree {
    return this;
  }

  updateTerminal(content: string): ZippedTree {
    return this;
  }

  // Removes the current focused subtree, along with as much of the parent
  // subtree as needed. Replaces Alt children with Todos, and likewise with
  // Terminals.
  removeFocus(): ZippedTree {
    return this;
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
