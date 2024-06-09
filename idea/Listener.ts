declare class Listener {
  constructor(manager: any);

  subscribe: (onStoreChange: () => void) => () => void;
  getCurrentData: () => any;
}

export default Listener;
