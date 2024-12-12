import { useState, useSyncExternalStore } from 'react';

import Listener from './Listener';
import useOfflyneManager from './useOfflyneManager';

function useData(key: string): [any, (value: any) => void] {
  const manager = useOfflyneManager();
  const [listener] = useState(() => new Listener(manager));

  const snapshot = useSyncExternalStore(listener.subscribe, listener.getCurrentData);

  return [snapshot, manager.set(key)] as const;
}

export default useData;
