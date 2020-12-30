export function flatten1<A>(xss: A[][]): A[] {
  return xss.reduce((acc, xs) => [...acc, ...xs], []);
}

export function replaceWith<A>(
  xs: A[],
  test: (x: A) => boolean,
  mod: (x: A) => A
): A[] {
  return xs.map(x => (test(x) ? mod(x) : x));
}
