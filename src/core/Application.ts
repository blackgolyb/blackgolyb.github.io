import type { ITerminalSource } from "./ITerminalSource";
import { CRTRenderer } from "../rendering/CRTRenderer";
import type { ProcessTerminalAdapter } from "../terminal/ProcessTerminalAdapter";
import { MobileKeyboard } from "../terminal/MobileKeyboard";

export class Application {
  private renderer: CRTRenderer;
  private running: boolean = false;
  private terminalSource: ITerminalSource;
  private mobileKeyboard: MobileKeyboard | null = null;
  private unsubscribeMouseEvents: (() => void) | null = null;

  constructor(
    terminalSource: ITerminalSource,
    containerId: string = "terminal",
  ) {
    this.terminalSource = terminalSource;

    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }
    // Initialize CRT renderer
    this.renderer = new CRTRenderer(containerId);

    // Attach the XTerm terminal to the CRT renderer
    const terminal = (terminalSource as ProcessTerminalAdapter).getTerminal();
    this.renderer.attachTerminal(terminal);

    this.setupMouseHandler();

    // Setup input handling and scrolling
    this.setupScrollListeners();
    this.setupResizeHandler();

    // Setup mobile keyboard
    this.setupMobileKeyboard();

    // Focus the terminal
    setTimeout(() => {
      this.renderer.focus();
    }, 200);
  }

  private setupMouseHandler(): void {
    const adapter = this.terminalSource as ProcessTerminalAdapter;

    this.unsubscribeMouseEvents = this.renderer.onMouseEvent((event) => {
      const response = adapter.handleMouseEvent(event);
      this.renderer.setCursorStyle(
        response?.cursor === "pointer" ? "pointer" : "",
      );
      this.renderer.setHoverRange(response?.hoverRange ?? null);
    });
  }

  private setupMobileKeyboard(): void {
    const adapter = this.terminalSource as ProcessTerminalAdapter;

    // Create the mobile keyboard attached to document.body
    // It will auto-show/hide based on screen width via media queries
    this.mobileKeyboard = new MobileKeyboard(document.body, (data: string) => {
      if (this.handleScrollShortcut(data)) return;
      adapter.sendRawInput(data);
    });

    // When the keyboard visibility changes, trigger a resize so the terminal
    // recalculates its grid size to fit the remaining space
    const observer = new MutationObserver(() => {
      setTimeout(() => {
        this.handleResize();
      }, 50);
    });

    const kbEl = document.getElementById("mobile-keyboard");
    if (kbEl) {
      observer.observe(kbEl, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }
  }

  private handleResize(): void {
    const gridSize = this.renderer.getGridSize();
    if (gridSize.cols > 0 && gridSize.rows > 0) {
      (this.terminalSource as ProcessTerminalAdapter).updateTerminalSize(
        gridSize.cols,
        gridSize.rows,
      );
    }
  }

  private setupResizeHandler(): void {
    window.addEventListener("resize", () => {
      this.handleResize();
    });

    // Initial resize
    setTimeout(() => {
      this.handleResize();
    }, 100);
  }

  private setupScrollListeners(): void {
    window.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        const delta = event.deltaY > 0 ? 3 : -3;
        this.terminalSource.scroll(delta);
      },
      { passive: false },
    );

    window.addEventListener(
      "keydown",
      (event) => {
        if (this.handleKeyboardScrollShortcut(event)) {
          return;
        }

        if (event.key === "Tab") {
          event.preventDefault();
          event.stopPropagation();
          this.terminalSource.handleInput(event);
          return;
        }

        if (event.key === "PageUp") {
          event.preventDefault();
          this.terminalSource.scroll(-10);
        } else if (event.key === "PageDown") {
          event.preventDefault();
          this.terminalSource.scroll(10);
        } else {
          // Handle all other keyboard input
          this.terminalSource.handleInput(event);
        }
      },
      { capture: true },
    );
  }

  private handleKeyboardScrollShortcut(event: KeyboardEvent): boolean {
    if (!event.ctrlKey || event.altKey || event.metaKey) return false;

    const key = event.key.toLowerCase();
    if (key !== "u" && key !== "d") return false;

    event.preventDefault();
    event.stopPropagation();
    this.terminalSource.scroll(key === "u" ? -10 : 10);
    return true;
  }

  private handleScrollShortcut(data: string): boolean {
    if (data === "\x15") {
      this.terminalSource.scroll(-10);
      return true;
    }

    if (data === "\x04") {
      this.terminalSource.scroll(10);
      return true;
    }

    return false;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.renderer.start();
  }

  stop(): void {
    this.running = false;
    this.renderer.stop();
  }

  dispose(): void {
    this.stop();
    if (this.unsubscribeMouseEvents) {
      this.unsubscribeMouseEvents();
      this.unsubscribeMouseEvents = null;
    }
    this.renderer.dispose();
    if (this.mobileKeyboard) {
      this.mobileKeyboard.dispose();
    }
    (this.terminalSource as ProcessTerminalAdapter).dispose();
  }
}
