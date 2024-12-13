import offlyne from 'offlyne';
import z from 'zod';

const itemSchema = z.object({
  itemId: z.string(),
  name: z.string(),
});

// key: 'lists/${listId}/items/${itemId}'
const itemState = offlyne.state
  .schema(itemSchema)
  .actions((ctx) => ({
    updateItem: (data: unknown) => data,
    removeItem: () => ({
      offline: () => {},
      optimistic: () => {},
      rollback: () => {},
    }),
  }))
  .getter(() => {});

// key: 'lists/${listId}/items'
const itemsState = offlyne.state
  .schema(z.record(itemSchema))
  .actions((ctx) => ({
    createItem: (data: unknown) => data,
  }))
  .collection({ id: 'itemId', state: itemState });

const listSchema = z.object({
  listId: z.string(),
  name: z.string(),
});

// key: 'lists/${listId}'
const listState = offlyne.state
  .schema(listSchema)
  .getter(() => {})
  .actions((ctx) => ({
    renameList: (name: string) => name,
    removeList: () => {},
    leaveList: () => {},
  }))
  .compose({ items: itemsState });

// key: 'lists'
const listsState = offlyne.state
  .schema(z.record(listSchema))
  .getter(() => {})
  .actions((ctx) => ({
    createList: async (data: any) => {
      const response = await fetch(`/lists/create`, { body: JSON.stringify(data) });
      const list = await response.json();

      return `POST /lists/create`;
    },
  }))
  .collection({ id: 'listId', state: listState });

export default listsState;
