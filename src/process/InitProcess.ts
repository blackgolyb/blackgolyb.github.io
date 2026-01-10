import { IProcess, ProcessContext, ProcessState } from "./IProcess";
import { ShellProcess } from "./ShellProcess";

/**
 * InitProcess - The first process that runs on system startup
 * Similar to Unix init/systemd - it starts other processes in sequence
 * and finally launches the shell. Init runs forever and manages the shell lifecycle.
 */
export class InitProcess implements IProcess {
  private pid: number = 0; // Init always has PID 0
  private state: ProcessState = ProcessState.READY;
  private bootSequence: Array<() => IProcess> = [];
  private shell?: ShellProcess;
  private shellConfigurator?: (shell: ShellProcess) => void;

  constructor(shellConfigurator?: (shell: ShellProcess) => void) {
    this.shellConfigurator = shellConfigurator;
  }

  getPid(): number {
    return this.pid;
  }

  getName(): string {
    return "init";
  }

  getState(): ProcessState {
    return this.state;
  }

  /**
   * Add a program to run before shell
   */
  addBootProgram(factory: () => IProcess): void {
    this.bootSequence.push(factory);
  }

  async start(context: ProcessContext): Promise<void> {
    this.state = ProcessState.RUNNING;

    try {
      // Run boot sequence
      for (const programFactory of this.bootSequence) {
        const program = programFactory();

        // Create isolated ProcessContext for the boot program
        const programContext: ProcessContext = {
          io: context.io,
          args: [],
          env: context.env,
        };

        await program.start(programContext);

        // Wait a bit between programs
        await this.delay(100);
      }

      // All boot programs completed

      // Start shell as a managed child process
      this.shell = new ShellProcess();

      // Configure shell (register commands, etc.)
      if (this.shellConfigurator) {
        this.shellConfigurator(this.shell);
      }

      // Start shell and let it run forever
      // Init never exits - it keeps running as long as shell is running
      await this.shell.start(context);

      // If shell exits (which it shouldn't normally), init stays alive
      this.state = ProcessState.TERMINATED;
    } catch (error) {
      context.io.stderr.write(`\x1b[31mInit error: ${error}\x1b[0m\r\n`);
      this.state = ProcessState.TERMINATED;
      throw error;
    }
  }

  onInput(_data: string): void {
    // Init doesn't handle input directly
  }

  terminate(): void {
    // Terminate shell if running
    if (this.shell) {
      this.shell.terminate();
    }
    this.state = ProcessState.TERMINATED;
  }

  suspend(): void {
    // Init cannot be suspended
  }

  resume(): void {
    // Init cannot be suspended
  }

  acceptsInput(): boolean {
    return false;
  }

  isInteractive(): boolean {
    return false;
  }

  /**
   * Get the managed shell instance
   */
  getShell(): ShellProcess | undefined {
    return this.shell;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
