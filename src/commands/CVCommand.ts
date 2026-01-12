import config from "../core/config";
import { BaseProcess } from "../process/BaseProcess";
import type { ProcessContext } from "../process/IProcess";
import { waitApprove } from "../utils/cli";
import { delay, printProgressBar } from "../utils/textAnimations";

export class CVCommand extends BaseProcess {
  static name = "cv";

  protected async run(context: ProcessContext): Promise<void> {
    this.writeLine("Fetching CV link");
    printProgressBar(context.io.stdout, 700);

    const { 0: cvLink } = await Promise.all([this.fetchCVLink(), delay(1000)]);

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
    const resp = await fetch(config.dataUrl);
    const data = await resp.json();
    return data.cvLink;
  }
}
