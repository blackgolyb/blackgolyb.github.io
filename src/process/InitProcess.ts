import config from "../core/config";
import { BaseProcess } from "../process/BaseProcess";
import type {
  IProcess,
  ProcessContext,
  ProcessMouseEvent,
  ProcessMouseResponse,
} from "../process/IProcess";
import type { Stream } from "../utils/stream";
import { typeText } from "../utils/textAnimations";

export class InitProcess extends BaseProcess {
  static name = "init";
  private activeProcess: IProcess | null = null;

  protected get programNames(): string[] {
    const programs = this.context?.stdlib.getPrograms();
    return Object.values(programs || {}).map((program) => program.getName());
  }

  protected async run(context: ProcessContext): Promise<void> {
    const programs = context.stdlib.getPrograms();
    const matrix = programs.get("matrix")?.();
    const boot = programs.get("boot")?.();
    const shell = programs.get("shell")?.();
    if (!matrix || !shell || !boot) {
      throw new Error(
        "Required programs 'matrix', 'shell', or 'boot' not found.",
      );
    }

    this.activeProcess = matrix;
    await matrix.start({
      ...context,
      args: ["-t", "Hello World", "-d", `${config.introTime}`],
    });
    this.activeProcess = boot;
    await boot?.start(context);

    setTimeout(() => {
      typeText(context.io.stdin as Stream, "hello\r", 100);
    }, 1000);
    this.activeProcess = shell;
    await shell.start(context);
  }

  onMouseEvent(event: ProcessMouseEvent): ProcessMouseResponse | void {
    return this.activeProcess?.onMouseEvent?.(event);
  }
}
