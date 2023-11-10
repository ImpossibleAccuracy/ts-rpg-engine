export function roundNumber(number: number, n: number) {
  return Math.round((number + Number.EPSILON) * 10 ** n) / 10 ** n;
}
