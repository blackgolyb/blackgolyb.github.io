import { describe, it, expect, beforeEach, vi } from "vitest";
import { createProcessIO, ProcessIO } from "./IProcess";
import { Stream } from "../utils/stream";

describe("ProcessIO", () => {
  let io: ProcessIO;

  beforeEach(() => {
    io = createProcessIO();
  });

  describe("createProcessIO()", () => {
    it("should create ProcessIO with stdin, stdout, and stderr streams", () => {
      expect(io.stdin).toBeDefined();
      expect(io.stdout).toBeDefined();
      expect(io.stderr).toBeDefined();
    });

    it("should create separate stream instances", () => {
      expect(io.stdin).toBeInstanceOf(Stream);
      expect(io.stdout).toBeInstanceOf(Stream);
      expect(io.stderr).toBeInstanceOf(Stream);
      expect(io.stdin).not.toBe(io.stdout);
      expect(io.stdin).not.toBe(io.stderr);
      expect(io.stdout).not.toBe(io.stderr);
    });
  });

  describe("stdin", () => {
    it("should be readable by the process", () => {
      const handler = vi.fn();
      io.stdin.onData(handler);

      (io.stdin as Stream).write("input data");

      expect(handler).toHaveBeenCalledWith("input data");
    });

    it("should support async iteration", async () => {
      const chunks: string[] = [];

      const readPromise = (async () => {
        for await (const chunk of io.stdin) {
          chunks.push(chunk);
          if (chunks.length === 3) break;
        }
      })();

      await new Promise((resolve) => setTimeout(resolve, 10));

      (io.stdin as Stream).write("line1");
      (io.stdin as Stream).write("line2");
      (io.stdin as Stream).write("line3");

      await readPromise;

      expect(chunks).toEqual(["line1", "line2", "line3"]);
    });

    it("should buffer data before listeners are attached", () => {
      (io.stdin as Stream).write("buffered1");
      (io.stdin as Stream).write("buffered2");

      const handler = vi.fn();
      io.stdin.onData(handler);

      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenNthCalledWith(1, "buffered1");
      expect(handler).toHaveBeenNthCalledWith(2, "buffered2");
    });
  });

  describe("stdout", () => {
    it("should be writable by the process", () => {
      const handler = vi.fn();
      (io.stdout as Stream).onData(handler);

      io.stdout.write("output data");

      expect(handler).toHaveBeenCalledWith("output data");
    });

    it("should handle multiple writes", () => {
      const outputs: string[] = [];
      (io.stdout as Stream).onData((chunk) => outputs.push(chunk));

      io.stdout.write("Hello");
      io.stdout.write(" ");
      io.stdout.write("World");

      expect(outputs).toEqual(["Hello", " ", "World"]);
    });

    it("should support async iteration for reading output", async () => {
      const chunks: string[] = [];

      const readPromise = (async () => {
        for await (const chunk of io.stdout as Stream) {
          chunks.push(chunk);
          if (chunks.length === 2) break;
        }
      })();

      await new Promise((resolve) => setTimeout(resolve, 10));

      io.stdout.write("output1");
      io.stdout.write("output2");

      await readPromise;

      expect(chunks).toEqual(["output1", "output2"]);
    });
  });

  describe("stderr", () => {
    it("should be writable by the process for errors", () => {
      const handler = vi.fn();
      (io.stderr as Stream).onData(handler);

      io.stderr.write("Error: Something went wrong");

      expect(handler).toHaveBeenCalledWith("Error: Something went wrong");
    });

    it("should be independent from stdout", () => {
      const stdoutHandler = vi.fn();
      const stderrHandler = vi.fn();

      (io.stdout as Stream).onData(stdoutHandler);
      (io.stderr as Stream).onData(stderrHandler);

      io.stdout.write("normal output");
      io.stderr.write("error output");

      expect(stdoutHandler).toHaveBeenCalledWith("normal output");
      expect(stdoutHandler).not.toHaveBeenCalledWith("error output");
      expect(stderrHandler).toHaveBeenCalledWith("error output");
      expect(stderrHandler).not.toHaveBeenCalledWith("normal output");
    });

    it("should support async iteration for reading errors", async () => {
      const errors: string[] = [];

      const readPromise = (async () => {
        for await (const chunk of io.stderr as Stream) {
          errors.push(chunk);
          if (errors.length === 2) break;
        }
      })();

      await new Promise((resolve) => setTimeout(resolve, 10));

      io.stderr.write("Error 1");
      io.stderr.write("Error 2");

      await readPromise;

      expect(errors).toEqual(["Error 1", "Error 2"]);
    });
  });

  describe("integration scenarios", () => {
    it("should simulate a simple command execution", () => {
      const outputs: string[] = [];
      (io.stdout as Stream).onData((chunk) => outputs.push(chunk));

      // Simulate process receiving input
      (io.stdin as Stream).write("echo hello");

      // Simulate process writing output
      io.stdout.write("hello\n");

      expect(outputs).toEqual(["hello\n"]);
    });

    it("should handle command with errors", () => {
      const stdoutData: string[] = [];
      const stderrData: string[] = [];

      (io.stdout as Stream).onData((chunk) => stdoutData.push(chunk));
      (io.stderr as Stream).onData((chunk) => stderrData.push(chunk));

      io.stdout.write("Processing...\n");
      io.stderr.write("Warning: deprecated feature\n");
      io.stdout.write("Done\n");

      expect(stdoutData).toEqual(["Processing...\n", "Done\n"]);
      expect(stderrData).toEqual(["Warning: deprecated feature\n"]);
    });

    it("should simulate piping between processes", async () => {
      const io1 = createProcessIO();
      const io2 = createProcessIO();

      // Pipe io1.stdout to io2.stdin
      (io1.stdout as Stream).onData((chunk) => {
        (io2.stdin as Stream).write(chunk);
      });

      const outputHandler = vi.fn();
      (io2.stdout as Stream).onData(outputHandler);

      // Process 1 writes to stdout
      io1.stdout.write("piped data");

      // Give time for the pipe to work
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Process 2 should read from stdin and write to stdout
      io2.stdin.onData((data) => {
        io2.stdout.write(data.toUpperCase());
      });

      expect(outputHandler).toHaveBeenCalledWith("PIPED DATA");
    });

    it("should support multiple consumers of stdout", () => {
      const consumer1 = vi.fn();
      const consumer2 = vi.fn();
      const consumer3 = vi.fn();

      (io.stdout as Stream).onData(consumer1);
      (io.stdout as Stream).onData(consumer2);
      (io.stdout as Stream).onData(consumer3);

      io.stdout.write("broadcast");

      expect(consumer1).toHaveBeenCalledWith("broadcast");
      expect(consumer2).toHaveBeenCalledWith("broadcast");
      expect(consumer3).toHaveBeenCalledWith("broadcast");
    });

    it("should handle interactive input/output", async () => {
      const conversation: Array<{ type: string; data: string }> = [];

      (io.stdout as Stream).onData((chunk) => {
        conversation.push({ type: "output", data: chunk });
      });

      // Process prompts for input
      io.stdout.write("Enter your name: ");

      // User provides input
      (io.stdin as Stream).write("Alice");

      io.stdin.onData((input) => {
        conversation.push({ type: "input", data: input });
        io.stdout.write(`Hello, ${input}!\n`);
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(conversation).toEqual([
        { type: "output", data: "Enter your name: " },
        { type: "input", data: "Alice" },
        { type: "output", data: "Hello, Alice!\n" },
      ]);
    });

    it("should handle concurrent read and write operations", async () => {
      const outputs: string[] = [];

      const writeTask = (async () => {
        for (let i = 0; i < 10; i++) {
          io.stdout.write(`message${i}`);
          await new Promise((resolve) => setTimeout(resolve, 1));
        }
      })();

      const readTask = (async () => {
        for await (const chunk of io.stdout as Stream) {
          outputs.push(chunk);
          if (outputs.length === 10) break;
        }
      })();

      await Promise.all([writeTask, readTask]);

      expect(outputs).toHaveLength(10);
      for (let i = 0; i < 10; i++) {
        expect(outputs).toContain(`message${i}`);
      }
    });

    it("should support error redirection", () => {
      const allOutputs: Array<{ stream: string; data: string }> = [];

      (io.stdout as Stream).onData((chunk) => {
        allOutputs.push({ stream: "stdout", data: chunk });
      });

      (io.stderr as Stream).onData((chunk) => {
        allOutputs.push({ stream: "stderr", data: chunk });
      });

      io.stdout.write("Info: Starting process\n");
      io.stderr.write("Error: File not found\n");
      io.stdout.write("Info: Retrying...\n");
      io.stderr.write("Error: Connection refused\n");
      io.stdout.write("Info: Process completed\n");

      expect(allOutputs).toEqual([
        { stream: "stdout", data: "Info: Starting process\n" },
        { stream: "stderr", data: "Error: File not found\n" },
        { stream: "stdout", data: "Info: Retrying...\n" },
        { stream: "stderr", data: "Error: Connection refused\n" },
        { stream: "stdout", data: "Info: Process completed\n" },
      ]);
    });
  });

  describe("edge cases", () => {
    it("should handle empty writes", () => {
      const handler = vi.fn();
      (io.stdout as Stream).onData(handler);

      io.stdout.write("");

      expect(handler).toHaveBeenCalledWith("");
    });

    it("should handle unicode characters", () => {
      const handler = vi.fn();
      (io.stdout as Stream).onData(handler);

      io.stdout.write("Hello 世界 🚀");

      expect(handler).toHaveBeenCalledWith("Hello 世界 🚀");
    });

    it("should handle line breaks and special characters", () => {
      const outputs: string[] = [];
      (io.stdout as Stream).onData((chunk) => outputs.push(chunk));

      io.stdout.write("Line 1\n");
      io.stdout.write("Line 2\r\n");
      io.stdout.write("Tab\there\n");

      expect(outputs).toEqual(["Line 1\n", "Line 2\r\n", "Tab\there\n"]);
    });

    it("should handle very long output", () => {
      const handler = vi.fn();
      (io.stdout as Stream).onData(handler);

      const longString = "a".repeat(100000);
      io.stdout.write(longString);

      expect(handler).toHaveBeenCalledWith(longString);
    });
  });
});
