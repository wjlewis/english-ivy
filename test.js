const Quux = {
  name: 'Quux',
  qu: all => [all.Bar, all.Zaz],
  ux: all => all.Zaz,
};

const Bar = { name: 'Bar', ba: all => all.Quux, r: 72 };

const Zaz = { name: 'Zaz', zaz: 42 };

const all = { Quux, Bar, Zaz };

function build(all) {
  const clone = { ...mapValues(all, value => ({ ...value })) };

  Object.values(clone).forEach(value => {
    Object.keys(value).forEach(key => {
      if (typeof value[key] === 'function') {
        value[key] = value[key](clone);
      }
    });
  });

  return clone;
}

function mapValues(ob, fn) {
  return Object.entries(ob).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: fn(value),
    }),
    {}
  );
}
