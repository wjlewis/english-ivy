export interface Grammar {
  entry: ProductionName;
  productions: { [name: string]: Production };
}

export interface Production {
  name: string;
  expansion: Expansion;
}

export type Expansion = Epsilon | Terminal | Alt | Seq | Star | Plus | Optional;

export interface Epsilon {
  kind: ExpansionKind.Epsilon;
}

export interface Terminal {
  kind: ExpansionKind.Terminal;
  pattern?: RegExp;
}

export interface Alt {
  kind: ExpansionKind.Alt;
  alts: ProductionName[];
}

export interface Seq {
  kind: ExpansionKind.Seq;
  seq: ProductionName[];
}

export interface Star {
  kind: ExpansionKind.Star;
  of: ProductionName;
}

export interface Plus {
  kind: ExpansionKind.Plus;
  of: ProductionName;
}

export interface Optional {
  kind: ExpansionKind.Optional;
  of: ProductionName;
}

export enum ExpansionKind {
  Epsilon = 'Epsilon',
  Terminal = 'Terminal',
  Alt = 'Alt',
  Seq = 'Seq',
  Star = 'Star',
  Plus = 'Plus',
  Optional = 'Optional',
}

export type ProductionName = string;
