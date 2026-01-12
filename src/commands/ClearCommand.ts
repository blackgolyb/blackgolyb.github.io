import { BaseProcess } from "../process/BaseProcess";
import type { ProcessContext } from "../process/IProcess";

export class ClearCommand extends BaseProcess {
  static name = "clear";

  protected async run(_context: ProcessContext): Promise<void> {
    this.clear();
  }
}
