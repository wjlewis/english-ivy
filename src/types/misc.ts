import { Tree } from './tree';

export type LayoutFn = (tree: Tree, self: RecLayoutFn) => JSX.Element;

export type RecLayoutFn = (tree: Tree) => JSX.Element;
