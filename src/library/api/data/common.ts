export type Nullable<T> = T | null;

export interface Copyable<T> {
  copy(): T;
}
