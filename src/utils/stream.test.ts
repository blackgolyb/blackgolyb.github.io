import { describe, it, expect, beforeEach, vi } from "vitest";
import { Stream } from "./stream";

describe("Stream", () => {
  let stream: Stream;

  beforeEach(() => {
    stream = new Stream();
  });

  describe("write() and onData()", () => {
    it("should buffer data when no listeners", () => {
      stream.write("chunk1");
      stream.write("chunk2");
      stream.write("chunk3");

      const handler = vi.fn();
      stream.onData(handler);

      expect(handler).toHaveBeenCalledTimes(3);
      expect(handler).toHaveBeenNthCalledWith(1, "chunk1");
      expect(handler).toHaveBeenNthCalledWith(2, "chunk2");
      expect(handler).toHaveBeenNthCalledWith(3, "chunk3");
    });

    it("should emit data directly when listeners exist", () => {
      const handler = vi.fn();
      stream.onData(handler);

      stream.write("direct1");
      stream.write("direct2");

      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenNthCalledWith(1, "direct1");
      expect(handler).toHaveBeenNthCalledWith(2, "direct2");
    });

    it("should flush buffer when first listener is added", () => {
      stream.write("buffered1");
      stream.write("buffered2");

      const handler = vi.fn();
      stream.onData(handler);

      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenNthCalledWith(1, "buffered1");
      expect(handler).toHaveBeenNthCalledWith(2, "buffered2");

      // New writes should go directly
      stream.write("direct");
      expect(handler).toHaveBeenCalledTimes(3);
      expect(handler).toHaveBeenNthCalledWith(3, "direct");
    });

    it("should call all registered listeners", () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      stream.onData(handler1);
      stream.onData(handler2);
      stream.onData(handler3);

      stream.write("data");

      expect(handler1).toHaveBeenCalledWith("data");
      expect(handler2).toHaveBeenCalledWith("data");
      expect(handler3).toHaveBeenCalledWith("data");
    });

    it("should handle empty string writes", () => {
      const handler = vi.fn();
      stream.onData(handler);

      stream.write("");

      expect(handler).toHaveBeenCalledWith("");
    });

    it("should preserve order of buffered data", () => {
      const order: string[] = [];

      stream.write("first");
      stream.write("second");
      stream.write("third");

      stream.onData((chunk) => {
        order.push(chunk);
      });

      expect(order).toEqual(["first", "second", "third"]);
    });
  });

  describe("async iterator", () => {
    it("should iterate over written data", async () => {
      const chunks: string[] = [];

      // Start iteration in background
      const iterationPromise = (async () => {
        for await (const chunk of stream) {
          chunks.push(chunk);
          if (chunks.length === 3) break;
        }
      })();

      // Give iterator time to set up
      await new Promise((resolve) => setTimeout(resolve, 10));

      stream.write("async1");
      stream.write("async2");
      stream.write("async3");

      await iterationPromise;

      expect(chunks).toEqual(["async1", "async2", "async3"]);
    });

    it("should handle buffered data in async iteration", async () => {
      stream.write("buffered1");
      stream.write("buffered2");

      const chunks: string[] = [];

      const iterationPromise = (async () => {
        for await (const chunk of stream) {
          chunks.push(chunk);
          if (chunks.length === 4) break;
        }
      })();

      await new Promise((resolve) => setTimeout(resolve, 10));

      stream.write("live1");
      stream.write("live2");

      await iterationPromise;

      expect(chunks).toHaveLength(4);
      expect(chunks).toContain("buffered1");
      expect(chunks).toContain("buffered2");
      expect(chunks).toContain("live1");
      expect(chunks).toContain("live2");
    });

    it("should support multiple concurrent async iterations", async () => {
      const chunks1: string[] = [];
      const chunks2: string[] = [];

      const iteration1 = (async () => {
        for await (const chunk of stream) {
          chunks1.push(chunk);
          if (chunks1.length === 2) break;
        }
      })();

      const iteration2 = (async () => {
        for await (const chunk of stream) {
          chunks2.push(chunk);
          if (chunks2.length === 2) break;
        }
      })();

      await new Promise((resolve) => setTimeout(resolve, 10));

      stream.write("shared1");
      stream.write("shared2");

      await Promise.all([iteration1, iteration2]);

      expect(chunks1).toEqual(["shared1", "shared2"]);
      expect(chunks2).toEqual(["shared1", "shared2"]);
    });

    it("should queue data when iterator is not ready", async () => {
      stream.write("queued1");
      stream.write("queued2");

      const iterator = stream[Symbol.asyncIterator]();

      const result1 = await iterator.next();
      const result2 = await iterator.next();

      expect(result1.value).toBe("queued1");
      expect(result1.done).toBe(false);
      expect(result2.value).toBe("queued2");
      expect(result2.done).toBe(false);
    });

    it("should handle rapid writes during iteration", async () => {
      const chunks: string[] = [];
      const targetCount = 100;

      const iterationPromise = (async () => {
        for await (const chunk of stream) {
          chunks.push(chunk);
          if (chunks.length === targetCount) break;
        }
      })();

      await new Promise((resolve) => setTimeout(resolve, 10));

      for (let i = 0; i < targetCount; i++) {
        stream.write(`chunk${i}`);
      }

      await iterationPromise;

      expect(chunks).toHaveLength(targetCount);
      for (let i = 0; i < targetCount; i++) {
        expect(chunks[i]).toBe(`chunk${i}`);
      }
    });

    it("should allow manual iteration with next()", async () => {
      const iterator = stream[Symbol.asyncIterator]();

      setTimeout(() => stream.write("manual1"), 10);
      setTimeout(() => stream.write("manual2"), 20);
      setTimeout(() => stream.write("manual3"), 30);

      const result1 = await iterator.next();
      const result2 = await iterator.next();
      const result3 = await iterator.next();

      expect(result1.value).toBe("manual1");
      expect(result1.done).toBe(false);
      expect(result2.value).toBe("manual2");
      expect(result2.done).toBe(false);
      expect(result3.value).toBe("manual3");
      expect(result3.done).toBe(false);
    });
  });

  describe("integration scenarios", () => {
    it("should handle mixed usage of onData and async iteration", async () => {
      const onDataChunks: string[] = [];
      const asyncChunks: string[] = [];

      stream.onData((chunk) => {
        onDataChunks.push(chunk);
      });

      const iterationPromise = (async () => {
        for await (const chunk of stream) {
          asyncChunks.push(chunk);
          if (asyncChunks.length === 3) break;
        }
      })();

      await new Promise((resolve) => setTimeout(resolve, 10));

      stream.write("mixed1");
      stream.write("mixed2");
      stream.write("mixed3");

      await iterationPromise;

      expect(onDataChunks).toEqual(["mixed1", "mixed2", "mixed3"]);
      expect(asyncChunks).toEqual(["mixed1", "mixed2", "mixed3"]);
    });

    it("should handle streaming large text data", async () => {
      const largeText = "Lorem ipsum ".repeat(1000);
      const chunks: string[] = [];

      stream.onData((chunk) => {
        chunks.push(chunk);
      });

      for (let i = 0; i < 10; i++) {
        stream.write(largeText);
      }

      expect(chunks).toHaveLength(10);
      expect(chunks.every((chunk) => chunk === largeText)).toBe(true);
    });

    it("should handle write-then-subscribe-then-write pattern", () => {
      const handler = vi.fn();

      stream.write("before");
      stream.onData(handler);
      stream.write("after");

      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenNthCalledWith(1, "before");
      expect(handler).toHaveBeenNthCalledWith(2, "after");
    });

    it("should work as a pipeline component", async () => {
      const source = new Stream();
      const transform = new Stream();
      const sink: string[] = [];

      source.onData((chunk) => {
        transform.write(chunk.toUpperCase());
      });

      transform.onData((chunk) => {
        sink.push(chunk);
      });

      source.write("hello");
      source.write("world");

      expect(sink).toEqual(["HELLO", "WORLD"]);
    });

    it("should support backpressure simulation", async () => {
      const chunks: string[] = [];
      let processing = false;

      stream.onData(async (chunk) => {
        if (!processing) {
          processing = true;
          await new Promise((resolve) => setTimeout(resolve, 10));
          chunks.push(chunk);
          processing = false;
        }
      });

      stream.write("data1");
      stream.write("data2");
      stream.write("data3");

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(chunks.length).toBeGreaterThan(0);
    });
  });

  describe("edge cases", () => {
    it("should handle special characters and unicode", () => {
      const handler = vi.fn();
      stream.onData(handler);

      stream.write("Hello 世界");
      stream.write("🚀 Emoji");
      stream.write("\n\t\r");

      expect(handler).toHaveBeenNthCalledWith(1, "Hello 世界");
      expect(handler).toHaveBeenNthCalledWith(2, "🚀 Emoji");
      expect(handler).toHaveBeenNthCalledWith(3, "\n\t\r");
    });

    it("should handle very long strings", () => {
      const handler = vi.fn();
      stream.onData(handler);

      const longString = "a".repeat(1000000);
      stream.write(longString);

      expect(handler).toHaveBeenCalledWith(longString);
    });

    it("should not lose data when adding multiple listeners sequentially", () => {
      stream.write("initial");

      const handler1 = vi.fn();
      stream.onData(handler1);

      const handler2 = vi.fn();
      stream.onData(handler2);

      expect(handler1).toHaveBeenCalledWith("initial");
      // handler2 is added after buffer is flushed, so it won't get initial
      expect(handler2).not.toHaveBeenCalledWith("initial");

      stream.write("new");
      expect(handler1).toHaveBeenCalledWith("new");
      expect(handler2).toHaveBeenCalledWith("new");
    });

    it("should handle unsubscribing listeners", () => {
      const handler = vi.fn();
      stream.onData(handler);

      stream.write("before");
      expect(handler).toHaveBeenCalledTimes(1);

      // Stream's onData doesn't return unsubscribe, so we use the EventEmitter's off method
      stream.off("data", handler);

      stream.write("after");
      // Since we unsubscribed and there are no listeners, this should be buffered
      expect(handler).toHaveBeenCalledTimes(1);

      // Adding a new listener should get the buffered data
      const handler2 = vi.fn();
      stream.onData(handler2);
      expect(handler2).toHaveBeenCalledWith("after");
    });
  });

  describe("memory and performance", () => {
    it("should not accumulate unbounded buffer", () => {
      // Write a lot of data without listeners
      for (let i = 0; i < 10000; i++) {
        stream.write(`chunk${i}`);
      }

      const handler = vi.fn();
      stream.onData(handler);

      // All buffered data should be flushed
      expect(handler).toHaveBeenCalledTimes(10000);

      // Write more data
      stream.write("new");

      // Should be immediate, not buffered
      expect(handler).toHaveBeenCalledTimes(10001);
    });

    it("should handle rapid subscribe/unsubscribe", () => {
      for (let i = 0; i < 100; i++) {
        const handler = vi.fn();
        stream.onData(handler);
        stream.off("data", handler);
      }

      const handler = vi.fn();
      stream.onData(handler);
      stream.write("test");

      expect(handler).toHaveBeenCalledWith("test");
    });
  });
});
