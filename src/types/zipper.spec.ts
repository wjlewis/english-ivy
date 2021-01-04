import { ZippedArray } from './zipper';

describe('ZippedArray', () => {
  it('works', () => {
    const zip = ZippedArray.fromArray([1, 2, 3, 4]);

    expect(zip.focus).toBe(1);

    const zip1 = zip.next();
    const zip2 = zip1.next();

    expect(zip2.focus).toBe(3);

    const zip3 = zip2.update(42);
    expect(zip3.focus).toBe(42);

    const zip4 = zip3.prev();
    expect(zip4.focus).toBe(2);
  });
});
