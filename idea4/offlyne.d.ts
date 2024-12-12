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
  > {
    /**
     * Adds a schema (validation) to the state using zod.
     */
    schema<TNewType extends z.ZodType<any, any, any>>(
      type: TNewType,
    ): StateBuilder<z.infer<TNewType>, TId, TActions, TCollectionActions, TComposedState, TCollectionComposedState>;

    /**
     * Adds computed or derived state via a getter function.
     */
    getter(
      getter: GetterFunction,
    ): StateBuilder<TType, TId, TActions, TCollectionActions, TComposedState, TCollectionComposedState>;

    /**
     * Declares that the state manages a collection of keyed items.
     */
    collection<TNewId extends string>(
      id: TNewId,
    ): StateBuilder<TType, TNewId, TActions, TCollectionActions, TComposedState, TCollectionComposedState>;

    /**
     * Adds composed (nested) child states.
     */
    compose<TNewComposedState extends Record<string, StateBuilder>>(
      state: TNewComposedState,
    ): IsEqual<TId, unknown> extends true
      ? StateBuilder<TType, TId, TActions, TCollectionActions, TNewComposedState, TCollectionComposedState>
      : StateBuilder<TType, TId, TActions, TCollectionActions, TComposedState, TNewComposedState>;

    /**
     * Defines actions or methods associated with this state.
     */
    actions<TNewActions extends ActionsContext>(
      ctx: TNewActions,
    ): IsEqual<TId, unknown> extends true
      ? StateBuilder<TType, TId, ReturnType<TNewActions>, TCollectionActions, TComposedState, TCollectionComposedState>
      : StateBuilder<TType, TId, TActions, ReturnType<TNewActions>, TComposedState, TCollectionComposedState>;
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
  > {
    actions: TActions;

    set(value: TType): void;
    get(): TType;
    clear(): void;
    invalidate(): void;
    cancel(): void;

    // React Hooks
    useState(): [TType, (value: TType) => void];
    useAsyncState(): [TType, unknown];
    useActions(): TActions;
  }

  /**
   * Transforms a StateBuilder into a usable SyncState.
   */
  type State<
    TType, // The core state type
    TId, // ID or key type for collections
    TActions, // Actions for synchronous state
    TCollectionActions, // Actions for collections
    TComposedState, // Nested composed state
    TCollectionComposedState, // Composed state for collections
  > = SyncState<TType, TId, TActions, TCollectionActions, TComposedState, TCollectionComposedState> &
    TransformToState<TComposedState> &
    CollectionState<TType, TId, TActions, TCollectionActions, TComposedState, TCollectionComposedState>;

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
  > = TId extends never
    ? never
    : {
        (id: string): SyncState<TType, TId, TCollectionActions, never, TComposedState, TCollectionComposedState> &
          TransformToState<TCollectionComposedState>;
      };

  /**
   * Recursively transforms StateBuilder or nested objects into SyncState.
   */
  type TransformToState<T> = T extends StateBuilder<
    infer TType,
    infer TId,
    infer TActions,
    infer TCollectionActions,
    infer TComposedState,
    infer TCollectionComposedState
  >
    ? State<TType, TId, TActions, TCollectionActions, TComposedState, TCollectionComposedState>
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
