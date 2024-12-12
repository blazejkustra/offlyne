declare module 'offlyne' {
  import z from 'zod';
  import { IsEqual } from 'type-fest';

  export interface OfflyneState {}

  type ActionFunction = Function;
  type GetterFunction = Function;

  export type ActionsContext = (ctx: OfflyneState) => Record<string, ActionFunction>;

  class StateBuilder<
    TType = any,
    TActions = unknown,
    TCollectionActions = unknown,
    TId = unknown,
    TNestedState = unknown,
    TCollectionNestedState = unknown,
  > {
    get async(): StateBuilder<TType, TActions, TCollectionActions, TId, TNestedState, TCollectionNestedState>;
    schema<TNewType extends z.ZodType<any, any, any>>(
      type: TNewType,
    ): StateBuilder<z.infer<TNewType>, TActions, TCollectionActions, TId, TNestedState, TCollectionNestedState>;
    getter(getter: GetterFunction): StateBuilder<TType, TActions, TCollectionActions, TId, TNestedState, TCollectionNestedState>;
    collection<TNewId extends string>(
      id: TNewId,
    ): StateBuilder<TType, TActions, TCollectionActions, TNewId, TNestedState, TCollectionNestedState>;

    nest<TNewNestedState extends Record<string, StateBuilder>>(
      nestedState: TNewNestedState,
    ): IsEqual<TId, unknown> extends true
      ? StateBuilder<TType, TActions, TCollectionActions, TId, TNewNestedState, TCollectionNestedState>
      : StateBuilder<TType, TActions, TCollectionActions, TId, TNestedState, TNewNestedState>;
    actions<TNewActions extends ActionsContext>(
      ctx: TNewActions,
    ): IsEqual<TId, unknown> extends true
      ? StateBuilder<TType, ReturnType<TNewActions>, TCollectionActions, TId, TNestedState, TCollectionNestedState>
      : StateBuilder<TType, TActions, ReturnType<TNewActions>, TId, TNestedState, TCollectionNestedState>;
  }

  class SyncState<
    TType = any,
    TActions = unknown,
    TCollectionActions = unknown,
    TId = unknown,
    TNestedState = unknown,
    TCollectionNestedState = unknown,
  > {
    actions: TActions;
    set(value: TType): void;
    get(): TType;
    clear(): void;
    invalidate(): void;
    cancel(): void;

    // hooks
    useState(): [TType, (value: TType) => void];
    useAsyncState(): [TType, unknown];
    useActions(): TActions;
  }

  type CreateState<TType, TActions, TCollectionActions, TId, TNestedState, TCollectionNestedState> = SyncState<
    TType,
    TActions,
    TCollectionActions,
    TId,
    TNestedState,
    TCollectionNestedState
  > &
    TransformToState<TNestedState> &
    CollectionState<TType, TActions, TCollectionActions, TId, TNestedState, TCollectionNestedState>;

  type CollectionState<TType, TActions, TCollectionActions, TId, TNestedState, TCollectionNestedState> = IsEqual<
    TId,
    unknown
  > extends true
    ? unknown
    : {
        (id: string): SyncState<TType, TCollectionActions, never, TId, TNestedState, TCollectionNestedState> &
          TransformToState<TCollectionNestedState>;
      };

  type TransformToState<T> = T extends StateBuilder<
    infer TType,
    infer TActions,
    infer TCollectionActions,
    infer TId,
    infer TNestedState,
    infer TCollectionNestedState
  >
    ? CreateState<TType, TActions, TCollectionActions, TId, TNestedState, TCollectionNestedState>
    : T extends Record<string, any>
    ? { [K in keyof T]: TransformToState<T[K]> }
    : T;

  export function manager<T>(stateBuilder: T): TransformToState<T> & { clear: () => void };

  export const state: StateBuilder;

  export function store<T>(ctx: T): T;
}
