// @ts-ignore
import offlyne from 'offlyne';
import z from 'zod';
import preferencesStore from './preferencesStore';
import listsStore from './listsStore';

const off = offlyne.manager.state({
  preferences: preferencesStore,
  data: listsStore,
  user: offlyne.asyncState.schema(z.string()),
});

// <offlyne.Provider manager={off}>
//   <App />
// </offlyne.Provider>

off.preferences.acceptedCookies.set();
off.preferences.acceptedCookies.get();
off.preferences.acceptedCookies.actions.accept();

off.data.lists('123').actions.createList();
off.data.lists('123').invalidate();
off.data.lists('123').cancel();

off.clear();
off.data.clear();

const [acceptedCookies, setAcceptedCookies] = off.preferences.acceptedCookies.useState();
const { accept, decline } = off.preferences.acceptedCookies.useActions();

const [lists, listsOptions] = off.data.lists('123').useAsyncState();
const { createList, renameList } = off.data.lists('123').useActions();

const [items, itemsOptions] = off.data.lists('123').items('789').useAsyncState();
const { createItem, updateItem } = off.data.lists('123').items('789').useActions();

const [user, userOptions] = off.user.useAsyncState();

export default off;
