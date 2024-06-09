import { useEffect, useState, useSyncExternalStore } from 'react';

import { Observer } from './Observer';
import { useOfflyneManager } from './OfflyneContext';
import OfflyneCache from './OfflyneManager';
import { KEYS, Values } from './types';

type LoadingState = {
  data: undefined;
  error: undefined;
  isLoading: true;
};

type ErrorState = {
  data: undefined;
  error: unknown;
  isLoading: false;
};

type DataState<TKey extends keyof Values> = {
  data: Values[TKey];
  error: undefined;
  isLoading: false;
};

type UseReadReturn<TKey extends keyof Values> = LoadingState | ErrorState | DataState<TKey>;

export type ReadOptions<TKey extends keyof Values> = {
  key: TKey;
  fetcher: () => Values[TKey] | Promise<Values[TKey]>;
};

function useRead<TKey extends keyof Values>(options: ReadOptions<TKey>): UseReadReturn<TKey> {
  const manager = useOfflyneManager();
  const [observer] = useState(() => new Observer(manager, options));

  useSyncExternalStore(observer.subscribe, observer.getCurrentResult);

  useEffect(() => {
    observer.setOptions(options);
  }, [observer, options]);

  return observer.getCurrentResult();
}

const offlyne = new OfflyneCache({
  store: {},
  initialValues: {
    [KEYS.IS_OFFLINE]: false,
  },
});

export { useRead };
