import { BaseProcess } from "./BaseProcess";
import { ProcessContext } from "./IProcess";

/**
 * SystemCheck - A boot program that simulates system initialization checks
 * Displays a series of system checks before the shell starts
 */
export class SystemCheck extends BaseProcess {
  constructor() {
    super("systemcheck");
  }

  protected async run(_context: ProcessContext): Promise<void> {
    this.writeLine("");
    this.writeLine("\x1b[36m[BOOT]\x1b[0m Starting system checks...");
    this.writeLine("");

    const checks: Array<{
      name: string;
      duration: number;
      status: "OK" | "FAIL" | "WARN";
    }> = [
      { name: "Loading kernel modules", duration: 100, status: "OK" },
      { name: "Initializing file system", duration: 150, status: "OK" },
      { name: "Starting network services", duration: 120, status: "OK" },
      { name: "Loading terminal drivers", duration: 80, status: "OK" },
      { name: "Initializing user environment", duration: 100, status: "OK" },
      { name: "Starting shell daemon", duration: 90, status: "OK" },
    ];

    for (const check of checks) {
      await this.performCheck(check.name, check.duration, check.status);
    }

    this.writeLine("");
    this.writeLine("\x1b[32m[BOOT]\x1b[0m All systems operational\x1b[0m");
    this.writeLine("");
    await this.delay(300);
  }

  private async performCheck(
    name: string,
    duration: number,
    status: "OK" | "FAIL" | "WARN",
  ): Promise<void> {
    // Show "checking..." message
    this.write(`  [\x1b[33m....\x1b[0m] ${name}`);

    // Simulate check duration
    await this.delay(duration);

    // Color code based on status
    let statusColor = "\x1b[32m"; // Green for OK
    let statusSymbol = "✓";

    if (status === "FAIL") {
      statusColor = "\x1b[31m"; // Red
      statusSymbol = "✗";
    } else if (status === "WARN") {
      statusColor = "\x1b[33m"; // Yellow
      statusSymbol = "!";
    }

    // Update line with result
    this.write(
      `\r  [${statusColor}${statusSymbol} ${status}\x1b[0m] ${name}\r\n`,
    );
  }
}
