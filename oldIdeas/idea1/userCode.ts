import OfflyneManager from './OfflyneManager';
import useData from './useData';

declare function useAsyncData(keys: string | null, options?: any): any;
declare function useActions(keys: string | null): any;
declare function match(...args: any[]): any;

type Data = {
  isOffline: boolean;
  lists: {
    items: string[];
  }[];
};

const Offlyne = new OfflyneManager<Data>({
  isOffline: {
    initialValue: false,
  },
  lists: {
    initialValue: [],
  },
  'lists/:id': ({ id }: { id: string }) => ({
    initialValue: {},
    actions: {
      createList: () => `POST /lists/${id}/create`,
      updateList: () => `POST /lists/${id}/update`,
    },
  }),
  'lists/:id/items': ({ id }: { id: string }) => ({
    actions: {
      initialValue: [],
      actions: {
        createItem: () => `POST /lists/${id}/items/create`,
      },
    },
  }),
});

// useData
const [isOffline, setIsOffline] = useData('isOffline');

// useAsyncData
const [lists, { error, refetch }] = useAsyncData('lists', { enabled: true });
// status === 'done' | 'loading' | 'error'
// networkStatus === 'idle' | 'fetching' | 'paused'
const [list1, list1Options] = useAsyncData('lists/1');
const [items, itemsOptions] = useAsyncData('lists/1/items');

match(lists)
  .with({ status: 'done' }, ({ data }) => `data: ${data}`)
  .with({ status: 'loading' }, () => 'loading')
  .with({ status: 'error' }, ({ error }) => `error: ${error}`);

match([lists, list1])
  .with([{ status: 'done' }, { status: 'done' }], ({ data }) => `data: ${data}`)
  .with({ status: 'loading' }, () => 'loading')
  .with({ status: 'error' }, ({ error }) => `error: ${error}`);

// const [list1, list1Options] = useAsyncData('lists', '1', 'items');
// const [list1, list1Options] = useAsyncData(['lists', '1', 'items']);

// useAction
const { createList, updateList } = useActions('lists/1');
const { createItem } = useActions('lists/1/items');

useActions('lists/1');
useActions('lists/1/items');

