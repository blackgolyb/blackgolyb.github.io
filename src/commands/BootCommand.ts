import { BaseProcess } from "../process/BaseProcess";
import type { ProcessContext } from "../process/IProcess";
import { delay } from "../utils/textAnimations";

export class BootCommand extends BaseProcess {
  static name = "boot";

  protected async run(context: ProcessContext): Promise<void> {
    const out = context.io.stdout;

    // Hide cursor during boot
    out.write("\x1b[?25l");

    // ── BIOS header ──
    out.write("\x1b[33mIBN 5100\x1b[0m");
    await delay(200);

    // ── Memory check ──
    out.write("\r\nMemory check... ");
    await delay(150);
    const memSteps = [64, 128, 256, 384, 512, 640];
    for (const k of memSteps) {
      out.write(`\r\x1b[KMemory check... \x1b[32m${k}K\x1b[0m`);
      await delay(80);
    }
    out.write(" OK\r\n");
    await delay(250);

    // ── Services ──
    const services = [
      ["Starting kernel", 200],
      ["Mounting filesystem", 150],
      ["Loading modules", 180],
      ["Initializing network", 220],
    ] as const;

    out.write("\r\n");

    for (const [name, ms] of services) {
      out.write(`\x1b[2m[    ]\x1b[0m ${name}...`);
      await delay(ms);
      out.write(`\r\x1b[32m[ OK ]\x1b[0m ${name}\r\n`);
      await delay(60);
    }

    await delay(300);
    out.write("\r\n\x1b[32mSystem ready.\x1b[0m\r\n\r\n");
    await delay(400);

    // Restore cursor
    out.write("\x1b[?25h");
  }
}
