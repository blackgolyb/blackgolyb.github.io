import { BaseProcess } from "../process/BaseProcess";
import type { ProcessContext } from "../process/IProcess";
import dataService from "../services/DataService";
import { waitApprove } from "../utils/cli";
import { printProgressBar } from "../utils/textAnimations";

export class CVCommand extends BaseProcess {
  static name = "cv";

  protected async run(context: ProcessContext): Promise<void> {
    this.writeLine("Fetching CV link");
    const { 0: cvLink } = await Promise.all([
      this.fetchCVLink(),
      printProgressBar(context.io.stdout, 700),
    ]);

    if (!cvLink) {
      this.writeLine("CV link not found.");
      return;
    }
    const shouldOpenCV = await waitApprove(
      "Go to cv page?",
      context.io.stdin,
      context.io.stdout,
    );
    if (!shouldOpenCV) {
      this.writeLine("Operation cancelled.");
      return;
    }
    window.location.href = cvLink;
  }

  protected async fetchCVLink(): Promise<string> {
    return dataService.fetchCVLink();
  }
}
