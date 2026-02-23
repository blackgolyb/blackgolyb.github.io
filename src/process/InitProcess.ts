import config from "../core/config";
import { BaseProcess } from "../process/BaseProcess";
import type { ProcessContext } from "../process/IProcess";
import type { Stream } from "../utils/stream";
import { typeText } from "../utils/textAnimations";

export class InitProcess extends BaseProcess {
  static name = "init";

  protected get programNames(): string[] {
    const programs = this.context?.stdlib.getPrograms();
    return Object.values(programs || {}).map((program) => program.getName());
  }

  protected async run(context: ProcessContext): Promise<void> {
    const programs = context.stdlib.getPrograms();
    const mtext = programs.get("mtext")?.();
    const boot = programs.get("boot")?.();
    const shell = programs.get("shell")?.();
    if (!mtext || !shell || !boot) {
      throw new Error(
        "Required programs 'mtext', 'shell', or 'boot' not found.",
      );
    }

    await mtext.start({
      ...context,
      args: ["Hello World", "-d", `${config.introTime}`],
    });
    await boot?.start(context);

    setTimeout(() => {
      typeText(context.io.stdin as Stream, "hello\r", 100);
    }, 1000);
    await shell.start(context);
  }
}
