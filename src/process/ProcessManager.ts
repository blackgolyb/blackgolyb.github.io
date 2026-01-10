import { IProcess, ProcessState, ProcessIO } from "./IProcess";

/**
 * ProcessManager - manages process lifecycle and I/O routing
 * Routes input to the active foreground process
 */
export class ProcessManager {
  private processes: Map<number, IProcess> = new Map();
  private foregroundProcess: IProcess | null = null;
  private io: ProcessIO;
  private nextPid: number = 1000;

  constructor(io: ProcessIO) {
    this.io = io;
  }

  /**
   * Spawn a new process and run it in foreground
   */
  async spawn(
    process: IProcess,
    args: string[] = [],
    env: Record<string, string> = {},
  ): Promise<void> {
    // Register the process
    this.processes.set(process.getPid(), process);

    // Set as foreground process
    this.foregroundProcess = process;

    try {
      // Start the process
      await process.start({
        io: this.io,
        args,
        env,
      });
    } finally {
      // Process finished, remove from foreground
      if (this.foregroundProcess === process) {
        this.foregroundProcess = null;
      }

      // Clean up terminated process
      if (process.getState() === ProcessState.TERMINATED) {
        this.processes.delete(process.getPid());
      }
    }
  }

  /**
   * Route input to the appropriate process
   */
  handleInput(data: string): void {
    if (this.foregroundProcess && this.foregroundProcess.acceptsInput()) {
      this.foregroundProcess.onInput(data);
    }
  }

  /**
   * Get the current foreground process
   */
  getForegroundProcess(): IProcess | null {
    return this.foregroundProcess;
  }

  /**
   * Kill a process by PID
   */
  kill(pid: number): boolean {
    const process = this.processes.get(pid);
    if (process) {
      process.terminate();
      this.processes.delete(pid);

      if (this.foregroundProcess === process) {
        this.foregroundProcess = null;
      }

      return true;
    }
    return false;
  }

  /**
   * Suspend the foreground process (Ctrl+Z)
   */
  suspendForeground(): void {
    if (this.foregroundProcess) {
      this.foregroundProcess.suspend();
      this.foregroundProcess = null;
    }
  }

  /**
   * List all running processes
   */
  listProcesses(): IProcess[] {
    return Array.from(this.processes.values());
  }

  /**
   * Get process by PID
   */
  getProcess(pid: number): IProcess | undefined {
    return this.processes.get(pid);
  }

  /**
   * Check if any process is running in foreground
   */
  hasForegroundProcess(): boolean {
    return this.foregroundProcess !== null;
  }

  /**
   * Generate next available PID
   */
  getNextPid(): number {
    return this.nextPid++;
  }
}
