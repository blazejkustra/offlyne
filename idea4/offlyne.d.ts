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
    TManyActions = unknown,
    TId = unknown,
    TNestedState = unknown,
    TManyNestedState = unknown,
  > {
    get async(): StateBuilder<TType, TActions, TManyActions, TId, TNestedState, TManyNestedState>;
    schema<TNewType extends z.ZodType<any, any, any>>(
      type: TNewType,
    ): StateBuilder<z.infer<TNewType>, TActions, TManyActions, TId, TNestedState, TManyNestedState>;
    getter(getter: GetterFunction): StateBuilder<TType, TActions, TManyActions, TId, TNestedState, TManyNestedState>;
    many<TNewId extends string>(
      id: TNewId,
    ): StateBuilder<TType, TActions, TManyActions, TNewId, TNestedState, TManyNestedState>;

    nest<TNewNestedState extends Record<string, StateBuilder>>(
      nestedState: TNewNestedState,
    ): IsEqual<TId, unknown> extends true
      ? StateBuilder<TType, TActions, TManyActions, TId, TNewNestedState, TManyNestedState>
      : StateBuilder<TType, TActions, TManyActions, TId, TNestedState, TNewNestedState>;
    actions<TNewActions extends ActionsContext>(
      ctx: TNewActions,
    ): IsEqual<TId, unknown> extends true
      ? StateBuilder<TType, ReturnType<TNewActions>, TManyActions, TId, TNestedState, TManyNestedState>
      : StateBuilder<TType, TActions, ReturnType<TNewActions>, TId, TNestedState, TManyNestedState>;
  }

  class SyncState<
    TType = any,
    TActions = unknown,
    TManyActions = unknown,
    TId = unknown,
    TNestedState = unknown,
    TManyNestedState = unknown,
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

  type CreateState<TType, TActions, TManyActions, TId, TNestedState, TManyNestedState> = SyncState<
    TType,
    TActions,
    TManyActions,
    TId,
    TNestedState,
    TManyNestedState
  > &
    TransformToState<TNestedState> &
    ManyState<TType, TActions, TManyActions, TId, TNestedState, TManyNestedState>;

  type ManyState<TType, TActions, TManyActions, TId, TNestedState, TManyNestedState> = IsEqual<
    TId,
    unknown
  > extends true
    ? unknown
    : {
        (id: string): SyncState<TType, TManyActions, never, TId, TNestedState, TManyNestedState> &
          TransformToState<TManyNestedState>;
      };

  type TransformToState<T> = T extends StateBuilder<
    infer TType,
    infer TActions,
    infer TManyActions,
    infer TId,
    infer TNestedState,
    infer TManyNestedState
  >
    ? CreateState<TType, TActions, TManyActions, TId, TNestedState, TManyNestedState>
    : T extends Record<string, any>
    ? { [K in keyof T]: TransformToState<T[K]> }
    : T;

  export function manager<T>(stateBuilder: T): TransformToState<T> & { clear: () => void };

  export const state: StateBuilder;

  export function store<T>(ctx: T): T;
}
