import type { WindifyEventListener, WindifyEventType, WindifyMapEvent } from '../types';

export class WindifyEventEmitter {
  private listeners: Map<WindifyEventType, Set<WindifyEventListener>> = new Map();

  public on(type: WindifyEventType, listener: WindifyEventListener): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)?.add(listener);
  }

  public off(type: WindifyEventType, listener: WindifyEventListener): void {
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      typeListeners.delete(listener);
      if (typeListeners.size === 0) {
        this.listeners.delete(type);
      }
    }
  }

  public once(type: WindifyEventType, listener: WindifyEventListener): void {
    const onceWrapper: WindifyEventListener = (event: WindifyMapEvent) => {
      this.off(type, onceWrapper);
      listener(event);
    };
    this.on(type, onceWrapper);
  }

  public emit(event: WindifyMapEvent): void {
    const typeListeners = this.listeners.get(event.type);
    if (typeListeners) {
      const currentListeners = Array.from(typeListeners);
      for (const listener of currentListeners) {
        listener(event);
      }
    }
  }

  public removeAllListeners(): void {
    this.listeners.clear();
  }

  public getListenerCount(type?: WindifyEventType): number {
    if (type) {
      return this.listeners.get(type)?.size || 0;
    }
    let count = 0;
    for (const set of this.listeners.values()) {
      count += set.size;
    }
    return count;
  }
}
