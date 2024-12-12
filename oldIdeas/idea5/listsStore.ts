// @ts-ignore
import offlyne from 'offlyne';
import z from 'zod';

const listSchema = z.object({
  id: z.string(),
  name: z.string(),
});
const itemSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const itemsActions = offlyne.action((ctx) => ({
  createItem: (data: any) => data,
  updateItem: (data: any) => data,
  removeItem: () => {},
}));

const itemsStore = offlyne.store({
  // key: 'data/lists/${listId}/items/${itemId}'
  items: offlyne.state.async.many.schema(itemSchema).actions(itemsActions),
});

const listsActions = offlyne.action((ctx) => ({
  createList: async (data: any) => {
    const response = await fetch(`/lists/create`, { body: JSON.stringify(data) });
    const list = await response.json();
    ctx.off.lists(ctx.listId).invalidate();

    return `POST /lists/create`;
  },
  renameList: (name: string) => name,
  removeList: () => {},
  leaveList: () => {},
}));

const listsStore = offlyne.store({
  // key: 'data/lists/${listId}'
  lists: (listId: string) => offlyne.state.async.schema(listSchema).actions(listsActions).store(itemsStore),
});

export default listsStore;
