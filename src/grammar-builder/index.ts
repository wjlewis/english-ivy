import {
  Grammar,
  Production,
  ProductionName,
  Expansion,
  ExpansionKind,
} from '../types/grammar';

export class GrammarBuilder {
  private entry: ProductionName;
  private productions: Production[] = [];

  where(name: string, expansion: Expansion): this {
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
    if (!this.entry) {
      throw new Error(
        'No entry production selected.\n(did you call `.startWith(...)`?).'
      );
    }

    this.check(this.productions, this.entry);

    const productions = this.productions.reduce(
      (acc, prod) => ({
        ...acc,
        [prod.name]: prod,
      }),
      {}
    );

    return {
      entry: this.entry,
      productions,
    };
  }

  static Terminal(pattern?: RegExp): Expansion {
    return {
      kind: ExpansionKind.Terminal,
      pattern,
    };
  }

  static Sum(...variants: ProductionName[]): Expansion {
    return {
      kind: ExpansionKind.Sum,
      variants,
    };
  }

  static Product(...members: ProductionName[]): Expansion {
    return {
      kind: ExpansionKind.Product,
      members,
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

  private check(productions: Production[], entry: ProductionName): void {
    const productionNames = productions.map(prod => prod.name);

    if (!productionNames.includes(entry)) {
      throw new Error(
        `Entry production doesn't exist.\n(have you defined a production named \`${entry}\`?).`
      );
    }

    productions.forEach(prod => {
      const references = this.getReferences(prod);

      for (let ref of references) {
        if (!productionNames.includes(ref)) {
          throw new Error(
            `Production \`${prod.name}\` references \`${ref}\`, but no such production exists.`
          );
        }
      }
    });
  }

  private getReferences(production: Production): ProductionName[] {
    switch (production.expansion.kind) {
      case ExpansionKind.Terminal:
        return [];
      case ExpansionKind.Sum:
        return production.expansion.variants;
      case ExpansionKind.Product:
        return production.expansion.members;
      case ExpansionKind.Star:
      case ExpansionKind.Plus:
        return [production.expansion.of];
    }
  }
}
