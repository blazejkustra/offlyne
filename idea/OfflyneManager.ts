import OfflyneStorage from './OfflyneStorage';

declare class OfflyneManager<T> {
  storage: OfflyneStorage<T>;

  constructor(config: object);

  set(key: string): (value: any) => void;
}

export default OfflyneManager;
