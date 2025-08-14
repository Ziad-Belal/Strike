export const currency = (n, c = 'USD') =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: c }).format(n);
