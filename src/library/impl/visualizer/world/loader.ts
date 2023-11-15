export const loaderData = {
  radius: 50,
  speed: 4,
};

export function accelerateInterpolator(x: number): number {
  return x * x;
}

export function decelerateInterpolator(x: number): number {
  return 1 - (1 - x) * (1 - x);
}
