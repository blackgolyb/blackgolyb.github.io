export interface ITerminalSource {
  getCanvas(): HTMLCanvasElement | null;
  isReady(): boolean;
  scroll(lines: number): void;
  handleInput(event: KeyboardEvent): void;
}
