/** Small shared helpers for the page generators. */

const numberFormat = new Intl.NumberFormat('en-US');

export function flagOf(code) {
  return String.fromCodePoint(
    ...code.toUpperCase().split('').map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}

export function slugify(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['\u2019.,]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function fmt(n) {
  return numberFormat.format(n);
}

/** 1234567 -> "1.2 million" for prose that should stay readable. */
export function approx(n) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, '')} billion`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')} million`;
  if (n >= 1_000) return `${fmt(Math.round(n / 1000) * 1000)}`;
  return fmt(n);
}

export function ordinal(n) {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

/** Countries decorated with the derived fields the pages need. */
export function decorate(countries) {
  const byPopulation = [...countries].sort((a, b) => b.population - a.population);
  const byArea = [...countries].sort((a, b) => b.area - a.area);

  return countries.map((c) => ({
    ...c,
    flag: flagOf(c.code),
    slug: slugify(c.name),
    populationRank: byPopulation.findIndex((x) => x.code === c.code) + 1,
    areaRank: byArea.findIndex((x) => x.code === c.code) + 1
  }));
}
