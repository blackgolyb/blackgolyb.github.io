import { Terminal } from "@xterm/xterm";

/**
 * Text animation helper functions for terminal commands
 */

/**
 * Print text character by character with delay
 */
export async function printText(
  terminal: Terminal,
  text: string,
  delayMs: number = 30,
): Promise<void> {
  for (const char of text) {
    terminal.write(char);
    await delay(delayMs);
  }
}

/**
 * Print text line by line with delay
 */
export async function printLine(
  terminal: Terminal,
  text: string,
  delayMs: number = 30,
): Promise<void> {
  await printText(terminal, text, delayMs);
  terminal.write("\r\n");
}

/**
 * Print multiple lines with delay between each line
 */
export async function printLines(
  terminal: Terminal,
  lines: string[],
  charDelayMs: number = 30,
  lineDelayMs: number = 100,
): Promise<void> {
  for (let i = 0; i < lines.length; i++) {
    await printText(terminal, lines[i], charDelayMs);
    terminal.write("\r\n");
    if (i < lines.length - 1) {
      await delay(lineDelayMs);
    }
  }
}

/**
 * Print text with typing effect and optional blinking cursor
 */
export async function typeText(
  terminal: Terminal,
  text: string,
  delayMs: number = 50,
  showCursor: boolean = false,
): Promise<void> {
  if (showCursor) {
    terminal.write("\x1b[?25h"); // Show cursor
  }

  for (const char of text) {
    terminal.write(char);
    await delay(delayMs);
  }

  if (showCursor) {
    terminal.write("\x1b[?25l"); // Hide cursor
  }
}

/**
 * Print colored text character by character
 */
export async function printColoredText(
  terminal: Terminal,
  text: string,
  color: string,
  delayMs: number = 30,
): Promise<void> {
  terminal.write(color);
  await printText(terminal, text, delayMs);
  terminal.write("\x1b[0m");
}

/**
 * Print text with rainbow color effect
 */
export async function printRainbowText(
  terminal: Terminal,
  text: string,
  delayMs: number = 30,
): Promise<void> {
  const colors = [
    "\x1b[91m", // Red
    "\x1b[93m", // Yellow
    "\x1b[92m", // Green
    "\x1b[96m", // Cyan
    "\x1b[94m", // Blue
    "\x1b[95m", // Magenta
  ];

  for (let i = 0; i < text.length; i++) {
    const color = colors[i % colors.length];
    terminal.write(color + text[i] + "\x1b[0m");
    await delay(delayMs);
  }
}

/**
 * Print text with glitch effect
 */
export async function printGlitchText(
  terminal: Terminal,
  text: string,
  iterations: number = 3,
): Promise<void> {
  const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`";

  for (let iter = 0; iter < iterations; iter++) {
    // Show glitched version
    terminal.write("\r");
    for (const char of text) {
      if (Math.random() < 0.3) {
        const glitch =
          glitchChars[Math.floor(Math.random() * glitchChars.length)];
        terminal.write("\x1b[91m" + glitch + "\x1b[0m");
      } else {
        terminal.write(char);
      }
    }
    await delay(50);
  }

  // Show final correct text
  terminal.write("\r" + text);
}

/**
 * Clear the current line
 */
export function clearLine(terminal: Terminal): void {
  terminal.write("\r\x1b[K");
}

/**
 * Move cursor up n lines
 */
export function moveCursorUp(terminal: Terminal, lines: number): void {
  terminal.write(`\x1b[${lines}A`);
}

/**
 * Move cursor down n lines
 */
export function moveCursorDown(terminal: Terminal, lines: number): void {
  terminal.write(`\x1b[${lines}B`);
}

/**
 * Print a progress bar
 */
export async function printProgressBar(
  terminal: Terminal,
  duration: number = 2000,
  width: number = 30,
  label: string = "Loading",
): Promise<void> {
  const steps = 50;
  const stepDelay = duration / steps;

  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    const filled = Math.floor(progress * width);
    const empty = width - filled;
    const bar = "█".repeat(filled) + "░".repeat(empty);
    const percent = Math.floor(progress * 100);

    clearLine(terminal);
    terminal.write(`\x1b[36m${label}:\x1b[0m [${bar}] ${percent}%`);

    await delay(stepDelay);
  }

  terminal.write("\r\n");
}

/**
 * Print a spinner animation
 */
export async function printSpinner(
  terminal: Terminal,
  duration: number = 2000,
  message: string = "Processing",
): Promise<void> {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  const frameDelay = 80;
  const iterations = Math.floor(duration / frameDelay);

  for (let i = 0; i < iterations; i++) {
    const frame = frames[i % frames.length];
    clearLine(terminal);
    terminal.write(`\x1b[36m${frame}\x1b[0m ${message}...`);
    await delay(frameDelay);
  }

  clearLine(terminal);
}

/**
 * Print a box around text
 */
export async function printBox(
  terminal: Terminal,
  lines: string[],
  delayMs: number = 30,
): Promise<void> {
  const maxWidth = Math.max(...lines.map((l) => l.length));
  const top = "╔" + "═".repeat(maxWidth + 2) + "╗";
  const bottom = "╚" + "═".repeat(maxWidth + 2) + "╝";

  await printLine(terminal, top, delayMs);

  for (const line of lines) {
    const padded = line.padEnd(maxWidth, " ");
    await printLine(terminal, `║ ${padded} ║`, delayMs);
  }

  await printLine(terminal, bottom, delayMs);
}

/**
 * Print ASCII art with color
 */
export async function printAsciiArt(
  terminal: Terminal,
  art: string[],
  color: string = "\x1b[32m",
  delayMs: number = 20,
): Promise<void> {
  terminal.write(color);
  await printLines(terminal, art, delayMs, 0);
  terminal.write("\x1b[0m");
}

/**
 * Delay utility
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
