/**
 * Process interface - base abstraction for all runnable programs
 * Inspired by Unix process model
 */

import { Stream, ReadableStream, WritableStream } from "../utils/stream";

export interface ProcessIO {
  /**
   * Standard input stream (readable by the process)
   */
  stdin: ReadableStream;

  /**
   * Standard output stream (writable by the process)
   */
  stdout: WritableStream;

  /**
   * Standard error stream (writable by the process)
   */
  stderr: WritableStream;
}

/**
 * Create a new ProcessIO instance with separate stdin, stdout, and stderr streams
 */
export function createProcessIO(): ProcessIO {
  return {
    stdin: new Stream(),
    stdout: new Stream(),
    stderr: new Stream(),
  };
}

export interface ProcessContext {
  io: ProcessIO;
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
  /**
   * Unique process identifier
   */
  getPid(): number;

  /**
   * Process name/command
   */
  getName(): string;

  /**
   * Current process state
   */
  getState(): ProcessState;

  /**
   * Start the process
   */
  start(context: ProcessContext): Promise<void>;

  /**
   * Handle input data (stdin)
   */
  onInput(data: string): void;

  /**
   * Terminate the process
   */
  terminate(): void;

  /**
   * Suspend the process (Ctrl+Z)
   */
  suspend(): void;

  /**
   * Resume suspended process
   */
  resume(): void;

  /**
   * Check if process accepts input
   */
  acceptsInput(): boolean;

  /**
   * Check if process is interactive (needs input)
   */
  isInteractive(): boolean;
}
