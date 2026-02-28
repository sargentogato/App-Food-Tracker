export interface PaginationResult<T> {
  data: T[];
  meta: {
    total: number;
    offset: number;
    limit: number;
    nextOffset: number | null;
  };
}
