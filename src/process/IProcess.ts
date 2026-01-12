import type EventEmitter from "../utils/eventEmmiter";
import type { ReadableStream, WritableStream } from "../utils/stream";

export interface ProcessIO {
  stdin: ReadableStream;
  stdout: WritableStream;
  stderr: WritableStream;
}

export type ProgramRegistry = Map<string, () => IProcess>;

export interface ProcessStdLib {
  getPrograms(): ProgramRegistry;
  getWindowSize(): { rows: number; cols: number };
}

export enum Signal {
  SIGWINCH = "SIGWINCH",
}

export interface SignalsEvents extends Record<string, unknown> {
  [Signal.SIGWINCH]: null;
}

export interface ProcessContext {
  io: ProcessIO;
  stdlib: ProcessStdLib;
  signals: EventEmitter<SignalsEvents>;
  args: string[];
  env: Record<string, string>;
}

export enum ProcessState {
  READY = "ready",
  RUNNING = "running",
  SUSPENDED = "suspended",
  TERMINATED = "terminated",
}

export interface IProcess {
  getPid(): number;
  getName(): string;
  getState(): ProcessState;
  start(context: ProcessContext): Promise<void>;
  onInput(data: string): void;
  terminate(): void;
  suspend(): void;
  resume(): void;
  acceptsInput(): boolean;
  isInteractive(): boolean;
}
