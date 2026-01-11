import { BaseProcess } from "../process/BaseProcess";
import { ProcessContext } from "../process/IProcess";
import { typeText, delay } from "../utils/textAnimations";
import { Terminal } from "@xterm/xterm";

export class ExitCommand extends BaseProcess {
  static name = "exit";

  protected async run(context: ProcessContext): Promise<void> {
    // Get terminal for direct manipulation
    const terminal = (context.io as any).getTerminal?.() as Terminal;

    if (!terminal) {
      this.writeLine("\x1b[31mError: Terminal not available\x1b[0m");
      return;
    }

    // Disable input during the sequence
    terminal.write("\r\n");

    // Phase 1: Warning
    await typeText(
      terminal,
      "\x1b[33m⚠ WARNING: Initiating system shutdown...\x1b[0m\r\n",
      30,
    );
    await delay(500);

    // Phase 2: Error messages
    const errors = [
      "\x1b[31m[ERROR]\x1b[0m Memory corruption detected at 0x7FFF5C3A8",
      "\x1b[31m[ERROR]\x1b[0m Kernel panic: stack overflow in thread_main",
      "\x1b[31m[ERROR]\x1b[0m Segmentation fault (core dumped)",
      "\x1b[31m[CRITICAL]\x1b[0m Cannot access /dev/reality",
      "\x1b[31m[FATAL]\x1b[0m Matrix integrity compromised",
    ];

    for (const error of errors) {
      await typeText(terminal, error + "\r\n", 20);
      await delay(200);
    }

    await delay(500);

    // Phase 3: Glitch effect
    terminal.write("\r\n\x1b[5m\x1b[31m");
    await typeText(terminal, "SYSTEM FAILURE IMMINENT", 50);
    terminal.write("\x1b[0m\r\n\r\n");
    await delay(300);

    // Phase 4: Countdown
    for (let i = 5; i > 0; i--) {
      terminal.write(`\x1b[1m\x1b[31m${i}...\x1b[0m `);
      await delay(400);
    }
    terminal.write("\r\n\r\n");

    // Phase 5: Final messages
    await typeText(terminal, "\x1b[31m>> REALITY.SYS CORRUPTED\x1b[0m\r\n", 40);
    await typeText(
      terminal,
      "\x1b[31m>> DISCONNECTING FROM SIMULATION\x1b[0m\r\n",
      40,
    );
    await delay(500);

    // Phase 6: Screen glitch
    await this.glitchEffect(terminal);

    // Phase 7: Final goodbye
    terminal.write("\r\n\x1b[92m");
    await typeText(terminal, "Wake up, Neo...", 100);
    terminal.write("\x1b[0m\r\n\r\n");
    await delay(1000);

    // Phase 8: Break the site
    await this.destroySite();
  }

  private async glitchEffect(terminal: any): Promise<void> {
    const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`";
    for (let i = 0; i < 10; i++) {
      terminal.write("\r\n\x1b[91m");
      for (let j = 0; j < 60; j++) {
        const char =
          glitchChars[Math.floor(Math.random() * glitchChars.length)];
        terminal.write(char);
      }
      terminal.write("\x1b[0m");
      await delay(50);
    }
  }

  private async destroySite(): Promise<void> {
    // Get all elements
    const body = document.body;
    const glCanvas = document.getElementById("gl") as HTMLCanvasElement;
    const termContainer = document.getElementById("term");

    // Create overlay
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "black";
    overlay.style.zIndex = "9999";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.flexDirection = "column";
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 1s";

    const message = document.createElement("div");
    message.style.color = "#00ff00";
    message.style.fontFamily = "monospace";
    message.style.fontSize = "48px";
    message.style.textAlign = "center";
    message.style.animation = "glitch 0.3s infinite";
    message.textContent = "SYSTEM TERMINATED";

    const subMessage = document.createElement("div");
    subMessage.style.color = "#00ff00";
    subMessage.style.fontFamily = "monospace";
    subMessage.style.fontSize = "20px";
    subMessage.style.marginTop = "20px";
    subMessage.style.opacity = "0.7";
    subMessage.textContent = "Reload to restart the simulation";

    overlay.appendChild(message);
    overlay.appendChild(subMessage);

    // Add glitch animation
    const style = document.createElement("style");
    style.textContent = `
      @keyframes glitch {
        0% { transform: translate(0); }
        20% { transform: translate(-2px, 2px); }
        40% { transform: translate(-2px, -2px); }
        60% { transform: translate(2px, 2px); }
        80% { transform: translate(2px, -2px); }
        100% { transform: translate(0); }
      }
      @keyframes screenShake {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        10% { transform: translate(-5px, -5px) rotate(-1deg); }
        20% { transform: translate(5px, 5px) rotate(1deg); }
        30% { transform: translate(-5px, 5px) rotate(-1deg); }
        40% { transform: translate(5px, -5px) rotate(1deg); }
        50% { transform: translate(-5px, -5px) rotate(-1deg); }
        60% { transform: translate(5px, 5px) rotate(1deg); }
        70% { transform: translate(-5px, 5px) rotate(-1deg); }
        80% { transform: translate(5px, -5px) rotate(1deg); }
        90% { transform: translate(-5px, 5px) rotate(-1deg); }
      }
      @keyframes colorDistortion {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    body.appendChild(overlay);

    // Shake the screen
    if (glCanvas) {
      glCanvas.style.animation = "screenShake 0.5s ease-in-out";
    }

    await delay(500);

    // Color distortion
    if (glCanvas) {
      glCanvas.style.animation = "colorDistortion 2s linear";
    }

    await delay(500);

    // Glitch the canvas
    if (glCanvas) {
      const ctx = glCanvas.getContext("2d");
      if (ctx) {
        for (let i = 0; i < 20; i++) {
          const imageData = ctx.getImageData(
            0,
            0,
            glCanvas.width,
            glCanvas.height,
          );
          const data = imageData.data;

          // RGB shift
          for (let j = 0; j < data.length; j += 4) {
            if (Math.random() > 0.95) {
              data[j] = Math.random() * 255; // R
              data[j + 1] = Math.random() * 255; // G
              data[j + 2] = Math.random() * 255; // B
            }
          }

          ctx.putImageData(imageData, 0, 0);
          await delay(50);
        }
      }
    }

    // Fade in overlay
    setTimeout(() => {
      overlay.style.opacity = "1";
    }, 100);

    await delay(1000);

    // Break everything
    if (glCanvas) {
      glCanvas.style.filter = "blur(20px) brightness(0.3)";
    }
    if (termContainer) {
      termContainer.style.filter = "blur(20px) brightness(0.3)";
    }

    // Make message blink
    setInterval(() => {
      message.style.opacity = message.style.opacity === "0" ? "1" : "0";
    }, 500);

    // Infinite rotation chaos
    let rotation = 0;
    setInterval(() => {
      rotation += 5;
      body.style.transform = `rotate(${rotation}deg)`;
    }, 100);
  }
}
