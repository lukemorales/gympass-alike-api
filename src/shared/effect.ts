import { type Option } from '@effect/data/Option';

export * as E from '@effect/data/Either';
export { flow, pipe } from '@effect/data/Function';
export * as O from '@effect/data/Option';
export * as P from '@effect/data/Predicate';
export * as A from '@effect/data/ReadonlyArray';
export * as S from '@effect/data/String';

/**
 * Wrap all properties in `T` with an `Option`.
 */
export type Optional<T> = {
  [P in keyof T]: Option<T[P]>;
};
