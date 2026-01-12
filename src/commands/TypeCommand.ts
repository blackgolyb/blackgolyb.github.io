import { BaseProcess } from "../process/BaseProcess";
import type { ProcessContext } from "../process/IProcess";
import { renderTemplate } from "../utils/template";
import { delay } from "../utils/textAnimations";

export class TypeCommand extends BaseProcess {
  static name = "base_type";
  delayMs: number = 15;
  text: string = "";
  isSkipped: boolean = false;

  protected async run(context: ProcessContext): Promise<void> {
    const stdout = context.io.stdout;
    for (const char of await this.renderText()) {
      stdout.write(char);
      if (!this.isSkipped) {
        await delay(this.delayMs);
      }
    }
  }

  protected async getTextContext(): Promise<Record<string, unknown>> {
    return {};
  }

  protected async renderText(): Promise<string> {
    const text = renderTemplate(this.text, await this.getTextContext());
    return text.replace(/\n/g, "\r\n");
  }

  onInput(data: string) {
    console.log("Input received in TypeCommand:", JSON.stringify(data));
    if (data === " " || data === "\r") {
      this.isSkipped = true;
    }
  }
}
