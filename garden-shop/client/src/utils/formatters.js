export function currency(n) {
  return typeof n === 'number' ? `$${n.toFixed(2)}` : n;
}
