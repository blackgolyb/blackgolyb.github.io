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

export interface ProcessMouseEvent {
  type: "move" | "down" | "up" | "leave";
  col: number;
  row: number;
  viewportY: number;
  button: number;
  buttons: number;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  lineText: string;
}

export interface ProcessMouseResponse {
  cursor?: "default" | "pointer";
  hoverRange?: {
    row: number;
    startCol: number;
    endCol: number;
    viewportY: number;
  } | null;
  input?: string;
  openUrl?: string;
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
  onMouseEvent?(event: ProcessMouseEvent): ProcessMouseResponse | void;
  terminate(): void;
  suspend(): void;
  resume(): void;
  acceptsInput(): boolean;
  isInteractive(): boolean;
}
