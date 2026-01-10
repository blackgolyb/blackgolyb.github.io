import { IProcess, ProcessContext, ProcessState, ProcessIO } from "./IProcess";

/**
 * Base process class with common functionality
 * Provides default implementations for process lifecycle
 */
export abstract class BaseProcess implements IProcess {
  protected pid: number;
  protected name: string;
  protected state: ProcessState;
  protected context?: ProcessContext;
  protected io?: ProcessIO;

  constructor(name: string) {
    this.name = name;
    this.pid = Math.floor(Math.random() * 100000);
    this.state = ProcessState.READY;
  }

  getPid(): number {
    return this.pid;
  }

  getName(): string {
    return this.name;
  }

  getState(): ProcessState {
    return this.state;
  }

  async start(context: ProcessContext): Promise<void> {
    this.context = context;
    this.io = context.io;
    this.state = ProcessState.RUNNING;

    try {
      await this.run(context);
      this.state = ProcessState.TERMINATED;
    } catch (error) {
      this.io?.writeLine(`\x1b[31mError: ${error}\x1b[0m`);
      this.state = ProcessState.TERMINATED;
      throw error;
    }
  }

  /**
   * Main process execution - must be implemented by subclasses
   */
  protected abstract run(context: ProcessContext): Promise<void>;

  onInput(_data: string): void {
    // Default: do nothing with input
    // Override in subclasses that need input handling
  }

  terminate(): void {
    this.state = ProcessState.TERMINATED;
  }

  suspend(): void {
    if (this.state === ProcessState.RUNNING) {
      this.state = ProcessState.SUSPENDED;
    }
  }

  resume(): void {
    if (this.state === ProcessState.SUSPENDED) {
      this.state = ProcessState.RUNNING;
    }
  }

  acceptsInput(): boolean {
    return this.state === ProcessState.RUNNING && this.isInteractive();
  }

  isInteractive(): boolean {
    // Default: non-interactive
    // Override in subclasses that need input
    return false;
  }

  /**
   * Helper: Write to process output
   */
  protected write(data: string): void {
    this.io?.write(data);
  }

  /**
   * Helper: Write line to process output
   */
  protected writeLine(data: string): void {
    this.io?.writeLine(data);
  }

  /**
   * Helper: Clear output
   */
  protected clear(): void {
    this.io?.clear();
  }

  /**
   * Helper: Delay utility
   */
  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
