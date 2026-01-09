export interface ShellOutput {
  write(data: string): void;
  writeLine(data: string): void;
  clear(): void;
}

export interface ShellContext {
  output: ShellOutput;
}

export interface IShell {
  /**
   * Process input data from the terminal
   */
  handleData(data: string): void;

  /**
   * Execute a command line
   */
  executeCommand(line: string): Promise<void>;

  /**
   * Display the shell prompt
   */
  showPrompt(): void;

  /**
   * Set the prompt string
   */
  setPrompt(prompt: string): void;

  /**
   * Get the current input line
   */
  getCurrentLine(): string;

  /**
   * Get command history
   */
  getHistory(): string[];

  /**
   * Check if shell is currently executing a command
   */
  isExecuting(): boolean;

  /**
   * Set command executor function
   */
  setCommandExecutor(
    executor: (
      command: string,
      args: string[],
      context: ShellContext,
    ) => Promise<void>,
  ): void;
}
