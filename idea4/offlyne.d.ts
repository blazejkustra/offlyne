declare module 'offlyne' {
  import z from 'zod';
  import { IsEqual } from 'type-fest';

  export interface OfflyneContext {}

  type ActionFunction = Function;
  type GetterFunction = Function;

  export type ActionsContext = (ctx: OfflyneContext) => Record<string, ActionFunction>;

  /**
   * StateBuilder defines state structure and behavior.
   */
  class StateBuilder<
    TType = any, // The core state type
    TId = unknown, // ID or key type for collections
    TActions = unknown, // Actions for the current state
    TCollectionActions = unknown, // Actions for collections of this state
    TComposedState = unknown, // Nested composed state
    TCollectionComposedState = unknown, // Composed state in collections
    TGetter = unknown, // Getter function
  > {
    /**
     * Adds a schema (validation) to the state using zod.
     */
    schema<TNewType extends z.ZodType<any, any, any>>(
      type: TNewType,
    ): StateBuilder<
      z.infer<TNewType>,
      TId,
      TActions,
      TCollectionActions,
      TComposedState,
      TCollectionComposedState,
      TGetter
    >;

    /**
     * Adds computed or derived state via a getter function.
     */
    getter<TNewGetter extends GetterFunction>(
      getter: TNewGetter,
    ): StateBuilder<TType, TId, TActions, TCollectionActions, TComposedState, TCollectionComposedState, TNewGetter>;

    /**
     * Declares that the state manages a collection of keyed items.
     */
    collection<TNewId extends string>(
      id: TNewId,
    ): StateBuilder<TType, TNewId, TActions, TCollectionActions, TComposedState, TCollectionComposedState, TGetter>;

    /**
     * Adds composed (nested) child states.
     */
    compose<TNewComposedState extends Record<string, StateBuilder>>(
      state: TNewComposedState,
    ): IsEqual<TId, unknown> extends true
      ? StateBuilder<TType, TId, TActions, TCollectionActions, TNewComposedState, TCollectionComposedState, TGetter>
      : StateBuilder<TType, TId, TActions, TCollectionActions, TComposedState, TNewComposedState, TGetter>;

    /**
     * Defines actions or methods associated with this state.
     */
    actions<TNewActions extends ActionsContext>(
      ctx: TNewActions,
    ): IsEqual<TId, unknown> extends true
      ? StateBuilder<
          TType,
          TId,
          ReturnType<TNewActions>,
          TCollectionActions,
          TComposedState,
          TCollectionComposedState,
          TGetter
        >
      : StateBuilder<TType, TId, TActions, ReturnType<TNewActions>, TComposedState, TCollectionComposedState, TGetter>;
  }

  class BaseState<
    TType = any, // The core state type
    TId = unknown, // ID or key type for collections
    TActions = unknown, // Actions for synchronous state
    TCollectionActions = unknown, // Actions for collections of this state
    TComposedState = unknown, // Nested child state
    TCollectionComposedState = unknown, // Composed state in collections
    TGetter = unknown, // Getter function
  > {
    actions: TActions;

    set(value: TType): void;
    get(): TType;
    clear(): void;
    invalidate(): void;
    cancel(): void;

    // React Hooks
    useActions(): TActions;
  }

  /**
   * SyncState provides runtime access to the defined state.
   */
  class SyncState<
    TType = any, // The core state type
    TId = unknown, // ID or key type for collections
    TActions = unknown, // Actions for synchronous state
    TCollectionActions = unknown, // Actions for collections of this state
    TComposedState = unknown, // Nested child state
    TCollectionComposedState = unknown, // Composed state in collections
    TGetter = unknown, // Getter function
  > extends BaseState<TType, TId, TActions, TCollectionActions, TComposedState, TCollectionComposedState, TGetter> {
    useState(): [TType, (value: TType) => void];
  }

  class AsyncState<
    TType = any, // The core state type
    TId = unknown, // ID or key type for collections
    TActions = unknown, // Actions for synchronous state
    TCollectionActions = unknown, // Actions for collections of this state
    TComposedState = unknown, // Nested child state
    TCollectionComposedState = unknown, // Composed state in collections
    TGetter = unknown, // Getter function
  > extends BaseState<TType, TId, TActions, TCollectionActions, TComposedState, TCollectionComposedState, TGetter> {
    useAsyncState(): [TType, unknown];
  }

  /**
   * Transforms a StateBuilder into a usable SyncState.
   */
  type StateComposite<
    TType, // The core state type
    TId, // ID or key type for collections
    TActions, // Actions for synchronous state
    TCollectionActions, // Actions for collections
    TComposedState, // Nested composed state
    TCollectionComposedState, // Composed state for collections
    TGetter, // Getter function
  > = StateCreator<TType, TId, TActions, TCollectionActions, TComposedState, TCollectionComposedState, TGetter> &
    TransformToState<TComposedState> &
    CollectionState<TType, TId, TActions, TCollectionActions, TComposedState, TCollectionComposedState, TGetter>;

  type StateCreator<
    TType, // The core state type
    TId, // ID or key type for collections
    TActions, // Actions for the main state
    TCollectionActions, // Actions for individual items in the collection
    TComposedState, // Nested child state
    TCollectionComposedState, // Composed state for collection items
    TGetter, // Getter function
  > = IsEqual<TGetter, unknown> extends true
    ? SyncState<TType, TId, TActions, TCollectionActions, TComposedState, TCollectionComposedState, TGetter>
    : AsyncState<TType, TId, TActions, TCollectionActions, TComposedState, TCollectionComposedState, TGetter>;

  /**
   * Handles collections of keyed states.
   */
  type CollectionState<
    TType, // The core state type
    TId, // ID or key type for collections
    TActions, // Actions for the main state
    TCollectionActions, // Actions for individual items in the collection
    TComposedState, // Nested child state
    TCollectionComposedState, // Composed state for collection items
    TGetter, // Getter function
  > = IsEqual<TId, unknown> extends true
    ? unknown
    : (
        id: string,
      ) => StateCreator<TType, TId, TCollectionActions, never, TComposedState, TCollectionComposedState, TGetter> &
        TransformToState<TCollectionComposedState>;

  /**
   * Recursively transforms StateBuilder or nested objects into SyncState.
   */
  type TransformToState<T> = T extends StateBuilder<
    infer TType,
    infer TId,
    infer TActions,
    infer TCollectionActions,
    infer TComposedState,
    infer TCollectionComposedState,
    infer TGetter
  >
    ? StateComposite<TType, TId, TActions, TCollectionActions, TComposedState, TCollectionComposedState, TGetter>
    : T extends Record<string, any>
    ? { [K in keyof T]: TransformToState<T[K]> }
    : T;

  /**
   * Creates the offlyne store manager.
   */
  export function createManager<T>(stateBuilder: T): TransformToState<T> & { clear: () => void };

  /**
   * Entry point for creating new states.
   */
  export const state: StateBuilder;

  /**
   * Wraps a set of states into an offlyne store context.
   */
  export function store<T extends Record<string, StateBuilder>>(ctx: T): T;
}
