export default class Subscribable<TListener extends () => void> {
  protected listeners: Set<TListener> = new Set();

  subscribe(listener: TListener): () => void {
    this.listeners.add(listener);
    this.onSubscribe();

    return () => {
      this.listeners.delete(listener);
      this.onUnsubscribe();
    };
  }

  hasListeners(): boolean {
    return this.listeners.size > 0;
  }

  protected onSubscribe(): void {
    // Extend this method
  }

  protected onUnsubscribe(): void {
    // Extend this method
  }
}
