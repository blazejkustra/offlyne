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
    TComposedState = unknown,
    TCollectionComposedState = unknown,
  > {
    schema<TNewType extends z.ZodType<any, any, any>>(
      type: TNewType,
    ): StateBuilder<z.infer<TNewType>, TActions, TCollectionActions, TId, TComposedState, TCollectionComposedState>;
    getter(
      getter: GetterFunction,
    ): StateBuilder<TType, TActions, TCollectionActions, TId, TComposedState, TCollectionComposedState>;
    collection<TNewId extends string>(
      id: TNewId,
    ): StateBuilder<TType, TActions, TCollectionActions, TNewId, TComposedState, TCollectionComposedState>;

    compose<TNewComposedState extends Record<string, StateBuilder>>(
      state: TNewComposedState,
    ): IsEqual<TId, unknown> extends true
      ? StateBuilder<TType, TActions, TCollectionActions, TId, TNewComposedState, TCollectionComposedState>
      : StateBuilder<TType, TActions, TCollectionActions, TId, TComposedState, TNewComposedState>;
    actions<TNewActions extends ActionsContext>(
      ctx: TNewActions,
    ): IsEqual<TId, unknown> extends true
      ? StateBuilder<TType, ReturnType<TNewActions>, TCollectionActions, TId, TComposedState, TCollectionComposedState>
      : StateBuilder<TType, TActions, ReturnType<TNewActions>, TId, TComposedState, TCollectionComposedState>;
  }

  class SyncState<
    TType = any,
    TActions = unknown,
    TCollectionActions = unknown,
    TId = unknown,
    TComposedState = unknown,
    TCollectionComposedState = unknown,
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

  type State<TType, TActions, TCollectionActions, TId, TComposedState, TCollectionComposedState> = SyncState<
    TType,
    TActions,
    TCollectionActions,
    TId,
    TComposedState,
    TCollectionComposedState
  > &
    TransformToState<TComposedState> &
    CollectionState<TType, TActions, TCollectionActions, TId, TComposedState, TCollectionComposedState>;

  type CollectionState<TType, TActions, TCollectionActions, TId, TComposedState, TCollectionComposedState> = IsEqual<
    TId,
    unknown
  > extends true
    ? unknown
    : {
        (id: string): SyncState<TType, TCollectionActions, never, TId, TComposedState, TCollectionComposedState> &
          TransformToState<TCollectionComposedState>;
      };

  type TransformToState<T> = T extends StateBuilder<
    infer TType,
    infer TActions,
    infer TCollectionActions,
    infer TId,
    infer TComposedState,
    infer TCollectionComposedState
  >
    ? State<TType, TActions, TCollectionActions, TId, TComposedState, TCollectionComposedState>
    : T extends Record<string, any>
    ? { [K in keyof T]: TransformToState<T[K]> }
    : T;

  export function createManager<T>(stateBuilder: T): TransformToState<T> & { clear: () => void };

  export const state: StateBuilder;

  export function store<T extends Record<string, StateBuilder>>(ctx: T): T;
}
