/**
 * Process interface - base abstraction for all runnable programs
 * Inspired by Unix process model
 */

export interface ProcessIO {
  write(data: string): void;
  onInput(callback: (data: string) => void): void;
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
