import { pipe, A, O } from './effect';

export const MAX_PAGE_SIZE = 20;

export class PaginatedList<T extends { id: string }> {
  readonly metadata: {
    cursor: string | null;
  };

  constructor(readonly items: T[]) {
    this.metadata = {
      cursor: pipe(
        this.items,
        O.liftPredicate((list) => list.length % MAX_PAGE_SIZE === 0),
        O.flatMap(A.last),
        O.map(({ id }) => id),
        O.getOrNull,
      ),
    };
  }
}
