import {
  type IProcess,
  type ProcessContext,
  ProcessState,
  type ProcessIO,
} from "./IProcess";

/**
 * Base process class with common functionality
 * Provides default implementations for process lifecycle
 */
export abstract class BaseProcess implements IProcess {
  static name: string = "base";
  protected pid: number;
  protected state: ProcessState;
  protected context?: ProcessContext;
  protected io?: ProcessIO;

  constructor() {
    this.pid = Math.floor(Math.random() * 100000);
    this.state = ProcessState.READY;
  }

  getPid(): number {
    return this.pid;
  }

  getName(): string {
    return "base";
  }

  getState(): ProcessState {
    return this.state;
  }

  async start(context: ProcessContext): Promise<void> {
    this.context = context;
    this.io = context.io;
    this.state = ProcessState.RUNNING;
    const unsubscribe = this.io.stdin.onData((data) => this.onInput(data));

    try {
      await this.run(context);
      this.state = ProcessState.TERMINATED;
    } catch (error) {
      this.io?.stderr.write(`\x1b[31mError: ${error}\x1b[0m\r\n`);
      this.state = ProcessState.TERMINATED;
      throw error;
    } finally {
      unsubscribe();
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
   * Helper: Write to process output (stdout)
   */
  protected write(data: string): void {
    this.io?.stdout.write(data);
  }

  /**
   * Helper: Write line to process output (convenience wrapper)
   */
  protected writeLine(data: string): void {
    this.io?.stdout.write(`${data}\r\n`);
  }

  /**
   * Helper: Write to process error output (stderr)
   */
  protected writeError(data: string): void {
    this.io?.stderr.write(data);
  }

  /**
   * Helper: Write line to error output (convenience wrapper)
   */
  protected writeErrorLine(data: string): void {
    this.io?.stderr.write(`${data}\r\n`);
  }

  /**
   * Helper: Clear output (convenience wrapper)
   */
  protected clear(): void {
    this.io?.stdout.write("\x1b[2J\x1b[H");
  }

  /**
   * Helper: Delay utility
   */
  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
