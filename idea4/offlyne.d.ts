declare module 'offlyne' {
  import z from 'zod';
  import { IsEqual } from 'type-fest';
  export interface OfflyneContext {}

  type ActionFunction = Function;
  type GetterFunction = Function;
  type CollectionDeclaration = { id: string; state: StateBuilder };

  export type ActionsContext = (ctx: OfflyneContext) => Record<string, ActionFunction>;

  class StateBuilder<TType = any, TCollection = unknown, TActions = unknown, TComposed = unknown, TGetter = unknown> {
    schema<TNewType extends z.ZodType<any, any, any>>(
      type: TNewType,
    ): StateBuilder<z.infer<TNewType>, TCollection, TActions, TComposed, TGetter>;
    getter<TNewGetter extends GetterFunction>(
      getter: TNewGetter,
    ): StateBuilder<TType, TCollection, TActions, TComposed, TNewGetter>;

    collection<TNewCollection extends CollectionDeclaration>(
      collection: TNewCollection,
    ): StateBuilder<TType, TNewCollection, TActions, TComposed, TGetter>;

    compose<TNewComposed extends Record<string, StateBuilder>>(
      state: TNewComposed,
    ): StateBuilder<TType, TCollection, TActions, TNewComposed, TGetter>;

    actions<TNewActions extends ActionsContext>(
      ctx: TNewActions,
    ): StateBuilder<TType, TCollection, ReturnType<TNewActions>, TComposed, TGetter>;
  }

  class BaseState<TType = any, TCollection = unknown, TActions = unknown, TComposed = unknown, TGetter = unknown> {
    actions: TActions;
    set(value: TType): void;
    get(): TType;
    clear(): void;
    invalidate(): void;
    cancel(): void;
    useActions(): TActions;
  }

  class SyncState<
    TType = any,
    TCollection = unknown,
    TActions = unknown,
    TComposed = unknown,
    TGetter = unknown,
  > extends BaseState<TType, TCollection, TActions, TComposed, TGetter> {
    useState(): [TType, (value: TType) => void];
  }

  class AsyncState<
    TType = any,
    TCollection = unknown,
    TActions = unknown,
    TComposed = unknown,
    TGetter = unknown,
  > extends BaseState<TType, TCollection, TActions, TComposed, TGetter> {
    useAsyncState(): [TType, unknown];
  }

  type StateComposite<TType, TCollection, TActions, TComposed, TGetter> = StateCreator<
    TType,
    TCollection,
    TActions,
    TComposed,
    TGetter
  > &
    TransformToState<TComposed> &
    CollectionState<TType, TCollection, TActions, TComposed, TGetter>;

  type StateCreator<TType, TCollection, TActions, TComposed, TGetter> = IsEqual<TGetter, unknown> extends true
    ? SyncState<TType, TCollection, TActions, TComposed, TGetter>
    : AsyncState<TType, TCollection, TActions, TComposed, TGetter>;

  type CollectionState<TType, TCollection, TActions, TComposed, TGetter> = TCollection extends CollectionDeclaration
    ? (id: string) => TransformToState<TCollection['state']>
    : unknown;

  type TransformToState<T> = T extends StateBuilder<
    infer TType,
    infer TCollection,
    infer TActions,
    infer TComposed,
    infer TGetter
  >
    ? StateComposite<TType, TCollection, TActions, TComposed, TGetter>
    : T extends Record<string, any>
    ? { [K in keyof T]: TransformToState<T[K]> }
    : T;

  export function createManager<T>(stateBuilder: T): TransformToState<T> & { clear: () => void };
  export const state: StateBuilder;
  export function store<T extends Record<string, StateBuilder>>(ctx: T): T;
}
