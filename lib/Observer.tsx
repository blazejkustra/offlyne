import OfflyneManager from './OfflyneManager';
import Subscribable from './Subscribable';
import { Values } from './types';
import { ReadOptions } from '.';

export class Observer<TKey extends keyof Values> extends Subscribable<() => void> {
  protected manager: OfflyneManager;
  protected options: ReadOptions<TKey>;
  protected currentResult: any = undefined;

  constructor(manager: OfflyneManager, options: ReadOptions<TKey>) {
    super();

    this.manager = manager;
    this.options = options;
  }

  protected onSubscribe(): void {}

  protected onUnsubscribe(): void {
    if (!this.hasListeners()) {
      this.listeners = new Set();
    }
  }

  destroy(): void {
    this.#clearStaleTimeout();
    this.#clearRefetchInterval();
    this.#currentQuery.removeObserver(this);
  }

  setOptions(options: ReadOptions<TKey>): void {
    this.options = options;
  }

  getCurrentResult(): any {
    return this.currentResult;
  }
}
