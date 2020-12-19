// QUESTIONS
// Do we really need a separate array of productions (since all of this
// info is contained within the `entry` value)?

export class GrammarBuilder {
  private entry: WithAllProds<Production>;
  private productions: (Production | LatentProduction)[] = [];

  addProduction(name: string, expansion: Expansion | LatentExpansion): this {
    if (this.productions.find(prod => prod.name === name)) {
      throw new Error(`A production with the name "${name}" already exists.`);
    }

    this.productions.push({ name, expansion: expansion as any });
    return this;
  }

  startWith(entry: WithAllProds<Production>): this {
    this.entry = entry;

    return this;
  }

  build(): Grammar {
    const productions = this.productions.reduce(
      (acc, prod) => ({
        ...acc,
        // QUESTION Is this clone necessary?
        [prod.name]: { ...prod },
      }),
      {}
    );

    Object.values(productions).forEach((prod: any) => {
      Object.entries(prod.expansion).forEach(([key, value]) => {
        if (
          // Make sure this includes all relevant keys
          ['alts', 'seq', 'of'].includes(key) &&
          typeof value === 'function'
        ) {
          prod.expansion[key] = value(productions);
        }
      });
    });

    const entry =
      typeof this.entry === 'function' ? this.entry(productions) : this.entry;

    return {
      entry,
      productions,
    };
  }

  static Epsilon(): Expansion {
    return {
      kind: ExpansionKind.Epsilon,
    };
  }

  static Terminal(
    isValid?: TerminalValidator,
    transform?: TerminalTransformer
  ): Expansion {
    return {
      kind: ExpansionKind.Terminal,
      isValid,
      transform,
    };
  }

  static Alt(alts: WithAllProds<Production[]>): Expansion | LatentExpansion {
    return {
      kind: ExpansionKind.Alt,
      alts,
    };
  }

  static Seq(seq: WithAllProds<Production[]>): Expansion | LatentExpansion {
    return {
      kind: ExpansionKind.Seq,
      seq,
    };
  }

  static Star(of: WithAllProds<Production>): Expansion | LatentExpansion {
    return {
      kind: ExpansionKind.Star,
      of,
    };
  }

  static Plus(of: WithAllProds<Production>): Expansion | LatentExpansion {
    return {
      kind: ExpansionKind.Plus,
      of,
    };
  }

  static Optional(of: WithAllProds<Production>): Expansion | LatentExpansion {
    return {
      kind: ExpansionKind.Optional,
      of,
    };
  }
}

export type WithAllProds<T> = T | ((allProds: AllProds) => T);

export type AllProds = { [name: string]: Production };

export interface Grammar {
  entry: Production;
  productions: AllProds;
}

export interface Production {
  name: string;
  expansion: Expansion;
}

export interface LatentProduction {
  name: string;
  expansion: LatentExpansion;
}

export type Expansion = Epsilon | Terminal | Alt | Seq | Star | Plus | Optional;

export type LatentExpansion =
  | LatentAlt
  | LatentSeq
  | LatentStar
  | LatentPlus
  | LatentOptional;

export interface Epsilon {
  kind: ExpansionKind.Epsilon;
}

export interface Terminal {
  kind: ExpansionKind.Terminal;
  isValid?: TerminalValidator;
  transform?: TerminalTransformer;
}

export type TerminalValidator = (input: string) => ValidationError[];

export type TerminalTransformer = (input: string) => any;

export interface Alt {
  kind: ExpansionKind.Alt;
  alts: Production[];
}

export interface LatentAlt {
  kind: ExpansionKind.Alt;
  alts: WithAllProds<Production[]>;
}

export interface Seq {
  kind: ExpansionKind.Seq;
  seq: Production[];
}

export interface LatentSeq {
  kind: ExpansionKind.Seq;
  seq: WithAllProds<Production[]>;
}

export interface Star {
  kind: ExpansionKind.Star;
  of: Production;
}

export interface LatentStar {
  kind: ExpansionKind.Star;
  of: WithAllProds<Production>;
}

export interface Plus {
  kind: ExpansionKind.Plus;
  of: Production;
}

export interface LatentPlus {
  kind: ExpansionKind.Plus;
  of: WithAllProds<Production>;
}

export interface Optional {
  kind: ExpansionKind.Optional;
  of: Production;
}

export interface LatentOptional {
  kind: ExpansionKind.Optional;
  of: WithAllProds<Production>;
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

export type ValidationError = string;
