import React, { ReactNode } from 'react';

import OfflyneManager from './OfflyneManager';

export const OfflyneManagerContext = React.createContext<OfflyneManager | undefined>(undefined);

export const useOfflyneManager = () => {
  const manager = React.useContext(OfflyneManagerContext);

  if (!manager) {
    throw new Error('No OfflyneManager set, use OfflyneManagerProvider to set one');
  }

  return manager;
};

export type OfflyneManagerProviderProps = {
  client: OfflyneManager;
  children: ReactNode;
};

export const OfflyneManagerProvider = ({ client, children }: OfflyneManagerProviderProps): JSX.Element => {
  return <OfflyneManagerContext.Provider value={client}>{children}</OfflyneManagerContext.Provider>;
};
