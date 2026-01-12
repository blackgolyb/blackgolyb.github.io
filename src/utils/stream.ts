import { EventEmitter } from "./eventEmmiter";

export interface ReadableStream {
  [Symbol.asyncIterator](): AsyncIterator<string>;
  onData(callback: (chunk: string) => void): () => void;
}

export interface WritableStream {
  write(data: string): void;
}

export interface IStream extends ReadableStream, WritableStream {}

interface StreamEvents extends Record<string, unknown> {
  data: string;
}

export class Stream extends EventEmitter<StreamEvents> implements IStream {
  private buffer: string[] = [];

  write(data: string) {
    if (this.listenerCount("data") > 0) {
      this.emit("data", data);
    } else {
      this.buffer.push(data);
    }
  }

  onData(callback: (chunk: string) => void): () => void {
    const unsubscribe = this.on("data", callback);
    while (this.buffer.length > 0) {
      const chunk = this.buffer.shift();
      if (chunk !== undefined) {
        callback(chunk);
      }
    }
    return unsubscribe;
  }

  [Symbol.asyncIterator]() {
    const queue: string[] = [];
    const callbacks: ((value: IteratorResult<string>) => void)[] = [];

    this.onData((chunk) => {
      if (callbacks.length > 0) {
        const cb = callbacks.shift();
        if (cb) {
          cb({ value: chunk, done: false });
        }
      } else {
        queue.push(chunk);
      }
    });

    return {
      next(): Promise<IteratorResult<string>> {
        return new Promise((resolve) => {
          if (queue.length > 0) {
            const value = queue.shift();
            if (value !== undefined) {
              resolve({ value, done: false });
            }
          } else {
            callbacks.push(resolve);
          }
        });
      },
    };
  }
}
