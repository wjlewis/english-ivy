export interface Grammar {
  entry: ProductionName;
  productions: { [name: string]: Production };
}

export interface Production {
  name: string;
  expansion: Expansion;
}

export type Expansion = Terminal | Sum | Product | Star | Plus;

export interface Terminal {
  kind: ExpansionKind.Terminal;
  pattern?: RegExp;
}

export interface Sum {
  kind: ExpansionKind.Sum;
  variants: ProductionName[];
}

export interface Product {
  kind: ExpansionKind.Product;
  members: ProductionName[];
}

export interface Star {
  kind: ExpansionKind.Star;
  of: ProductionName;
}

export interface Plus {
  kind: ExpansionKind.Plus;
  of: ProductionName;
}

export enum ExpansionKind {
  Terminal = 'Terminal',
  Sum = 'Sum',
  Product = 'Record',
  Star = 'Star',
  Plus = 'Plus',
}

export type ProductionName = string;
