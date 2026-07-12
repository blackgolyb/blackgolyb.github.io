import type { ITerminalSource } from "./ITerminalSource";
import { CRTRenderer } from "../rendering/CRTRenderer";
import type { ProcessTerminalAdapter } from "../terminal/ProcessTerminalAdapter";
import { MobileKeyboard } from "../terminal/MobileKeyboard";
import type { ProcessMouseResponse } from "../process/IProcess";

const TOUCH_TAP_MOVE_THRESHOLD = 8;

export class Application {
  private renderer: CRTRenderer;
  private running: boolean = false;
  private terminalSource: ITerminalSource;
  private mobileKeyboard: MobileKeyboard | null = null;
  private unsubscribeMouseEvents: (() => void) | null = null;
  private unsubscribeTouchEvents: (() => void) | null = null;
  private terminalResizeObserver: ResizeObserver | null = null;
  private keyboardMutationObserver: MutationObserver | null = null;
  private activeTouchId: number | null = null;
  private touchStartX = 0;
  private touchStartY = 0;
  private touchLastY = 0;
  private touchScrollRemainder = 0;
  private touchMoved = false;

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
    this.setupTouchHandler();

    // Setup input handling and scrolling
    this.setupScrollListeners();
    this.setupResizeHandler();
    this.setupTerminalResizeObserver();

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
      this.applyMouseResponse(response);
    });
  }

  private setupTouchHandler(): void {
    const adapter = this.terminalSource as ProcessTerminalAdapter;
    const container = this.renderer.getContainer();
    const controller = new AbortController();

    container.style.touchAction = "none";

    container.addEventListener(
      "touchstart",
      (event) => {
        if (this.activeTouchId !== null) return;

        const touch = event.changedTouches[0];
        if (!touch) return;

        event.preventDefault();
        this.activeTouchId = touch.identifier;
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.touchLastY = touch.clientY;
        this.touchScrollRemainder = 0;
        this.touchMoved = false;
        this.renderer.focus();
      },
      { passive: false, signal: controller.signal },
    );

    container.addEventListener(
      "touchmove",
      (event) => {
        const touch = this.getActiveChangedTouch(event);
        if (!touch) return;

        event.preventDefault();
        this.trackTouchMovement(touch);
        this.scrollFromTouch(touch);
      },
      { passive: false, signal: controller.signal },
    );

    container.addEventListener(
      "touchend",
      (event) => {
        const touch = this.getActiveChangedTouch(event);
        if (!touch) return;

        event.preventDefault();
        if (!this.touchMoved) {
          this.handleTouchAsMouseEvent(touch, event, "down", 0, 1, adapter);
          this.handleTouchAsMouseEvent(touch, event, "up", 0, 0, adapter);
        }
        this.resetTouchState();
      },
      { passive: false, signal: controller.signal },
    );

    container.addEventListener(
      "touchcancel",
      (event) => {
        if (!this.getActiveChangedTouch(event)) return;

        event.preventDefault();
        this.resetTouchState();
        const response = adapter.handleMouseEvent({
          type: "leave",
          col: 0,
          row: 0,
          viewportY: adapter.getTerminal().buffer.active.viewportY,
          button: -1,
          buttons: 0,
          altKey: event.altKey,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey,
          lineText: "",
        });
        this.applyMouseResponse(response);
      },
      { passive: false, signal: controller.signal },
    );

    this.unsubscribeTouchEvents = () => controller.abort();
  }

  private trackTouchMovement(touch: Touch): void {
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    if (Math.hypot(deltaX, deltaY) > TOUCH_TAP_MOVE_THRESHOLD) {
      this.touchMoved = true;
    }
  }

  private scrollFromTouch(touch: Touch): void {
    const gridSize = this.renderer.getGridSize();
    const containerHeight = this.renderer.getContainer().getBoundingClientRect().height;
    const rowHeight = gridSize.rows > 0 ? containerHeight / gridSize.rows : 18;
    const deltaY = touch.clientY - this.touchLastY;

    this.touchLastY = touch.clientY;
    this.touchScrollRemainder += -deltaY / Math.max(rowHeight, 1);

    const lines = Math.trunc(this.touchScrollRemainder);
    if (lines === 0) return;

    this.touchScrollRemainder -= lines;
    this.terminalSource.scroll(lines);
  }

  private resetTouchState(): void {
    this.activeTouchId = null;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchLastY = 0;
    this.touchScrollRemainder = 0;
    this.touchMoved = false;
  }

  private handleTouchAsMouseEvent(
    touch: Touch,
    event: TouchEvent,
    type: "down" | "move" | "up",
    button: number,
    buttons: number,
    adapter: ProcessTerminalAdapter,
  ): void {
    const containerRect = this.renderer.getContainer().getBoundingClientRect();
    const gridPosition = this.renderer.pixelToGrid(
      touch.clientX - containerRect.left,
      touch.clientY - containerRect.top,
    );
    const terminal = adapter.getTerminal();
    const viewportY = terminal.buffer.active.viewportY;
    const lineText =
      terminal.buffer.active
        .getLine(gridPosition.row + viewportY)
        ?.translateToString(true) ?? "";

    const response = adapter.handleMouseEvent({
      type,
      col: gridPosition.col,
      row: gridPosition.row,
      viewportY,
      button,
      buttons,
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      lineText,
    });
    this.applyMouseResponse(response);
  }

  private getActiveChangedTouch(event: TouchEvent): Touch | null {
    if (this.activeTouchId === null) return null;

    return (
      Array.from(event.changedTouches).find(
        (touch) => touch.identifier === this.activeTouchId,
      ) ?? null
    );
  }

  private applyMouseResponse(response: ProcessMouseResponse | void): void {
    this.renderer.setCursorStyle(response?.cursor === "pointer" ? "pointer" : "");
    this.renderer.setHoverRange(response?.hoverRange ?? null);
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
    this.keyboardMutationObserver = new MutationObserver(() => {
      setTimeout(() => {
        this.syncRendererSize();
      }, 50);
    });

    const kbEl = document.getElementById("mobile-keyboard");
    if (kbEl) {
      this.keyboardMutationObserver.observe(kbEl, {
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

  private syncRendererSize(): void {
    window.dispatchEvent(new Event("resize"));
  }

  private setupTerminalResizeObserver(): void {
    this.terminalResizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        this.syncRendererSize();
      });
    });
    this.terminalResizeObserver.observe(this.renderer.getContainer());
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
    if (this.unsubscribeTouchEvents) {
      this.unsubscribeTouchEvents();
      this.unsubscribeTouchEvents = null;
    }
    this.keyboardMutationObserver?.disconnect();
    this.keyboardMutationObserver = null;
    this.terminalResizeObserver?.disconnect();
    this.terminalResizeObserver = null;
    this.renderer.dispose();
    if (this.mobileKeyboard) {
      this.mobileKeyboard.dispose();
    }
    (this.terminalSource as ProcessTerminalAdapter).dispose();
  }
}
