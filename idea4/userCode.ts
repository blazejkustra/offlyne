import offlyne from 'offlyne';
import z from 'zod';
import preferences from './preferencesStore';
import listsState from './listsStore';

const off = offlyne.createManager({
  preferences,
  lists: listsState,
  userName: offlyne.state.schema(z.string()),
});

declare module 'offlyne' {
  interface ManagerContext {
    off: typeof off;
  }

  export interface OfflyneContext extends ManagerContext {}
}

// <offlyne.Provider manager={off}>
//   <App />
// </offlyne.Provider>

// 1. Test: Preferences State
off.preferences.acceptedCookies.set(true); // Set cookies to true
off.preferences.acceptedCookies.get(); // Get current cookie state
off.preferences.acceptedCookies.actions.accept(); // Run `accept` action
off.preferences.acceptedCookies.actions.decline(); // Run `decline` action
off.preferences.acceptedCookies.clear(); // Clear cookie state
off.preferences.acceptedCookies.invalidate(); // Invalidate cookie state

const [acceptedCookies, setAcceptedCookies] = off.preferences.acceptedCookies.useState(); // Test hooks
const { accept, decline } = off.preferences.acceptedCookies.useActions(); // Get all actions
// off.preferences.acceptedCookies.

// 2. Test: Lists State
off.lists.actions.createList({ name: 'My List' }); // Create a new list in `lists`
off.lists('123').invalidate(); // Invalidate list with ID '123'
off.lists('123').cancel(); // Cancel updates for list ID '123'
off.lists('123').clear(); // Clear state for list ID '123'

const [lists, listsOptions] = off.lists.useAsyncState(); // Fetch all lists using hook
const { createList } = off.lists.useActions(); // Fetch `createList` action for all lists

const [list, listOptions] = off.lists('123').useAsyncState();
const { renameList, leaveList } = off.lists('123').useActions();

// 3. Test: Nested Collections in Lists
const [items, itemsOptions] = off.lists('123').items('789').useAsyncState();
const { updateItem } = off.lists('123').items('789').useActions(); // Run actions on `items('789')`
const { createItem } = off.lists('123').items.useActions(); // Run collection-level action for `items`

// 4. Test: Global Manager State
off.lists.invalidate(); // Invalidate all lists
off.lists.cancel(); // Cancel all lists' async operations
off.lists.clear(); // Clear all lists' state
off.clear(); // Clear everything globally

// 5. Test: Standalone userName state
off.userName.set('John Doe'); // Set username state
const userName = off.userName.get(); // Get username state
const [user, userAsyncOptions] = off.userName.useState(); // Hook for async state
