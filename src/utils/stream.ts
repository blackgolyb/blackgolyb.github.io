import { EventEmitter } from "./eventEmmiter";

export interface ReadableStream {
  [Symbol.asyncIterator](): AsyncIterator<string>;
  onData(callback: (chunk: string) => void): () => void;
}

export interface WritableStream {
  write(data: string): void;
}

export interface IStream extends ReadableStream, WritableStream {}

export class Stream extends EventEmitter implements IStream {
  private buffer: string[] = [];

  constructor() {
    super();
  }

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
      callback(this.buffer.shift()!);
    }
    return unsubscribe;
  }

  [Symbol.asyncIterator]() {
    const queue: string[] = [];
    const callbacks: ((value: IteratorResult<string>) => void)[] = [];

    this.onData((chunk) => {
      if (callbacks.length > 0) {
        const cb = callbacks.shift()!;
        cb({ value: chunk, done: false });
      } else {
        queue.push(chunk);
      }
    });

    return {
      next(): Promise<IteratorResult<string>> {
        return new Promise((resolve) => {
          if (queue.length > 0) {
            resolve({ value: queue.shift()!, done: false });
          } else {
            callbacks.push(resolve);
          }
        });
      },
    };
  }
}
