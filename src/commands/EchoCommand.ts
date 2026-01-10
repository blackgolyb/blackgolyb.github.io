import { BaseProcess } from "../process/BaseProcess";
import { ProcessContext } from "../process/IProcess";

export class EchoCommand extends BaseProcess {
  constructor() {
    super("echo");
  }

  protected async run(context: ProcessContext): Promise<void> {
    const text = context.args.join(" ");

    if (text.length === 0) {
      this.writeLine("");
    } else {
      this.writeLine(text);
    }
  }
}
