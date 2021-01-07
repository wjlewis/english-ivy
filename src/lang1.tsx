import { GrammarBuilder as Gb } from './grammar-builder';
import { RecLayoutFn } from './Buffer/layout';
import { TreeKind } from './tree-zipper';
import { BufferTree } from './Buffer/misc';

export const gram1 = new Gb()
  .where('Stmts', Gb.Star('Stmt'))
  .where('Stmt', Gb.Sum('Fn', 'Block', 'If', 'Return', 'Asgn'))
  .where('Fn', Gb.Product('Name', 'Params', 'Block'))
  .where('Name', Gb.Terminal(/^[a-zA-Z]+$/))
  .where('Params', Gb.Star('Name'))
  .where('Block', Gb.Star('Stmt'))
  .where('If', Gb.Product('Expr', 'Block', 'Block'))
  .where('Return', Gb.Product('Expr'))
  .where('Asgn', Gb.Product('Name', 'Expr'))
  .where('Expr', Gb.Sum('Name', 'Num', 'Sum', 'Prod'))
  .where('Num', Gb.Terminal(/^\d+$/))
  .where('Sum', Gb.Product('Expr', 'Expr'))
  .where('Prod', Gb.Product('Expr', 'Expr'))
  .startWith('Stmts')
  .build();

export const layout1 = (tree: BufferTree, self: RecLayoutFn): JSX.Element => {
  switch (tree.kind) {
    case TreeKind.Inner:
      switch (tree.data.prodPath[0]) {
        case 'Stmts':
          return <div className="stmts">{tree.children.map(self)}</div>;
        case 'Fn':
          return layoutFn(tree.children, self);
        case 'Params':
          return layoutParams(tree.children, self);
        case 'Block':
          return layoutBlock(tree.children, self);
        case 'If':
          return layoutIf(tree.children, self);
        case 'Return':
          return layoutReturn(tree.children, self);
        case 'Asgn':
          return layoutAsgn(tree.children, self);
        case 'Sum':
          return layoutSum(tree.children, self);
        case 'Prod':
          return layoutProd(tree.children, self);
      }
      break;
    case TreeKind.Leaf:
      switch (tree.data.prodPath[0]) {
        case 'Name':
          return <div className="name">{tree.content}</div>;
        case 'Num':
          return <div className="num">{tree.content}</div>;
      }
      break;
  }

  throw new Error('unreachable');
};

function layoutFn(children: BufferTree[], self: RecLayoutFn): JSX.Element {
  return (
    <div className="fn">
      <div>
        <span className="keyword">function</span>
        {self(children[0])}
        {self(children[1])}
      </div>
      {self(children[2])}
    </div>
  );
}

function layoutParams(children: BufferTree[], self: RecLayoutFn): JSX.Element {
  return (
    <span className="params">
      <span className="delim">(</span>
      {children.map((child, i) => {
        const isFinal = i === children.length - 1;
        return (
          <>
            {self(child)}
            {!isFinal && <span className="delim">,</span>}
          </>
        );
      })}
      <span className="delim">)</span>
    </span>
  );
}

function layoutBlock(children: BufferTree[], self: RecLayoutFn): JSX.Element {
  return (
    <div className="block">
      <span className="delim">{'{'}</span>
      {children.map(self)}
      <span className="delim">{'}'}</span>
    </div>
  );
}

function layoutIf(children: BufferTree[], self: RecLayoutFn): JSX.Element {
  return (
    <div className="if">
      <div>
        <span className="keyword">if</span>
        {self(children[0])}
      </div>
      {self(children[1])}
      {self(children[2])}
    </div>
  );
}

function layoutReturn(children: BufferTree[], self: RecLayoutFn): JSX.Element {
  return (
    <div className="return">
      <span className="keyword">return</span> {self(children[0])}
      <span className="delim">;</span>
    </div>
  );
}

function layoutAsgn(children: BufferTree[], self: RecLayoutFn): JSX.Element {
  return (
    <div className="asgn">
      {self(children[0])}
      <span className="op">=</span>
      {self(children[1])}
      <span className="delim">;</span>
    </div>
  );
}

// HYPOTHETICAL
function layoutExpr(tree: BufferTree, self: RecLayoutFn): JSX.Element {
  // Update so that single production is exposed
  // Maybe keep this consistent in zipper, and "jump" over sum nodes?
  // Sum nodes only have one child, so this might need its own type?
  switch (tree.data.prodPath[0]) {
    case 'Sum':
      return layoutSum((tree as any).children[0], self);
    case 'Prod':
      return layoutProd((tree as any).children[0], self);
    default:
      return self((tree as any).children[0]);
  }
}

function layoutSum(children: BufferTree[], self: RecLayoutFn): JSX.Element {
  return (
    <div className="expr">
      <span className="delim">(</span>
      <span className="op">+</span>
      {self(children[0])}
      {self(children[1])}
      <span className="delim">)</span>
    </div>
  );
}

function layoutProd(children: BufferTree[], self: RecLayoutFn): JSX.Element {
  return (
    <div className="expr">
      <span className="delim">(</span>
      <span className="op">*</span>
      {self(children[0])}
      {self(children[1])}
      <span className="delim">)</span>
    </div>
  );
}
