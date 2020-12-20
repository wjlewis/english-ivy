import {
  Grammar,
  Production,
  ProductionName,
  Expansion,
  ExpansionKind,
} from './types/grammar';

export class GrammarBuilder {
  private entry: ProductionName;
  private productions: Production[] = [];

  addProduction(name: string, expansion: Expansion): this {
    if (this.productions.find(prod => prod.name === name)) {
      throw new Error(`A production with the name "${name}" already exists.`);
    }

    this.productions.push({ name, expansion });

    return this;
  }

  startWith(entry: ProductionName): this {
    this.entry = entry;

    return this;
  }

  build(): Grammar {
    const productions = this.productions.reduce(
      (acc, prod) => ({
        ...acc,
        [prod.name]: prod,
      }),
      {}
    );

    if (!this.entry) {
      throw new Error(
        'No entry production selected.\n(did you call `.startWith(...)`?).'
      );
    }

    this.check(productions, this.entry);

    return {
      entry: this.entry,
      productions,
    };
  }

  static Epsilon(): Expansion {
    return {
      kind: ExpansionKind.Epsilon,
    };
  }

  static Terminal(pattern?: RegExp): Expansion {
    return {
      kind: ExpansionKind.Terminal,
      pattern,
    };
  }

  static Alt(...alts: ProductionName[]): Expansion {
    return {
      kind: ExpansionKind.Alt,
      alts,
    };
  }

  static Seq(...seq: ProductionName[]): Expansion {
    return {
      kind: ExpansionKind.Seq,
      seq,
    };
  }

  static Star(of: ProductionName): Expansion {
    return {
      kind: ExpansionKind.Star,
      of,
    };
  }

  static Plus(of: ProductionName): Expansion {
    return {
      kind: ExpansionKind.Plus,
      of,
    };
  }

  static Optional(of: ProductionName): Expansion {
    return {
      kind: ExpansionKind.Optional,
      of,
    };
  }

  private check(
    productions: { [name: string]: Production },
    entry: ProductionName
  ): void {
    if (!(entry in productions)) {
      throw new Error(
        `Entry production doesn't exist.\n(have you defined a production named \`${entry}\`?).`
      );
    }

    Object.values(productions).forEach(prod => {
      const references = this.getReferences(prod);

      for (let ref of references) {
        if (!(ref in productions)) {
          throw new Error(
            `Production \`${prod.name}\` references \`${ref}\`, but no such production exists.`
          );
        }
      }
    });
  }

  private getReferences(production: Production): ProductionName[] {
    switch (production.expansion.kind) {
      case ExpansionKind.Epsilon:
      case ExpansionKind.Terminal:
        return [];
      case ExpansionKind.Alt:
        return production.expansion.alts;
      case ExpansionKind.Seq:
        return production.expansion.seq;
      case ExpansionKind.Star:
      case ExpansionKind.Plus:
      case ExpansionKind.Optional:
        return [production.expansion.of];
    }
  }
}
