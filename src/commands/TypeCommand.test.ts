import { describe, expect, it } from "vitest";
import EventEmitter from "../utils/eventEmmiter";
import { Stream } from "../utils/stream";
import type { SignalsEvents } from "../process/IProcess";
import { TypeCommand } from "./TypeCommand";

class TestTypeCommand extends TypeCommand {
  text = "abcd";
  delayMs = 1000;
}

describe("TypeCommand", () => {
  it("flushes remaining text in one write when skipped", async () => {
    const stdin = new Stream();
    const stdout = new Stream();
    const stderr = new Stream();
    const writes: string[] = [];
    const command = new TestTypeCommand();

    stdout.onData((chunk) => {
      writes.push(chunk);
      if (chunk === "a") stdin.write(" ");
    });

    await command.start({
      io: { stdin, stdout, stderr },
      stdlib: {
        getPrograms: () => new Map(),
        getWindowSize: () => ({ cols: 80, rows: 24 }),
      },
      signals: new EventEmitter<SignalsEvents>(),
      args: [],
      env: {},
    });

    expect(writes).toEqual(["a", "bcd"]);
  });
});
