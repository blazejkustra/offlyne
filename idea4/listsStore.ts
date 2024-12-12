import offlyne from 'offlyne';
import z from 'zod';

const itemSchema = z.object({
  itemId: z.string(),
  name: z.string(),
});

// key: 'lists/${listId}/items/${itemId}'
const itemsState = offlyne.state
  .schema(itemSchema)
  .actions((ctx) => ({
    createItem: (data: unknown) => data,
  }))
  .collection('itemId')
  .actions((ctx) => ({
    updateItem: (data: unknown) => data,
    removeItem: () => {
      const test = ctx.stores.lists;
    },
  }));

const listSchema = z.object({
  listId: z.string(),
  name: z.string(),
});

// key: 'lists/${listId}'
const listsState = offlyne.state
  .schema(listSchema)
  .getter(() => {})
  .actions((ctx) => ({
    createList: async (data: any) => {
      const response = await fetch(`/lists/create`, { body: JSON.stringify(data) });
      const list = await response.json();

      return `POST /lists/create`;
    },
  }))
  .collection('listId')
  .actions((ctx) => ({
    renameList: (name: string) => name,
    removeList: () => {},
    leaveList: () => {},
  }))
  .compose({ items: itemsState });

export default listsState;
