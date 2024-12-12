// @ts-ignore
import offlyne from 'offlyne';
import z from 'zod';

const preferencesStore = offlyne.store({
  // key: 'preferences/acceptedCookies'
  acceptedCookies: offlyne.state.schema(z.boolean()),
  // key: 'preferences/languages'
  languages: offlyne.state,
});

const listSchema = z.object({
  id: z.string(),
  name: z.string(),
});
const itemSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const globalStore = offlyne.store({
  // key: 'data/lists/${listId}'
  lists: offlyne.asyncState
    .schema(listSchema)
    .many()
    .nested({
      // key: 'data/lists/${listId}/items/${itemId}'
      items: offlyne.asyncState.schema(itemSchema).many(),
    }),
});

const off = offlyne.manager
  .state({
    preferences: preferencesStore,
    data: globalStore,
    user: offlyne.asyncState.schema(z.string()),
  })
  .actions((ctx) => ({
    preferences: {
      acceptedCookies: {
        accept: offlyne.action(() => true),
        decline: offlyne.action(() => false),
      },
      languages: {
        add: offlyne.action((language: string) => language),
        remove: offlyne.action((language: string) => language),
      },
    },

    data: {
      lists: offlyne
        .many((listId: string) => ({
          createList: offlyne.action(async (data: any) => {
            const response = await fetch(`/lists/create`, { body: JSON.stringify(data) });
            const list = await response.json();
            ctx.off.lists(listId).invalidate();

            return `POST /lists/create`;
          }),
          renameList: offlyne.action((name: string) => name),
          removeList: offlyne.action(() => {}),
          leaveList: offlyne.action(() => {}),
        }))
        .nested({
          items: offlyne.many((itemId: string) => ({
            createItem: offlyne.action((data: any) => data),
            updateItem: offlyne.action((data: any) => data),
            removeItem: offlyne.action(() => {}),
          })),
        }),
    },
  }));

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
