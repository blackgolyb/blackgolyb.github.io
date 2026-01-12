import { describe, it, expect, beforeEach, vi } from "vitest";
import { EventEmitter, createEventEmitter } from "./eventEmmiter";

interface TestEvents extends Record<string, unknown> {
  "user:login": { username: string; timestamp: number };
  "user:logout": { username: string };
  "data:update": { id: string; value: unknown };
  test: string;
  number: number;
}

describe("EventEmitter", () => {
  let emitter: EventEmitter<TestEvents>;

  beforeEach(() => {
    emitter = new EventEmitter<TestEvents>();
  });

  describe("on() and emit()", () => {
    it("should register and call event listeners", async () => {
      const handler = vi.fn();
      emitter.on("test", handler);

      await emitter.emit("test", "hello");

      expect(handler).toHaveBeenCalledWith("hello");
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should call multiple listeners for the same event", async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      emitter.on("test", handler1);
      emitter.on("test", handler2);
      emitter.on("test", handler3);

      await emitter.emit("test", "data");

      expect(handler1).toHaveBeenCalledWith("data");
      expect(handler2).toHaveBeenCalledWith("data");
      expect(handler3).toHaveBeenCalledWith("data");
    });

    it("should handle async event handlers", async () => {
      const results: string[] = [];

      const asyncHandler1 = vi.fn(async (data: string) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        results.push(`handler1-${data}`);
      });

      const asyncHandler2 = vi.fn(async (data: string) => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        results.push(`handler2-${data}`);
      });

      emitter.on("test", asyncHandler1);
      emitter.on("test", asyncHandler2);

      await emitter.emit("test", "async");

      expect(asyncHandler1).toHaveBeenCalledWith("async");
      expect(asyncHandler2).toHaveBeenCalledWith("async");
      expect(results).toHaveLength(2);
      expect(results).toContain("handler1-async");
      expect(results).toContain("handler2-async");
    });

    it("should return unsubscribe function", async () => {
      const handler = vi.fn();
      const unsubscribe = emitter.on("test", handler);

      await emitter.emit("test", "first");
      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();

      await emitter.emit("test", "second");
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should handle type-safe events", async () => {
      const handler = vi.fn((data: { username: string; timestamp: number }) => {
        expect(data.username).toBe("alice");
        expect(typeof data.timestamp).toBe("number");
      });

      emitter.on("user:login", handler);

      await emitter.emit("user:login", {
        username: "alice",
        timestamp: Date.now(),
      });

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe("once()", () => {
    it("should call listener only once", async () => {
      const handler = vi.fn();
      emitter.once("test", handler);

      await emitter.emit("test", "first");
      await emitter.emit("test", "second");
      await emitter.emit("test", "third");

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith("first");
    });

    it("should return unsubscribe function that works before first call", async () => {
      const handler = vi.fn();
      const unsubscribe = emitter.once("test", handler);

      unsubscribe();

      await emitter.emit("test", "data");

      expect(handler).not.toHaveBeenCalled();
    });

    it("should work with async handlers", async () => {
      const handler = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      emitter.once("test", handler);

      await emitter.emit("test", "once");
      await emitter.emit("test", "twice");

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe("off()", () => {
    it("should remove specific listener", async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      emitter.on("test", handler1);
      emitter.on("test", handler2);

      emitter.off("test", handler1);

      await emitter.emit("test", "data");

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledWith("data");
    });

    it("should remove all listeners when handler not specified", async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      emitter.on("test", handler1);
      emitter.on("test", handler2);

      emitter.off("test");

      await emitter.emit("test", "data");

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it("should handle removing non-existent listener gracefully", () => {
      const handler = vi.fn();

      expect(() => {
        emitter.off("test", handler);
      }).not.toThrow();
    });

    it("should handle removing from non-existent event gracefully", () => {
      expect(() => {
        emitter.off("nonexistent" as keyof TestEvents);
      }).not.toThrow();
    });
  });

  describe("emitSync()", () => {
    it("should emit events synchronously", () => {
      const handler = vi.fn();
      emitter.on("test", handler);

      emitter.emitSync("test", "sync");

      expect(handler).toHaveBeenCalledWith("sync");
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should not await async handlers", () => {
      const results: string[] = [];

      const asyncHandler = vi.fn(async (data: string) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        results.push(data);
      });

      emitter.on("test", asyncHandler);

      emitter.emitSync("test", "async");

      // Should not wait for async handler
      expect(results).toHaveLength(0);
      expect(asyncHandler).toHaveBeenCalled();
    });
  });

  describe("wildcard patterns", () => {
    it("should match wildcard patterns", async () => {
      const wildcardHandler = vi.fn();
      const specificHandler = vi.fn();

      emitter.on("user:*", wildcardHandler);
      emitter.on("user:login", specificHandler);

      await emitter.emit("user:login", {
        username: "alice",
        timestamp: Date.now(),
      });

      expect(wildcardHandler).toHaveBeenCalledTimes(1);
      expect(specificHandler).toHaveBeenCalledTimes(1);
    });

    it("should match multiple wildcard patterns", async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      emitter.on("user:*", handler1);
      emitter.on("*:login", handler2);

      await emitter.emit("user:login", {
        username: "bob",
        timestamp: Date.now(),
      });

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it("should not double-call exact matches", async () => {
      const handler = vi.fn();

      emitter.on("user:login", handler);

      await emitter.emit("user:login", {
        username: "carol",
        timestamp: Date.now(),
      });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should handle complex wildcard patterns", async () => {
      const handler = vi.fn();

      emitter.on("data:*", handler);

      await emitter.emit("data:update", { id: "123", value: "test" });

      expect(handler).toHaveBeenCalledWith({ id: "123", value: "test" });
    });
  });

  describe("removeAllListeners()", () => {
    it("should remove all listeners for specific event", async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      emitter.on("test", handler1);
      emitter.on("number", handler2);

      emitter.removeAllListeners("test");

      await emitter.emit("test", "data");
      await emitter.emit("number", 42);

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledWith(42);
    });

    it("should remove all listeners for all events", async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      emitter.on("test", handler1);
      emitter.on("number", handler2);

      emitter.removeAllListeners();

      await emitter.emit("test", "data");
      await emitter.emit("number", 42);

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe("listenerCount()", () => {
    it("should return correct listener count", () => {
      expect(emitter.listenerCount("test")).toBe(0);

      emitter.on("test", vi.fn());
      expect(emitter.listenerCount("test")).toBe(1);

      emitter.on("test", vi.fn());
      expect(emitter.listenerCount("test")).toBe(2);

      emitter.on("test", vi.fn());
      expect(emitter.listenerCount("test")).toBe(3);
    });

    it("should update count after removing listeners", () => {
      const handler = vi.fn();
      emitter.on("test", handler);
      emitter.on("test", vi.fn());

      expect(emitter.listenerCount("test")).toBe(2);

      emitter.off("test", handler);

      expect(emitter.listenerCount("test")).toBe(1);
    });
  });

  describe("eventNames()", () => {
    it("should return all event names with listeners", () => {
      emitter.on("test", vi.fn());
      emitter.on("number", vi.fn());
      emitter.on("user:login", vi.fn());

      const names = emitter.eventNames();

      expect(names).toHaveLength(3);
      expect(names).toContain("test");
      expect(names).toContain("number");
      expect(names).toContain("user:login");
    });

    it("should return empty array when no listeners", () => {
      expect(emitter.eventNames()).toEqual([]);
    });
  });

  describe("setMaxListeners() and getMaxListeners()", () => {
    it("should set and get max listeners", () => {
      expect(emitter.getMaxListeners()).toBe(10);

      emitter.setMaxListeners(20);

      expect(emitter.getMaxListeners()).toBe(20);
    });

    it("should warn when exceeding max listeners", () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      emitter.setMaxListeners(2);

      emitter.on("test", vi.fn());
      emitter.on("test", vi.fn());
      emitter.on("test", vi.fn());

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Possible memory leak detected"),
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe("waitFor()", () => {
    it("should resolve when event is emitted", async () => {
      setTimeout(() => {
        emitter.emit("test", "waited");
      }, 10);

      const result = await emitter.waitFor("test");

      expect(result).toBe("waited");
    });

    it("should reject on timeout", async () => {
      await expect(emitter.waitFor("test", 10)).rejects.toThrow(
        'Timeout waiting for event "test"',
      );
    });

    it("should not timeout if event emitted in time", async () => {
      setTimeout(() => {
        emitter.emit("number", 42);
      }, 10);

      const result = await emitter.waitFor("number", 100);

      expect(result).toBe(42);
    });

    it("should work without timeout", async () => {
      setTimeout(() => {
        emitter.emit("test", "no-timeout");
      }, 50);

      const result = await emitter.waitFor("test");

      expect(result).toBe("no-timeout");
    });
  });

  describe("error handling", () => {
    it("should catch and log errors in handlers", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const errorHandler = vi.fn(() => {
        throw new Error("Handler error");
      });
      const normalHandler = vi.fn();

      emitter.on("test", errorHandler);
      emitter.on("test", normalHandler);

      await emitter.emit("test", "data");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error in event handler for "test"'),
        expect.any(Error),
      );
      expect(normalHandler).toHaveBeenCalledWith("data");

      consoleErrorSpy.mockRestore();
    });

    it("should catch errors in async handlers", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const errorHandler = vi.fn(async () => {
        await Promise.resolve();
        throw new Error("Async handler error");
      });

      emitter.on("test", errorHandler);

      // The emit should not throw, errors are caught internally
      await expect(emitter.emit("test", "data")).rejects.toThrow(
        "Async handler error",
      );

      consoleErrorSpy.mockRestore();
    });

    it("should catch errors in wildcard handlers", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const errorHandler = vi.fn(() => {
        throw new Error("Wildcard handler error");
      });

      emitter.on("user:*", errorHandler);

      await emitter.emit("user:login", {
        username: "test",
        timestamp: Date.now(),
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Error in wildcard handler for pattern "user:*"',
        ),
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("createEventEmitter()", () => {
    it("should create a typed event emitter", async () => {
      const typedEmitter = createEventEmitter<TestEvents>();
      const handler = vi.fn();

      typedEmitter.on("test", handler);
      await typedEmitter.emit("test", "created");

      expect(handler).toHaveBeenCalledWith("created");
    });
  });
});
