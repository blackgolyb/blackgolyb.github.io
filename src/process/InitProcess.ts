import { BaseProcess } from "../process/BaseProcess";
import { ProcessContext } from "../process/IProcess";

export class InitProcess extends BaseProcess {
  static name = "init";

  protected get programNames(): string[] {
    const programs = this.context?.stdlib.getPrograms();
    return Object.values(programs || {}).map((program) => program.getName());
  }

  protected async run(context: ProcessContext): Promise<void> {
    const programs = context.stdlib.getPrograms();
    const mtext = programs.get("mtext")?.();
    const shell = programs.get("shell")?.();
    if (!mtext || !shell) {
      throw new Error("Required programs 'mtext' or 'shell' not found.");
    }
    await mtext.start({
      ...context,
      // args: ["Hello World", "700"],
      args: ["Hello World"],
    });
    await shell.start(context);
  }
}
