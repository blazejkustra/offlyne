import offlyne from 'offlyne';
import z from 'zod';

const itemSchema = z.object({
  itemId: z.string(),
  name: z.string(),
});

// key: 'lists/${listId}/items/${itemId}'
const itemsState = offlyne.state.async
  .schema(itemSchema)
  .actions((ctx) => ({
    createItem: (data: unknown) => data,
  }))
  .many('itemId')
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
const listsState = offlyne.state.async
  .schema(listSchema)
  .getter(() => {})
  .actions((ctx) => ({
    createList: async (data: any) => {
      const response = await fetch(`/lists/create`, { body: JSON.stringify(data) });
      const list = await response.json();

      return `POST /lists/create`;
    },
  }))
  .many('listId')
  .actions((ctx) => ({
    renameList: (name: string) => name,
    removeList: () => {},
    leaveList: () => {},
  }))
  .nest({ items: itemsState });

export default listsState;
