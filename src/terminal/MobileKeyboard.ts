export type KeyHandler = (data: string) => void;

interface KeyDef {
  label: string;
  data: string;
  width?: number;
  className?: string;
}

const KEYBOARD_LAYOUTS: { normal: KeyDef[][]; shift: KeyDef[][] } = {
  normal: [
    [
      { label: "1", data: "1" },
      { label: "2", data: "2" },
      { label: "3", data: "3" },
      { label: "4", data: "4" },
      { label: "5", data: "5" },
      { label: "6", data: "6" },
      { label: "7", data: "7" },
      { label: "8", data: "8" },
      { label: "9", data: "9" },
      { label: "0", data: "0" },
    ],
    [
      { label: "q", data: "q" },
      { label: "w", data: "w" },
      { label: "e", data: "e" },
      { label: "r", data: "r" },
      { label: "t", data: "t" },
      { label: "y", data: "y" },
      { label: "u", data: "u" },
      { label: "i", data: "i" },
      { label: "o", data: "o" },
      { label: "p", data: "p" },
    ],
    [
      { label: "a", data: "a" },
      { label: "s", data: "s" },
      { label: "d", data: "d" },
      { label: "f", data: "f" },
      { label: "g", data: "g" },
      { label: "h", data: "h" },
      { label: "j", data: "j" },
      { label: "k", data: "k" },
      { label: "l", data: "l" },
      { label: "/", data: "/" },
    ],
    [
      {
        label: "⇧",
        data: "__SHIFT__",
        width: 1.4,
        className: "mk-key--modifier",
      },
      { label: "z", data: "z" },
      { label: "x", data: "x" },
      { label: "c", data: "c" },
      { label: "v", data: "v" },
      { label: "b", data: "b" },
      { label: "n", data: "n" },
      { label: "m", data: "m" },
      {
        label: "⌫",
        data: "\x7f",
        width: 1.4,
        className: "mk-key--modifier",
      },
    ],
    [
      {
        label: "Ctrl",
        data: "__CTRL__",
        width: 1.3,
        className: "mk-key--modifier",
      },
      {
        label: "sym",
        data: "__SYM__",
        width: 1.3,
        className: "mk-key--modifier",
      },
      { label: "⎵", data: " ", width: 3.5 },
      { label: "-", data: "-" },
      { label: ".", data: "." },
      {
        label: "↵",
        data: "\r",
        width: 1.5,
        className: "mk-key--enter",
      },
    ],
    [
      {
        label: "Tab",
        data: "\t",
        width: 1.2,
        className: "mk-key--modifier",
      },
      {
        label: "Esc",
        data: "\x1b",
        width: 1.2,
        className: "mk-key--modifier",
      },
      {
        label: "←",
        data: "\x1b[D",
        className: "mk-key--arrow",
      },
      {
        label: "↓",
        data: "\x1b[B",
        className: "mk-key--arrow",
      },
      {
        label: "↑",
        data: "\x1b[A",
        className: "mk-key--arrow",
      },
      {
        label: "→",
        data: "\x1b[C",
        className: "mk-key--arrow",
      },
      { label: "|", data: "|" },
      { label: "~", data: "~" },
    ],
  ],
  shift: [
    [
      { label: "!", data: "!" },
      { label: "@", data: "@" },
      { label: "#", data: "#" },
      { label: "$", data: "$" },
      { label: "%", data: "%" },
      { label: "^", data: "^" },
      { label: "&", data: "&" },
      { label: "*", data: "*" },
      { label: "(", data: "(" },
      { label: ")", data: ")" },
    ],
    [
      { label: "Q", data: "Q" },
      { label: "W", data: "W" },
      { label: "E", data: "E" },
      { label: "R", data: "R" },
      { label: "T", data: "T" },
      { label: "Y", data: "Y" },
      { label: "U", data: "U" },
      { label: "I", data: "I" },
      { label: "O", data: "O" },
      { label: "P", data: "P" },
    ],
    [
      { label: "A", data: "A" },
      { label: "S", data: "S" },
      { label: "D", data: "D" },
      { label: "F", data: "F" },
      { label: "G", data: "G" },
      { label: "H", data: "H" },
      { label: "J", data: "J" },
      { label: "K", data: "K" },
      { label: "L", data: "L" },
      { label: "?", data: "?" },
    ],
    [
      {
        label: "⇧",
        data: "__SHIFT__",
        width: 1.4,
        className: "mk-key--modifier mk-key--active",
      },
      { label: "Z", data: "Z" },
      { label: "X", data: "X" },
      { label: "C", data: "C" },
      { label: "V", data: "V" },
      { label: "B", data: "B" },
      { label: "N", data: "N" },
      { label: "M", data: "M" },
      {
        label: "⌫",
        data: "\x7f",
        width: 1.4,
        className: "mk-key--modifier",
      },
    ],
    [
      {
        label: "Ctrl",
        data: "__CTRL__",
        width: 1.3,
        className: "mk-key--modifier",
      },
      {
        label: "sym",
        data: "__SYM__",
        width: 1.3,
        className: "mk-key--modifier",
      },
      { label: "⎵", data: " ", width: 3.5 },
      { label: "_", data: "_" },
      { label: ":", data: ":" },
      {
        label: "↵",
        data: "\r",
        width: 1.5,
        className: "mk-key--enter",
      },
    ],
    [
      {
        label: "Tab",
        data: "\t",
        width: 1.2,
        className: "mk-key--modifier",
      },
      {
        label: "Esc",
        data: "\x1b",
        width: 1.2,
        className: "mk-key--modifier",
      },
      {
        label: "←",
        data: "\x1b[D",
        className: "mk-key--arrow",
      },
      {
        label: "↓",
        data: "\x1b[B",
        className: "mk-key--arrow",
      },
      {
        label: "↑",
        data: "\x1b[A",
        className: "mk-key--arrow",
      },
      {
        label: "→",
        data: "\x1b[C",
        className: "mk-key--arrow",
      },
      { label: "+", data: "+" },
      { label: "=", data: "=" },
    ],
  ],
};

const SYM_LAYOUT: KeyDef[][] = [
  [
    { label: "1", data: "1" },
    { label: "2", data: "2" },
    { label: "3", data: "3" },
    { label: "4", data: "4" },
    { label: "5", data: "5" },
    { label: "6", data: "6" },
    { label: "7", data: "7" },
    { label: "8", data: "8" },
    { label: "9", data: "9" },
    { label: "0", data: "0" },
  ],
  [
    { label: "!", data: "!" },
    { label: "@", data: "@" },
    { label: "#", data: "#" },
    { label: "$", data: "$" },
    { label: "%", data: "%" },
    { label: "^", data: "^" },
    { label: "&", data: "&" },
    { label: "*", data: "*" },
    { label: "(", data: "(" },
    { label: ")", data: ")" },
  ],
  [
    { label: "-", data: "-" },
    { label: "=", data: "=" },
    { label: "[", data: "[" },
    { label: "]", data: "]" },
    { label: "{", data: "{" },
    { label: "}", data: "}" },
    { label: "\\", data: "\\" },
    { label: ";", data: ";" },
    { label: "'", data: "'" },
    { label: '"', data: '"' },
  ],
  [
    {
      label: "⇧",
      data: "__SHIFT__",
      width: 1.4,
      className: "mk-key--modifier",
    },
    { label: "`", data: "`" },
    { label: "~", data: "~" },
    { label: "|", data: "|" },
    { label: "<", data: "<" },
    { label: ">", data: ">" },
    { label: ",", data: "," },
    { label: "?", data: "?" },
    {
      label: "⌫",
      data: "\x7f",
      width: 1.4,
      className: "mk-key--modifier",
    },
  ],
  [
    {
      label: "Ctrl",
      data: "__CTRL__",
      width: 1.3,
      className: "mk-key--modifier",
    },
    {
      label: "ABC",
      data: "__SYM__",
      width: 1.3,
      className: "mk-key--modifier mk-key--active",
    },
    { label: "⎵", data: " ", width: 3.5 },
    { label: "_", data: "_" },
    { label: "+", data: "+" },
    {
      label: "↵",
      data: "\r",
      width: 1.5,
      className: "mk-key--enter",
    },
  ],
  [
    {
      label: "Tab",
      data: "\t",
      width: 1.2,
      className: "mk-key--modifier",
    },
    {
      label: "Esc",
      data: "\x1b",
      width: 1.2,
      className: "mk-key--modifier",
    },
    {
      label: "←",
      data: "\x1b[D",
      className: "mk-key--arrow",
    },
    {
      label: "↓",
      data: "\x1b[B",
      className: "mk-key--arrow",
    },
    {
      label: "↑",
      data: "\x1b[A",
      className: "mk-key--arrow",
    },
    {
      label: "→",
      data: "\x1b[C",
      className: "mk-key--arrow",
    },
    { label: "/", data: "/" },
    { label: ":", data: ":" },
  ],
];

const CTRL_KEY_MAP: Record<string, string> = {
  c: "\x03",
  d: "\x04",
  z: "\x1a",
  l: "\x0c",
  u: "\x15",
  k: "\x0b",
  w: "\x17",
  a: "\x01",
  e: "\x05",
};

export class MobileKeyboard {
  private container: HTMLElement;
  private keyboardEl: HTMLElement;
  private onKey: KeyHandler;
  private shiftActive = false;
  private ctrlActive = false;
  private symActive = false;
  private visible = false;

  constructor(container: HTMLElement, onKey: KeyHandler) {
    this.container = container;
    this.onKey = onKey;

    this.keyboardEl = document.createElement("div");
    this.keyboardEl.className = "mobile-keyboard";
    this.keyboardEl.id = "mobile-keyboard";
    this.container.appendChild(this.keyboardEl);

    this.injectStyles();
    this.render();
    this.checkVisibility();

    // Use matchMedia for responsive changes
    const mql = window.matchMedia("(max-width: 768px)");
    mql.addEventListener("change", () => this.checkVisibility());

    // Also check on orientation change
    window.addEventListener("orientationchange", () => {
      setTimeout(() => this.checkVisibility(), 100);
    });
  }

  private checkVisibility(): void {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile && !this.visible) {
      this.show();
    } else if (!isMobile && this.visible) {
      this.hide();
    }
  }

  show(): void {
    this.visible = true;
    this.keyboardEl.classList.add("mobile-keyboard--visible");
    document.body.classList.add("mobile-keyboard-active");
  }

  hide(): void {
    this.visible = false;
    this.keyboardEl.classList.remove("mobile-keyboard--visible");
    document.body.classList.remove("mobile-keyboard-active");
  }

  isVisible(): boolean {
    return this.visible;
  }

  private getActiveLayout(): KeyDef[][] {
    if (this.symActive) {
      return SYM_LAYOUT;
    }
    return this.shiftActive ? KEYBOARD_LAYOUTS.shift : KEYBOARD_LAYOUTS.normal;
  }

  private render(): void {
    this.keyboardEl.innerHTML = "";

    const layout = this.getActiveLayout();

    for (const row of layout) {
      const rowEl = document.createElement("div");
      rowEl.className = "mk-row";

      for (const key of row) {
        const keyEl = document.createElement("button");
        keyEl.className = `mk-key ${key.className || ""}`;
        keyEl.textContent = key.label;
        keyEl.setAttribute("data-data", key.data);

        if (key.width) {
          keyEl.style.flex = `${key.width}`;
        }

        // Highlight Ctrl if active
        if (key.data === "__CTRL__" && this.ctrlActive) {
          keyEl.classList.add("mk-key--active");
        }

        // Prevent default to avoid focus loss and double events
        keyEl.addEventListener("touchstart", (e) => {
          e.preventDefault();
          this.handleKeyPress(key);
          keyEl.classList.add("mk-key--pressed");
        });

        keyEl.addEventListener("touchend", (e) => {
          e.preventDefault();
          keyEl.classList.remove("mk-key--pressed");
        });

        keyEl.addEventListener("touchcancel", (e) => {
          e.preventDefault();
          keyEl.classList.remove("mk-key--pressed");
        });

        // Mouse fallback for testing on desktop
        keyEl.addEventListener("mousedown", (e) => {
          e.preventDefault();
          this.handleKeyPress(key);
          keyEl.classList.add("mk-key--pressed");
        });

        keyEl.addEventListener("mouseup", (e) => {
          e.preventDefault();
          keyEl.classList.remove("mk-key--pressed");
        });

        keyEl.addEventListener("mouseleave", () => {
          keyEl.classList.remove("mk-key--pressed");
        });

        rowEl.appendChild(keyEl);
      }

      this.keyboardEl.appendChild(rowEl);
    }
  }

  private handleKeyPress(key: KeyDef): void {
    if (key.data === "__SHIFT__") {
      this.shiftActive = !this.shiftActive;
      this.render();
      return;
    }

    if (key.data === "__CTRL__") {
      this.ctrlActive = !this.ctrlActive;
      this.render();
      return;
    }

    if (key.data === "__SYM__") {
      this.symActive = !this.symActive;
      this.shiftActive = false;
      this.render();
      return;
    }

    let data = key.data;

    // Handle Ctrl combinations
    if (this.ctrlActive && key.data.length === 1) {
      const lower = key.data.toLowerCase();
      if (CTRL_KEY_MAP[lower]) {
        data = CTRL_KEY_MAP[lower];
      }
      this.ctrlActive = false;
      this.render();
    }

    // Auto-disable shift after a character key
    if (
      this.shiftActive &&
      key.data.length === 1 &&
      !key.className?.includes("modifier")
    ) {
      this.shiftActive = false;
      this.render();
    }

    this.onKey(data);
  }

  private injectStyles(): void {
    if (document.getElementById("mobile-keyboard-styles")) return;

    const style = document.createElement("style");
    style.id = "mobile-keyboard-styles";
    style.textContent = `
      /* ======= Mobile Layout ======= */
      @media (max-width: 768px) {
        html, body {
          overflow: hidden;
          position: fixed;
          width: 100%;
          height: 100%;
        }

        body.mobile-keyboard-active {
          display: flex;
          flex-direction: column;
        }

        body.mobile-keyboard-active #terminal {
          position: relative;
          flex: 1 1 auto;
          min-height: 0;
          width: 100%;
          height: auto;
        }

        body.mobile-keyboard-active #terminal canvas {
          width: 100% !important;
          height: 100% !important;
        }
      }

      /* ======= Color Tokens ======= */
      .mobile-keyboard {
        /* ---- Tray ---- */
        --tray-bg: #232721;
        --tray-top-border: #a09a8e;
        --tray-bottom-border: #6a6458;
        --tray-gradient-top: #969088;
        --tray-gradient-mid: #888278;
        --tray-gradient-bot: #7e786e;

        /* ---- Regular key ---- */
        --key-top-light: #ddd9d2;
        --key-top-mid: #d4d0c8;
        --key-top-dark: #c4c0b6;
        --key-edge-top: #eae8e2;
        --key-edge-left: #ccc9c1;
        --key-edge-right: #b6b3ab;
        --key-edge-bottom: #908c84;
        --key-shadow-hard: #726e66;
        --key-text: #2c2c2c;

        /* ---- Modifier key ---- */
        --mod-top-light: #b0aca4;
        --mod-top-mid: #a5a199;
        --mod-top-dark: #96928a;
        --mod-edge-top: #c0bcb4;
        --mod-edge-left: #a8a49c;
        --mod-edge-right: #908c84;
        --mod-edge-bottom: #6e6a62;
        --mod-shadow-hard: #5a5650;
        --mod-text: #2a2a2a;

        /* ---- Enter key ---- */
        --enter-top-light: #c8d2de;
        --enter-top-mid: #b8c4d2;
        --enter-top-dark: #a2b0c2;
        --enter-edge-top: #d8e0ea;
        --enter-edge-left: #bcc8d6;
        --enter-edge-right: #9aaabe;
        --enter-edge-bottom: #687a92;
        --enter-shadow-hard: #506478;
        --enter-text: #1e2a38;

        /* ---- Active modifier ---- */
        --active-top-light: #a0a896;
        --active-top-mid: #949c8a;
        --active-top-dark: #848c78;
        --active-edge-bottom: #5c6650;
        --active-shadow-hard: #4e5844;
        --active-text: #1e2e18;

        /* ---- Pressed key ---- */
        --pressed-top-light: #c8c4bc;
        --pressed-top-mid: #c0bcb4;
        --pressed-top-dark: #b4b0a6;
      }

      /* ======= Mobile Keyboard ======= */
      .mobile-keyboard {
        display: none;
        flex-direction: column;
        flex-shrink: 0;
        width: 100%;
        background: var(--tray-bg);
        border-top: 3px solid var(--tray-top-border);
        padding: 8px 5px 10px 5px;
        box-sizing: border-box;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
        z-index: 100;

        /* Matte plastic tray texture */
        background-image:
          radial-gradient(ellipse at 50% 0%, rgba(170, 165, 155, 0.3) 0%, transparent 60%),
          linear-gradient(180deg, var(--tray-gradient-top) 0%, var(--tray-gradient-mid) 50%, var(--tray-gradient-bot) 100%);
        border-bottom: 2px solid var(--tray-bottom-border);
      }

      .mobile-keyboard--visible {
        display: flex;
      }

      /* ======= Keyboard Rows ======= */
      .mk-row {
        display: flex;
        justify-content: center;
        gap: 5px;
        margin-bottom: 5px;
        padding: 0 4px;
      }

      .mk-row:last-child {
        margin-bottom: 0;
      }

      /* ======= Keys — IBM Model M concave (dished) keycap ======= */
      .mk-key {
        flex: 1;
        min-width: 0;
        height: 42px;
        padding: 0 2px;

        border-radius: 5px 5px 4px 4px;

        /*
         * Thick borders = visible keycap walls.
         * Top lip bright, sides mid, bottom face thick & dark.
         */
        border-top: 2px solid var(--key-edge-top);
        border-left: 3px solid var(--key-edge-left);
        border-right: 3px solid var(--key-edge-right);
        border-bottom: 5px solid var(--key-edge-bottom);

        /*
         * Concave dished surface:
         * Center is darker (scooped down away from light),
         * edges are lighter (raised rim catches light).
         */
        background:
          radial-gradient(
            ellipse 65% 55% at 50% 45%,
            var(--key-top-dark) 0%,
            var(--key-top-mid) 55%,
            var(--key-top-light) 100%
          );

        color: var(--key-text);
        font-family: 'Courier New', 'Lucida Console', monospace;
        font-size: 13px;
        font-weight: bold;
        text-align: center;
        cursor: pointer;
        outline: none;
        position: relative;
        overflow: hidden;

        text-shadow: 0 1px 0 rgba(255, 255, 255, 0.25);

        /*
         * 3D depth + concave dish:
         * Outer: hard bottom shadow (key stands up from tray).
         * Inner: top shadow (rim casts shadow INTO the dish),
         *        bottom highlight (light reflects off inner bottom wall),
         *        side shadows (rim walls darken the inner edges).
         */
        box-shadow:
          0 4px 0 0 var(--key-shadow-hard),
          0 5px 4px 0 rgba(0, 0, 0, 0.35),
          0 2px 6px 0 rgba(0, 0, 0, 0.12),
          inset 0 3px 5px -1px rgba(0, 0, 0, 0.18),
          inset 0 -2px 4px -1px rgba(255, 255, 255, 0.45),
          inset 3px 0 5px -2px rgba(0, 0, 0, 0.12),
          inset -3px 0 5px -2px rgba(0, 0, 0, 0.12);

        transition: transform 0.04s ease-out, box-shadow 0.04s ease-out;
        -webkit-tap-highlight-color: transparent;
      }

      /* Concave dish — rim highlight around the edge, dark center */
      .mk-key::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        border-radius: 4px;
        /* Bright rim ring fading inward to transparent (the scooped bowl) */
        background:
          radial-gradient(
            ellipse 80% 70% at 50% 45%,
            transparent 40%,
            rgba(255, 255, 255, 0.10) 75%,
            rgba(255, 255, 255, 0.18) 100%
          );
      }

      /* Pressed state — key pushed flat into tray */
      .mk-key--pressed {
        transform: translateY(3px) !important;
        border-bottom-width: 2px !important;
        box-shadow:
          0 1px 0 0 var(--key-shadow-hard),
          0 1px 2px 0 rgba(0, 0, 0, 0.25),
          inset 0 2px 4px rgba(0, 0, 0, 0.15),
          inset 0 -1px 2px rgba(255, 255, 255, 0.1) !important;
        background:
          radial-gradient(
            ellipse 65% 55% at 50% 45%,
            var(--pressed-top-dark) 0%,
            var(--pressed-top-mid) 55%,
            var(--pressed-top-light) 100%
          ) !important;
      }

      /*
       * Modifier keys — noticeably darker grey,
       * clearly distinct from regular keys.
       */
      .mk-key--modifier {
        border-top-color: var(--mod-edge-top);
        border-left-color: var(--mod-edge-left);
        border-right-color: var(--mod-edge-right);
        border-bottom-color: var(--mod-edge-bottom);
        background:
          radial-gradient(
            ellipse 65% 55% at 50% 45%,
            var(--mod-top-dark) 0%,
            var(--mod-top-mid) 55%,
            var(--mod-top-light) 100%
          );
        color: var(--mod-text);
        font-size: 11px;
        box-shadow:
          0 4px 0 0 var(--mod-shadow-hard),
          0 5px 4px 0 rgba(0, 0, 0, 0.35),
          0 2px 6px 0 rgba(0, 0, 0, 0.12),
          inset 0 3px 5px -1px rgba(0, 0, 0, 0.20),
          inset 0 -2px 4px -1px rgba(255, 255, 255, 0.35),
          inset 3px 0 5px -2px rgba(0, 0, 0, 0.14),
          inset -3px 0 5px -2px rgba(0, 0, 0, 0.14);
      }

      /* Active modifier — sunken, green-tinted */
      .mk-key--active {
        transform: translateY(2px);
        border-bottom-width: 3px !important;
        border-top-color: var(--mod-edge-top);
        border-left-color: var(--mod-edge-left);
        border-right-color: var(--mod-edge-right);
        border-bottom-color: var(--active-edge-bottom) !important;
        background:
          radial-gradient(
            ellipse 65% 55% at 50% 45%,
            var(--active-top-dark) 0%,
            var(--active-top-mid) 55%,
            var(--active-top-light) 100%
          ) !important;
        color: var(--active-text) !important;
        box-shadow:
          0 2px 0 0 var(--active-shadow-hard),
          0 3px 3px 0 rgba(0, 0, 0, 0.3),
          0 1px 4px 0 rgba(0, 0, 0, 0.1),
          inset 0 3px 5px -1px rgba(0, 0, 0, 0.20),
          inset 0 -2px 4px -1px rgba(255, 255, 255, 0.25),
          inset 3px 0 5px -2px rgba(0, 0, 0, 0.14),
          inset -3px 0 5px -2px rgba(0, 0, 0, 0.14),
          0 0 8px rgba(80, 180, 80, 0.2) !important;
      }

      /* Enter key — slight green-ish tint */
      .mk-key--enter {
        border-top-color: var(--enter-edge-top);
        border-left-color: var(--enter-edge-left);
        border-right-color: var(--enter-edge-right);
        border-bottom-color: var(--enter-edge-bottom);
        background:
          radial-gradient(
            ellipse 65% 55% at 50% 45%,
            var(--enter-top-dark) 0%,
            var(--enter-top-mid) 55%,
            var(--enter-top-light) 100%
          );
        color: var(--enter-text);
        font-size: 14px;
        box-shadow:
          0 4px 0 0 var(--enter-shadow-hard),
          0 5px 4px 0 rgba(0, 0, 0, 0.35),
          0 2px 6px 0 rgba(0, 0, 0, 0.12),
          inset 0 3px 5px -1px rgba(0, 0, 0, 0.18),
          inset 0 -2px 4px -1px rgba(255, 255, 255, 0.40),
          inset 3px 0 5px -2px rgba(0, 0, 0, 0.10),
          inset -3px 0 5px -2px rgba(0, 0, 0, 0.10);
      }

      /* Arrow keys — same as modifier darkness */
      .mk-key--arrow {
        font-size: 14px;
        color: var(--mod-text);
        border-top-color: var(--mod-edge-top);
        border-left-color: var(--mod-edge-left);
        border-right-color: var(--mod-edge-right);
        border-bottom-color: var(--mod-edge-bottom);
        background:
          radial-gradient(
            ellipse 65% 55% at 50% 45%,
            var(--mod-top-dark) 0%,
            var(--mod-top-mid) 55%,
            var(--mod-top-light) 100%
          );
        box-shadow:
          0 4px 0 0 var(--mod-shadow-hard),
          0 5px 4px 0 rgba(0, 0, 0, 0.35),
          0 2px 6px 0 rgba(0, 0, 0, 0.12),
          inset 0 3px 5px -1px rgba(0, 0, 0, 0.20),
          inset 0 -2px 4px -1px rgba(255, 255, 255, 0.35),
          inset 3px 0 5px -2px rgba(0, 0, 0, 0.14),
          inset -3px 0 5px -2px rgba(0, 0, 0, 0.14);
      }

      /* Small screen adjustments */
      @media (max-width: 380px) {
        .mk-key {
          height: 36px;
          font-size: 11px;
          border-bottom-width: 4px;
          box-shadow:
            0 3px 0 0 var(--key-shadow-hard),
            0 4px 2px 0 rgba(0, 0, 0, 0.3),
            inset 0 2px 4px -1px rgba(0, 0, 0, 0.15),
            inset 0 -2px 3px -1px rgba(255, 255, 255, 0.35),
            inset 2px 0 4px -1px rgba(0, 0, 0, 0.10),
            inset -2px 0 4px -1px rgba(0, 0, 0, 0.10);
        }

        .mk-key--modifier {
          font-size: 9px;
        }

        .mk-row {
          gap: 4px;
          margin-bottom: 4px;
        }

        .mobile-keyboard {
          padding: 6px 3px 8px 3px;
        }
      }

      /* Landscape adjustments */
      @media (max-height: 500px) and (max-width: 768px) {
        .mk-key {
          height: 32px;
          font-size: 10px;
          border-left-width: 2px;
          border-right-width: 2px;
          border-bottom-width: 3px;
          box-shadow:
            0 2px 0 0 var(--key-shadow-hard),
            0 3px 2px 0 rgba(0, 0, 0, 0.3),
            inset 0 2px 3px -1px rgba(0, 0, 0, 0.15),
            inset 0 -1px 3px -1px rgba(255, 255, 255, 0.30),
            inset 2px 0 3px -1px rgba(0, 0, 0, 0.10),
            inset -2px 0 3px -1px rgba(0, 0, 0, 0.10);
        }

        .mk-key--modifier {
          font-size: 8px;
        }

        .mk-row {
          gap: 3px;
          margin-bottom: 3px;
        }

        .mobile-keyboard {
          padding: 4px 2px 6px 2px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  dispose(): void {
    this.keyboardEl.remove();
    const style = document.getElementById("mobile-keyboard-styles");
    if (style) style.remove();
    document.body.classList.remove("mobile-keyboard-active");
  }
}
