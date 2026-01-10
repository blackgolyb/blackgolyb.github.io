/**
 * Type-safe Event Emitter
 *
 * A flexible event emitter with full TypeScript support for type-safe event handling.
 * Supports wildcards, one-time listeners, and proper cleanup.
 */

type EventHandler<T = any> = (data: T) => void | Promise<void>;

interface ListenerOptions {
  once?: boolean;
}

interface Listener<T = any> {
  handler: EventHandler<T>;
  once: boolean;
}

/**
 * EventEmitter class for managing pub-sub patterns with type safety
 *
 * @example
 * ```ts
 * interface MyEvents {
 *   'user:login': { username: string; timestamp: number };
 *   'user:logout': { username: string };
 *   'data:update': { id: string; value: any };
 * }
 *
 * const emitter = new EventEmitter<MyEvents>();
 *
 * // Type-safe listener
 * emitter.on('user:login', (data) => {
 *   console.log(data.username, data.timestamp); // fully typed!
 * });
 *
 * // Emit with type checking
 * emitter.emit('user:login', { username: 'alice', timestamp: Date.now() });
 *
 * // Wildcard support
 * emitter.on('user:*', (data) => {
 *   console.log('User event:', data);
 * });
 * ```
 */
export class EventEmitter<
  EventMap extends Record<string, any> = Record<string, any>,
> {
  private listeners: Map<keyof EventMap | string, Listener[]> = new Map();
  private maxListeners: number = 10;

  /**
   * Register an event listener
   * @param event - Event name or wildcard pattern (e.g., 'user:*')
   * @param handler - Callback function to handle the event
   * @param options - Listener options (once, etc.)
   */
  on<K extends keyof EventMap>(
    event: K | string,
    handler: EventHandler<EventMap[K]>,
    options?: ListenerOptions,
  ): () => void {
    const listener: Listener<EventMap[K]> = {
      handler,
      once: options?.once ?? false,
    };

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    const listeners = this.listeners.get(event)!;
    listeners.push(listener);

    // Warn if too many listeners (potential memory leak)
    if (listeners.length > this.maxListeners) {
      console.warn(
        `Warning: Possible memory leak detected. ${listeners.length} listeners added for event "${String(event)}". ` +
          `Use setMaxListeners() to increase limit.`,
      );
    }

    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  /**
   * Register a one-time event listener that will be removed after first invocation
   * @param event - Event name
   * @param handler - Callback function
   */
  once<K extends keyof EventMap>(
    event: K | string,
    handler: EventHandler<EventMap[K]>,
  ): () => void {
    return this.on(event, handler, { once: true });
  }

  /**
   * Remove an event listener
   * @param event - Event name
   * @param handler - The handler to remove (if not provided, removes all handlers for the event)
   */
  off<K extends keyof EventMap>(
    event: K | string,
    handler?: EventHandler<EventMap[K]>,
  ): void {
    if (!this.listeners.has(event)) {
      return;
    }

    if (!handler) {
      // Remove all listeners for this event
      this.listeners.delete(event);
      return;
    }

    const listeners = this.listeners.get(event)!;
    const index = listeners.findIndex((l) => l.handler === handler);

    if (index !== -1) {
      listeners.splice(index, 1);
    }

    // Clean up empty listener arrays
    if (listeners.length === 0) {
      this.listeners.delete(event);
    }
  }

  /**
   * Emit an event with data
   * @param event - Event name
   * @param data - Event data
   */
  async emit<K extends keyof EventMap>(
    event: K,
    data: EventMap[K],
  ): Promise<void> {
    const eventStr = String(event);
    const promises: Promise<void>[] = [];

    // Call exact match listeners
    if (this.listeners.has(event)) {
      const listeners = this.listeners.get(event)!.slice(); // Clone to avoid issues with once() removing during iteration

      for (const listener of listeners) {
        try {
          const result = listener.handler(data);
          if (result instanceof Promise) {
            promises.push(result);
          }
        } catch (error) {
          console.error(`Error in event handler for "${eventStr}":`, error);
        }

        if (listener.once) {
          this.off(event, listener.handler);
        }
      }
    }

    // Call wildcard listeners
    for (const [pattern, listeners] of this.listeners.entries()) {
      if (this.matchesPattern(eventStr, String(pattern))) {
        const listenersCopy = listeners.slice();

        for (const listener of listenersCopy) {
          try {
            const result = listener.handler(data);
            if (result instanceof Promise) {
              promises.push(result);
            }
          } catch (error) {
            console.error(
              `Error in wildcard handler for pattern "${String(pattern)}":`,
              error,
            );
          }

          if (listener.once) {
            this.off(pattern as K, listener.handler);
          }
        }
      }
    }

    // Wait for all async handlers
    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  /**
   * Emit an event synchronously (does not await async handlers)
   * @param event - Event name
   * @param data - Event data
   */
  emitSync<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    const eventStr = String(event);

    // Call exact match listeners
    if (this.listeners.has(event)) {
      const listeners = this.listeners.get(event)!.slice();

      for (const listener of listeners) {
        try {
          listener.handler(data);
        } catch (error) {
          console.error(`Error in event handler for "${eventStr}":`, error);
        }

        if (listener.once) {
          this.off(event, listener.handler);
        }
      }
    }

    // Call wildcard listeners
    for (const [pattern, listeners] of this.listeners.entries()) {
      if (this.matchesPattern(eventStr, String(pattern))) {
        const listenersCopy = listeners.slice();

        for (const listener of listenersCopy) {
          try {
            listener.handler(data);
          } catch (error) {
            console.error(
              `Error in wildcard handler for pattern "${String(pattern)}":`,
              error,
            );
          }

          if (listener.once) {
            this.off(pattern as K, listener.handler);
          }
        }
      }
    }
  }

  /**
   * Remove all listeners for a specific event or all events
   * @param event - Event name (optional, if not provided removes all listeners)
   */
  removeAllListeners<K extends keyof EventMap>(event?: K | string): void {
    if (event !== undefined) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get the count of listeners for a specific event
   * @param event - Event name
   */
  listenerCount<K extends keyof EventMap>(event: K | string): number {
    return this.listeners.get(event)?.length ?? 0;
  }

  /**
   * Get all event names that have listeners
   */
  eventNames(): (keyof EventMap | string)[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Set the maximum number of listeners before warning
   * @param n - Maximum number of listeners
   */
  setMaxListeners(n: number): void {
    this.maxListeners = n;
  }

  /**
   * Get the maximum number of listeners
   */
  getMaxListeners(): number {
    return this.maxListeners;
  }

  /**
   * Wait for a specific event to be emitted
   * @param event - Event name
   * @param timeout - Optional timeout in milliseconds
   * @returns Promise that resolves with the event data
   */
  waitFor<K extends keyof EventMap>(
    event: K,
    timeout?: number,
  ): Promise<EventMap[K]> {
    return new Promise((resolve, reject) => {
      let timeoutId: number | undefined;

      const cleanup = this.once(event, (data) => {
        if (timeoutId !== undefined) {
          clearTimeout(timeoutId as number);
        }
        resolve(data);
      });

      if (timeout !== undefined) {
        timeoutId = setTimeout(() => {
          cleanup();
          reject(new Error(`Timeout waiting for event "${String(event)}"`));
        }, timeout);
      }
    });
  }

  /**
   * Check if a pattern matches an event name
   * Supports wildcards: 'user:*' matches 'user:login', 'user:logout', etc.
   * @param event - Event name
   * @param pattern - Pattern with optional wildcards
   */
  private matchesPattern(event: string, pattern: string): boolean {
    if (event === pattern) {
      return false; // Exact matches are handled separately
    }

    if (!pattern.includes("*")) {
      return false;
    }

    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, "\\$&") // Escape special chars
      .replace(/\*/g, ".*"); // Replace * with .*

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(event);
  }
}

/**
 * Create a typed event emitter for a specific event map
 *
 * @example
 * ```ts
 * const emitter = createEventEmitter<{
 *   'data': { value: string };
 *   'error': { message: string };
 * }>();
 * ```
 */
export function createEventEmitter<
  EventMap extends Record<string, any>,
>(): EventEmitter<EventMap> {
  return new EventEmitter<EventMap>();
}

export default EventEmitter;
