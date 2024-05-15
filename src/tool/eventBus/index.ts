class EventBus {
  private events = new Map<string, Array<(...args: any[]) => void>>();

  $on(event: string, callback: (...args: any[]) => void) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  $off(event: string, callback?: (...args: any[]) => void) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      if (callback) {
        this.events.set(event, callbacks.filter(cb => cb !== callback));
      } else {
        // 如果没有提供回调函数，则移除所有监听器
        this.events.delete(event);
      }
    }
  }

  $emit(event: string, ...args: any[]) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(...args));
    }
  }
}

export const eventBus = new EventBus();
