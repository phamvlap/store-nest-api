export type Pagination<T> = {
  previous: number | null;
  next: number | null;
  count: number;
  data: Array<T>;
};
