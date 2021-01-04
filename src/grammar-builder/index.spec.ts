import { GrammarBuilder as Gb } from './index';
import { ExpansionKind } from '../types/grammar';

describe('GrammarBuilder', () => {
  it('Builds the expected grammar', () => {
    const gram = new Gb()
      .addProduction('Expr', Gb.Alt('Atom', 'Sum', 'Prod'))
      .addProduction('Atom', Gb.Alt('Name', 'Num'))
      .addProduction('Sum', Gb.Seq('Expr', 'Expr'))
      .addProduction('Prod', Gb.Seq('Expr', 'Expr'))
      .addProduction('Name', Gb.Terminal(/^\w[\w\d]*$/))
      .addProduction('Num', Gb.Terminal(/^\d+$/))
      .startWith('Expr')
      .build();

    expect(gram).toEqual({
      entry: 'Expr',
      productions: {
        Expr: {
          name: 'Expr',
          expansion: {
            kind: ExpansionKind.Alt,
            alts: ['Atom', 'Sum', 'Prod'],
          },
        },
        Atom: {
          name: 'Atom',
          expansion: {
            kind: ExpansionKind.Alt,
            alts: ['Name', 'Num'],
          },
        },
        Sum: {
          name: 'Sum',
          expansion: {
            kind: ExpansionKind.Seq,
            seq: ['Expr', 'Expr'],
          },
        },
        Prod: {
          name: 'Prod',
          expansion: {
            kind: ExpansionKind.Seq,
            seq: ['Expr', 'Expr'],
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
