/* eslint-disable @typescript-eslint/no-use-before-define */
import { Id } from '../types/misc';

export class TreeZipper<A, B> {
  private focus: Tree<A, B>;
  private ctx: Ctx<A, B>;

  static fromTree<A, B>(tree: Tree<A, B>): TreeZipper<A, B> {
    const t = new TreeZipper<A, B>();
    t.focus = tree;
    t.ctx = { kind: CtxKind.AtRoot };
    return t;
  }

  toTreePkg(): TreePkg<A, B> {
    const focused = this.focus.id;
    const tree = this.toTree();

    return { tree, focused };
  }

  private toTree(): Tree<A, B> {
    if (this.ctx.kind === CtxKind.AtRoot) {
      return this.focus;
    }

    return this.toParent().toTree();
  }

  withFocus(fn: (tree: Tree<A, B>) => Tree<A, B>): TreeZipper<A, B> {
    const t = new TreeZipper<A, B>();

    t.focus = fn(this.focus);
    t.ctx = this.ctx;

    return t;
  }

  getFocus(): Tree<A, B> {
    return this.focus;
  }

  setData(data: A): TreeZipper<A, B> {
    const t = new TreeZipper<A, B>();
    t.focus = {
      ...this.focus,
      data,
    };
    t.ctx = this.ctx;

    return t;
  }

  setContent(content: B): TreeZipper<A, B> {
    if (this.focus.kind !== TreeKind.Leaf) {
      return this;
    }

    const t = new TreeZipper<A, B>();
    t.focus = {
      ...this.focus,
      content,
    };
    t.ctx = this.ctx;

    return t;
  }

  toFirstChild(): TreeZipper<A, B> {
    if (this.focus.kind !== TreeKind.Inner) {
      return this;
    }

    const t = new TreeZipper<A, B>();
    t.focus = this.focus.children[0];
    t.ctx = {
      kind: CtxKind.ToChild,
      // `toFirstChild` adds a new context, maintaining the chain of previous
      // contexts:
      parentCtx: this.ctx,
      parentData: this.focus.data,
      parentId: this.focus.id,
      before: [],
      after: this.focus.children.slice(1),
    };

    return t;
  }

  toParent(): TreeZipper<A, B> {
    if (this.ctx.kind !== CtxKind.ToChild) {
      return this;
    }

    const t = new TreeZipper<A, B>();

    const before = [...this.ctx.before];
    before.reverse();
    const children = [...before, this.focus, ...this.ctx.after];

    t.focus = {
      kind: TreeKind.Inner,
      data: this.ctx.parentData,
      id: this.ctx.parentId,
      children,
    };
    // `toParent` removes a context from the chain:
    t.ctx = this.ctx.parentCtx;

    return t;
  }

  toNextSibling(): TreeZipper<A, B> {
    if (this.ctx.kind !== CtxKind.ToChild || this.ctx.after.length === 0) {
      return this;
    }

    const t = new TreeZipper<A, B>();

    const [focus, ...after] = this.ctx.after;
    const before = [this.focus, ...this.ctx.before];

    t.focus = focus;
    t.ctx = {
      // `toNextSibling` and `toPrevSibling` _replace_ the current context with
      // a new one:
      ...this.ctx,
      before,
      after,
    };

    return t;
  }

  toPrevSibling(): TreeZipper<A, B> {
    if (this.ctx.kind !== CtxKind.ToChild || this.ctx.before.length === 0) {
      return this;
    }

    const t = new TreeZipper<A, B>();

    const [focus, ...before] = this.ctx.before;
    const after = [this.focus, ...this.ctx.after];

    t.focus = focus;
    t.ctx = {
      ...this.ctx,
      before,
      after,
    };

    return t;
  }
}

export interface TreePkg<A, B> {
  tree: Tree<A, B>;
  focused: Id;
}

export type Tree<A, B> = Inner<A, B> | Leaf<A, B> | Todo<A>;

export interface Inner<A, B> extends Common<A> {
  kind: TreeKind.Inner;
  children: Tree<A, B>[];
}

export interface Leaf<A, B> extends Common<A> {
  kind: TreeKind.Leaf;
  content: B;
}

export interface Todo<A> extends Common<A> {
  kind: TreeKind.Todo;
}

export interface Common<A> {
  data: A;
  id: Id;
}

export enum TreeKind {
  Inner = 'Inner',
  Leaf = 'Leaf',
  Todo = 'Todo',
}

type Ctx<A, B> = AtRoot | ToChild<A, B>;

interface AtRoot {
  kind: CtxKind.AtRoot;
}

interface ToChild<A, B> {
  kind: CtxKind.ToChild;
  parentData: A;
  parentId: Id;
  parentCtx: Ctx<A, B>;
  before: Tree<A, B>[];
  after: Tree<A, B>[];
}

enum CtxKind {
  AtRoot = 'AtRoot',
  ToChild = 'ToChild',
}
