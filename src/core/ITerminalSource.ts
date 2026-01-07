export interface ITerminalSource {
  getCanvas(): HTMLCanvasElement | null;
  isReady(): boolean;
}
