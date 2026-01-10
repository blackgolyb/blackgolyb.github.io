import { BaseProcess } from "../process/BaseProcess";
import { ProcessContext } from "../process/IProcess";

export class ClearCommand extends BaseProcess {
  constructor() {
    super("clear");
  }

  protected async run(_context: ProcessContext): Promise<void> {
    this.clear();
  }
}
