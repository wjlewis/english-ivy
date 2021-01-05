import { GrammarBuilder as Gb } from './index';
import { ExpansionKind } from '../types/grammar';

describe('GrammarBuilder', () => {
  it('Builds the expected grammar', () => {
    const gram = new Gb()
      .where('Expr', Gb.Sum('Atom', 'Sum', 'Prod'))
      .where('Atom', Gb.Sum('Name', 'Num'))
      .where('Sum', Gb.Product('Expr', 'Expr'))
      .where('Prod', Gb.Product('Expr', 'Expr'))
      .where('Name', Gb.Terminal(/^\w[\w\d]*$/))
      .where('Num', Gb.Terminal(/^\d+$/))
      .startWith('Expr')
      .build();

    expect(gram).toEqual({
      entry: 'Expr',
      productions: {
        Expr: {
          name: 'Expr',
          expansion: {
            kind: ExpansionKind.Sum,
            variants: ['Atom', 'Sum', 'Prod'],
          },
        },
        Atom: {
          name: 'Atom',
          expansion: {
            kind: ExpansionKind.Sum,
            variants: ['Name', 'Num'],
          },
        },
        Sum: {
          name: 'Sum',
          expansion: {
            kind: ExpansionKind.Product,
            members: ['Expr', 'Expr'],
          },
        },
        Prod: {
          name: 'Prod',
          expansion: {
            kind: ExpansionKind.Product,
            members: ['Expr', 'Expr'],
          },
        },
        Name: {
          name: 'Name',
          expansion: {
            kind: ExpansionKind.Terminal,
            pattern: /^\w[\w\d]*$/,
          },
        },
        Num: {
          name: 'Num',
          expansion: {
            kind: ExpansionKind.Terminal,
            pattern: /^\d+$/,
          },
        },
      },
    });
  });
});
