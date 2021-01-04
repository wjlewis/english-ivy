import { ProductionName } from './types/grammar';

export enum TreeKind {
  Inner = 'Inner',
  Leaf = 'Leaf',
}

export class Tree {
  children?: Tree[];
  content?: string;

  constructor(public kind: TreeKind, public prods: ProductionName[]) {}

  static Inner(prods: ProductionName[], children: Tree[]): Tree {
    const t = new Tree(TreeKind.Inner, prods);
    t.children = children;
    return t;
  }

  static Leaf(prods: ProductionName[], content: string): Tree {
    const t = new Tree(TreeKind.Leaf, prods);
    t.content = content;
    return t;
  }
}

/*

const gram = new Gb()
  .withProd('Exprs', Gb.Star('Expr'))
  .withProd('Expr', Gb.Sum('Atom', 'Cons'))
  .withProd('Atom', Gb.Sum('Name', 'Num', 'Nil'))
  .withProd('Cons', Gb.Prod({ car: 'Expr', cdr: 'Expr' }))
  .withProd('Name', Gb.Terminal(/^\w+$/))
  .withProd('Num', Gb.Terminal(/^\d+$/))
  .withProd('Nil', Gb.Terminal());

{
  prods: ['Exprs'],
  children: [
    {
      prods: ['Cons', 'Expr'],
      car: {
        prods: ['Name', 'Atom', 'Expr'],
        content: 'Alpha'
      },
      cdr: {
        prods: ['Cons', 'Expr'],
        car: {
          prods: ['Num', 'Atom', 'Expr'],
          content: '42'
        },
        cdr: {
          prods: ['Nil', 'Atom', 'Expr'],
        }
      }
    }
  ]
}

Prog = Stmt*

Stmt = 
  If {
    test: Expr,
    tru: Expr,
    fls?: Expr,
       ^ How to express this?
  }
  +
  Asng {
    lhs: Name,
    rhs: Expr,
  }

const gram = new Gb()
  .addProd('Prog', Gb.Star('Stmt'))
  .addProd('Stmt', Gb.Sum('If', 'Asgn'))
  .addProd('If', Gb.Prod({ test: 'Expr', tru: 'Expr', fls: 'Expr' }))
  .addProd('Asng', Gb.Prod({ lhs: 'Name', rhs: 'Expr' }))
  .addProd('Expr', Gb.Sum('Name', 'Num', 'Sum'))
  .addProd('Name', Gb.Terminal(...))
  .addProd('Num', Gb.Terminal(...))
  .addProd('Sum', Gb.Prod({ lhs: 'Expr', rhs: 'Expr' }))

n = 4;

if n {
  x = 42 + x;
}

###

A _path_ represents a sequence of choices

For instance, the filepath   /var/www/html/index.html   represents a sequence of
choices taken in a filesystem tree. If a filesystem path terminates in a file
that is not a directory, it is "definitive". Otherwise, it doesn't uniquely
identify a file.

###

Sum,
Product,
Star,
Terminal

1.
{
  prodPath: ['Prog'],
  children: [],
  focused: true
}

User types "i"
Adds `Stmt` child
As part of adding a `Sum` node, the mode is switched to `Options`
The user selects `Asgn`

2.
{
  prodPath: ['Prog'],
  children: [
    {
      prodPath: ['Asgn', 'Stmt'],
      lhs: {
        prodPath: ['Name'],
        content: null
        focused: true,
      },
      rhs: {
        prodPath: ['Expr'],
      }
    }
  ]
}

The user types in "a" "Tab", which updates the `content` field in the name node,
and moves focus to the rhs

3.
{
  prodPath: ['Prog'],
  children: [
    {
      prodPath: ['Asgn', 'Stmt'],
      lhs: {
        prodPath: ['Name'],
        content: 'a' 
      },
      rhs: {
        prodPath: ['Expr'],
        focused: true,
      }
    }
  ]
}

The user presses "i", which switches the mode to `Options`. They then select the
option for 'Num'

4.
{
  prodPath: ['Prog'],
  children: [
    {
      prodPath: ['Asgn', 'Stmt'],
      lhs: {
        prodPath: ['Name'],
        content: 'a' 
      },
      rhs: {
        prodPath: ['Num', 'Expr'],
        content: '42'
        focused: true,
      }
    }
  ]
}

a*
a+
a?

Expr = Cons | Atom

Cons = {
  car: Expr,
  cdr: Expr,
}

Atom = Name | Num | Nil

If = {
  test: Expr,
  true: Expr,
  false: Expr?
}

Fn = {
  params: Param*,
  body: Stmt+,
}

const gram = new Gb()
  .where('Prog', Gb.Star('Stmt'))
  .where('Stmt', Gb.Sum(
    'If', 'Fn',
  ))
  .where('If', Gb.Product({
    test: 'Expr',
    tru: 'Expr',
    fls: Gb.Optional('Expr')
  }))
  .where('Expr', Gb.Sum(
    'Name', 'Num', 'Sum', 'Prod',
  ))
  .where('Fn', Gb.Product({
    params: Gb.Star('Param'),
    body: Gb.Plus('Stmt'),
  }))
  .where('Name', Gb.Terminal(...))
  .where('Sum', Gb.Product({
    lhs: 'Expr',
    rhs: 'Expr',
  }))

create Prog:
{
  prodPath: ['Prog'],
  children: []
}

create Stmt:
{
  prodPath: ['Stmt']
}

create If:
{
  prodPath: ['If', 'Stmt'],
  test: {
    prodPath: ['Expr'],
  },
  tru: {
    prodPath: ['Expr'],
  },
  fls: {
    prodPath: ['Expr'],
  }
}


 */

type Production = ProductionName | Sum | Product | Star | Optional | Terminal;

interface Common {
  prodPath: string[];
}

interface Sum extends Common {
  alts: Production[];
}

interface Product extends Common {
  record: {
    [name: string]: Production;
  };
}

// A?
// is the same as
// A | ()
// where `()` is the empty product
//
// .where('X', Gb.Optional('A'))
// .where('A', Gb.Terminal())
//
// .where('X', Gb.Sum('A', 'Nothing'))
// .where('A', Gb.Terminal())
// .where('Nothing', Gb.Product())
//
// Is there a way to make these work the same?

/*

Optional
{
  prodPath: ['X'],
}

Product
{
  prodPath: ['X'],
}

 */

interface Star extends Common {
  children: Production[];
}

interface Optional extends Common {
  of: Production;
}

interface Terminal extends Common {
  content: string;
  pattern?: RegExp;
}
