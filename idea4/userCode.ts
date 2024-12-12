import offlyne from 'offlyne';
import z from 'zod';
import preferences from './preferencesStore';
import listsState from './listsStore';

const off = offlyne.createManager({
  preferences,
  lists: listsState,
  userName: offlyne.state.schema(z.string()),
});

interface State {
  stores: typeof off;
}

declare module 'offlyne' {
  export interface OfflyneState extends State {}
}

// <offlyne.Provider manager={off}>
//   <App />
// </offlyne.Provider>

off.preferences.acceptedCookies.set(true);
off.preferences.acceptedCookies.get();
off.preferences.acceptedCookies.actions.accept();

off.lists.actions.createList({ name: 'My List' });
off.lists('123').invalidate();
off.lists.cancel();
off.lists('123').cancel();

off.clear();
off.lists.clear();

const [acceptedCookies, setAcceptedCookies] = off.preferences.acceptedCookies.useState();
const { accept, decline } = off.preferences.acceptedCookies.useActions();

// all lists
const [lists, listsOptions] = off.lists.useAsyncState();
const { createList } = off.lists.useActions();

const [list, listsOption] = off.lists('123').useAsyncState();
const { renameList, leaveList } = off.lists('123').useActions();

const [items, itemsOptions] = off.lists('123').items('789').useAsyncState();
const { createItem } = off.lists('123').items.useActions();
const { updateItem } = off.lists('123').items('789').useActions();

const [user, userOptions] = off.userName.useAsyncState();
