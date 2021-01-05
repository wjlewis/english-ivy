import { TreeZipper, Tree, TreeKind, Inner, Leaf } from './index';

describe('TreeZipper', () => {
  const tree: Tree<string, number> = {
    kind: TreeKind.Inner,
    data: 'A',
    id: '0',
    children: [
      {
        kind: TreeKind.Inner,
        data: 'B',
        id: '1',
        children: [
          {
            kind: TreeKind.Leaf,
            data: 'D',
            id: '2',
            content: 1,
          },
          {
            kind: TreeKind.Todo,
            id: '3',
            data: 'E',
          },
        ],
      },
      {
        kind: TreeKind.Inner,
        data: 'C',
        id: '4',
        children: [
          {
            kind: TreeKind.Leaf,
            data: 'F',
            id: '5',
            content: 2,
          },
        ],
      },
    ],
  };

  it('Allows for faithful navigation of its origin tree', () => {
    const z = TreeZipper.fromTree(tree);

    const z1 = z.toFirstChild();
    expect(z1.getFocus().data).toBe('B');

    const z2 = z1.toNextSibling();
    expect(z2.getFocus().data).toBe('C');

    const z3 = z2.toFirstChild();
    expect(z3.getFocus().data).toBe('F');

    const z4 = z3.toNextSibling();
    expect(z4.getFocus().data).toBe('F');

    const z5 = z4.toParent().toPrevSibling().toFirstChild();
    expect(z5.getFocus().data).toBe('D');

    const z6 = z5.toNextSibling();
    expect(z6.getFocus().data).toBe('E');

    const z7 = z6.toNextSibling().toNextSibling().toPrevSibling();
    expect(z7.getFocus().data).toBe('D');

    const z8 = z7.toParent().toParent();
    expect(z8.getFocus().data).toBe('A');
  });

  it('Allows for (pure) modification of its data', () => {
    const z = TreeZipper.fromTree(tree);

    const z1 = z.setData('A1');
    expect(z1.getFocus().data).toBe('A1');

    const z2 = z1.toFirstChild().toNextSibling().toFirstChild();
    const z3 = z2.setContent(42);
    expect((z3.getFocus() as Leaf<string, number>).content).toBe(42);

    const z4 = z3.toParent().toPrevSibling().toFirstChild().toNextSibling();
    const z5 = z4.setData('E1');

    expect(z5.getFocus().data).toBe('E1');

    expect(z5.toTreePkg()).toEqual({
      tree: {
        kind: TreeKind.Inner,
        data: 'A1',
        id: '0',
        children: [
          {
            kind: TreeKind.Inner,
            data: 'B',
            id: '1',
            children: [
              {
                kind: TreeKind.Leaf,
                data: 'D',
                id: '2',
                content: 1,
              },
              {
                kind: TreeKind.Todo,
                data: 'E1',
                id: '3',
              },
            ],
          },
          {
            kind: TreeKind.Inner,
            data: 'C',
            id: '4',
            children: [
              {
                kind: TreeKind.Leaf,
                data: 'F',
                id: '5',
                content: 42,
              },
            ],
          },
        ],
      },
      focused: '3',
    });
  });

  it('Allows for (pure) additions/removals', () => {
    const z = TreeZipper.fromTree({
      kind: TreeKind.Inner,
      data: 0,
      id: '0',
      children: [],
    });

    const z1 = z.withFocus(t => ({
      ...t,
      children: [
        {
          kind: TreeKind.Todo,
          data: 1,
          id: '1',
        },
      ],
    }));

    const z2 = z1.toFirstChild();

    expect(z2.getFocus().data).toBe(1);

    const z3 = z2.withFocus(t => ({
      kind: TreeKind.Leaf,
      data: 42,
      id: '2',
      content: 'test',
    }));

    expect(z3.getFocus().kind).toBe(TreeKind.Leaf);

    const z4 = z3.toParent();

    const z5 = z4.withFocus(t => ({
      ...t,
      children: [
        ...(t as Inner<number, string>).children,
        {
          kind: TreeKind.Todo,
          data: 5,
          id: '3',
        },
      ],
    }));

    const z6 = z5.toFirstChild().toNextSibling();

    expect(z6.getFocus().data).toBe(5);

    expect(z6.toTreePkg()).toEqual({
      tree: {
        kind: TreeKind.Inner,
        data: 0,
        id: '0',
        children: [
          {
            kind: TreeKind.Leaf,
            data: 42,
            id: '2',
            content: 'test',
          },
          {
            kind: TreeKind.Todo,
            data: 5,
            id: '3',
          },
        ],
      },
      focused: '3',
    });
  });
});
