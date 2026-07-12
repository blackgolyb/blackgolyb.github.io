import { BaseProcess } from "../process/BaseProcess";
import type { ProcessContext } from "../process/IProcess";
import { renderTemplate } from "../utils/template";
import { delay } from "../utils/textAnimations";

export class TypeCommand extends BaseProcess {
  static name = "base_type";
  delayMs: number = 15;
  text: string = "";
  isSkipped: boolean = false;
  private resolveSkip: (() => void) | null = null;

  protected async run(context: ProcessContext): Promise<void> {
    const stdout = context.io.stdout;
    const chars = Array.from(await this.renderText());

    for (let index = 0; index < chars.length; index++) {
      if (this.isSkipped) {
        stdout.write(chars.slice(index).join(""));
        return;
      }

      const char = chars[index];
      stdout.write(char);
      await this.waitForNextChar();
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
    if (data === " " || data === "\r") {
      this.isSkipped = true;
      this.resolveSkip?.();
      this.resolveSkip = null;
    }
  }

  private waitForNextChar(): Promise<void> {
    if (this.isSkipped) return Promise.resolve();

    return Promise.race([
      delay(this.delayMs),
      new Promise<void>((resolve) => {
        this.resolveSkip = resolve;
      }),
    ]).finally(() => {
      this.resolveSkip = null;
    });
  }
}
