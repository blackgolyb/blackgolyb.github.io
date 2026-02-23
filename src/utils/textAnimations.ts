import type { WritableStream } from "./stream";

/**
 * Print text character by character with delay
 */
export async function printText(
  stream: WritableStream,
  text: string,
  delayMs: number = 30,
): Promise<void> {
  for (const char of text) {
    stream.write(char);
    await delay(delayMs);
  }
}

/**
 * Print text line by line with delay
 */
export async function printLine(
  stream: WritableStream,
  text: string,
  delayMs: number = 30,
): Promise<void> {
  await printText(stream, text, delayMs);
  stream.write("\r\n");
}

/**
 * Print multiple lines with delay between each line
 */
export async function printLines(
  stream: WritableStream,
  lines: string[],
  charDelayMs: number = 30,
  lineDelayMs: number = 100,
): Promise<void> {
  for (let i = 0; i < lines.length; i++) {
    await printText(stream, lines[i], charDelayMs);
    stream.write("\r\n");
    if (i < lines.length - 1) {
      await delay(lineDelayMs);
    }
  }
}

/**
 * Print text with typing effect and optional blinking cursor
 */
export async function typeText(
  stream: WritableStream,
  text: string,
  delayMs: number = 50,
  showCursor: boolean = false,
): Promise<void> {
  if (showCursor) {
    stream.write("\x1b[?25h"); // Show cursor
  }

  for (const char of text) {
    stream.write(char);
    await delay(delayMs);
  }

  if (showCursor) {
    stream.write("\x1b[?25l"); // Hide cursor
  }
}

/**
 * Print colored text character by character
 */
export async function printColoredText(
  stream: WritableStream,
  text: string,
  color: string,
  delayMs: number = 30,
): Promise<void> {
  stream.write(color);
  await printText(stream, text, delayMs);
  stream.write("\x1b[0m");
}

/**
 * Print text with rainbow color effect
 */
export async function printRainbowText(
  stream: WritableStream,
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
    stream.write(`${color + text[i]}\x1b[0m`);
    await delay(delayMs);
  }
}

/**
 * Print text with glitch effect
 */
export async function printGlitchText(
  stream: WritableStream,
  text: string,
  iterations: number = 3,
): Promise<void> {
  const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`";

  for (let iter = 0; iter < iterations; iter++) {
    // Show glitched version
    stream.write("\r");
    for (const char of text) {
      if (Math.random() < 0.3) {
        const glitch =
          glitchChars[Math.floor(Math.random() * glitchChars.length)];
        stream.write(`\x1b[91m${glitch}\x1b[0m`);
      } else {
        stream.write(char);
      }
    }
    await delay(50);
  }

  // Show final correct text
  stream.write(`\r${text}`);
}

/**
 * Clear the current line
 */
export function clearLine(stream: WritableStream): void {
  stream.write("\r\x1b[K");
}

/**
 * Move cursor up n lines
 */
export function moveCursorUp(stream: WritableStream, lines: number): void {
  stream.write(`\x1b[${lines}A`);
}

/**
 * Move cursor down n lines
 */
export function moveCursorDown(stream: WritableStream, lines: number): void {
  stream.write(`\x1b[${lines}B`);
}

/**
 * Print a progress bar
 */
export async function printProgressBar(
  stream: WritableStream,
  duration: number = 2000,
  width: number = 30,
  label: string = "Loading",
): Promise<void> {
  const steps = 51;
  const stepDelay = duration / steps;

  for (let i = 0; i < steps; i++) {
    const progress = i / steps;
    const filled = Math.floor(progress * width);
    const empty = width - filled;
    const bar = "█".repeat(filled) + "░".repeat(empty);
    const percent = Math.floor(progress * 100);

    clearLine(stream);
    stream.write(`\x1b[36m${label}:\x1b[0m [${bar}] ${percent}%`);

    await delay(stepDelay);
  }

  stream.write("\r\n");
  await delay(stepDelay);
}

/**
 * Print a spinner animation
 */
export async function printSpinner(
  stream: WritableStream,
  duration: number = 2000,
  message: string = "Processing",
): Promise<void> {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  const frameDelay = 80;
  const iterations = Math.floor(duration / frameDelay);

  for (let i = 0; i < iterations; i++) {
    const frame = frames[i % frames.length];
    clearLine(stream);
    stream.write(`\x1b[36m${frame}\x1b[0m ${message}...`);
    await delay(frameDelay);
  }

  clearLine(stream);
}

/**
 * Print a box around text
 */
export async function printBox(
  stream: WritableStream,
  lines: string[],
  delayMs: number = 30,
): Promise<void> {
  const maxWidth = Math.max(...lines.map((l) => l.length));
  const top = `╔${"═".repeat(maxWidth + 2)}╗`;
  const bottom = `╚${"═".repeat(maxWidth + 2)}╝`;

  await printLine(stream, top, delayMs);

  for (const line of lines) {
    const padded = line.padEnd(maxWidth, " ");
    await printLine(stream, `║ ${padded} ║`, delayMs);
  }

  await printLine(stream, bottom, delayMs);
}

/**
 * Print ASCII art with color
 */
export async function printAsciiArt(
  stream: WritableStream,
  art: string[],
  color: string = "\x1b[32m",
  delayMs: number = 20,
): Promise<void> {
  stream.write(color);
  await printLines(stream, art, delayMs, 0);
  stream.write("\x1b[0m");
}

/**
 * Delay utility
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
