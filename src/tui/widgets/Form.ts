import type {
  Point,
  Rect,
  TuiBufferLike,
  TuiEvent,
  TuiHoverRange,
  TuiStyle,
  TuiWidget,
} from "../core";

export type FormFieldType = "input" | "textarea";

export interface FormFieldDefinition {
  id: string;
  label: string;
  type: FormFieldType;
  rows?: number;
}

export interface FormLinkDefinition {
  id: string;
  label: string;
  value: string;
}

export type FormValues = Record<string, string>;

export interface FormOptions {
  title: string;
  help: string;
  links?: FormLinkDefinition[];
  fields: FormFieldDefinition[];
  submitLabel: string;
  cancelLabel?: string;
  compact?: boolean;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  status?: string;
  onLink?: (link: FormLinkDefinition) => void;
  onSubmit?: (values: FormValues) => void;
  onCancel?: () => void;
}

interface FieldLayout {
  field: FormFieldDefinition;
  rect: Rect;
}

interface LinkLayout {
  link: FormLinkDefinition;
  rect: Rect;
}

const styles = {
  title: { fg: "green", bold: true } satisfies TuiStyle,
  help: { fg: "gray", dim: true } satisfies TuiStyle,
  label: { fg: "gray", dim: true } satisfies TuiStyle,
  labelFocused: { fg: "cyan" } satisfies TuiStyle,
  button: { fg: "green" } satisfies TuiStyle,
  buttonActive: { fg: "green", reverse: true } satisfies TuiStyle,
  cancelButton: { fg: "red" } satisfies TuiStyle,
  cancelButtonActive: { fg: "red", reverse: true } satisfies TuiStyle,
  disabled: { fg: "gray", dim: true } satisfies TuiStyle,
  error: { fg: "red" } satisfies TuiStyle,
};

export class Form implements TuiWidget {
  private options: Required<
    Pick<FormOptions, "compact" | "minWidth" | "minHeight" | "maxWidth">
  > &
    FormOptions;
  private headerX = 0;
  private headerY = 0;
  private linkLayouts: LinkLayout[] = [];
  private fieldLayouts: FieldLayout[] = [];
  private submitRect: Rect = { x: 0, y: 0, width: 0, height: 1 };
  private cancelRect: Rect = { x: 0, y: 0, width: 0, height: 1 };
  private focusIndex = 0;
  private values: FormValues = {};
  private hoveredLinkIndex = -1;
  private hoveredSubmit = false;
  private hoveredCancel = false;
  private mouseDownLinkIndex = -1;
  private mouseDownSubmit = false;
  private mouseDownCancel = false;
  private submitting = false;
  private submitted = false;
  private status = "";
  private tooSmall = false;
  private requiredHeight = 0;

  constructor(options: FormOptions) {
    const compact = options.compact ?? false;
    this.options = {
      compact,
      minWidth: options.minWidth ?? (compact ? 30 : 48),
      minHeight: options.minHeight ?? (compact ? 15 : 22),
      maxWidth: options.maxWidth ?? (compact ? 44 : 74),
      ...options,
    };
    this.status = options.status ?? "";
    this.focusIndex = options.links?.length ?? 0;

    for (const field of options.fields) {
      this.values[field.id] = "";
    }
  }

  layout(bounds: Rect): void {
    this.linkLayouts = [];
    this.fieldLayouts = [];
    this.tooSmall = false;
    this.requiredHeight = this.options.minHeight;

    if (bounds.width < this.options.minWidth || bounds.height < this.options.minHeight) {
      this.tooSmall = true;
      return;
    }

    const width = Math.min(
      Math.max(bounds.width - 8, this.options.minWidth - 4),
      this.options.maxWidth,
    );
    const formHeight = this.getPreferredHeight(width);
    this.requiredHeight = formHeight;
    if (bounds.height < formHeight) {
      this.tooSmall = true;
      return;
    }

    const left = Math.floor((bounds.width - width) / 2);
    const centeredTop = Math.floor((bounds.height - formHeight) / 2);
    const top = this.options.compact
      ? Math.max(0, centeredTop)
      : Math.max(1, centeredTop);
    this.headerX = left;
    this.headerY = top;

    let y = top + (this.options.compact ? 2 : 3);
    if (this.options.links?.length) {
      let x = left;
      for (const link of this.options.links) {
        const label = `[${link.label}]`;
        if (x + label.length > left + width) {
          x = left;
          y += 1;
        }

        this.linkLayouts.push({
          link,
          rect: { x, y, width: label.length, height: 1 },
        });
        x += label.length + 2;
      }
      y += this.options.compact ? 1 : 2;
    }

    for (const field of this.options.fields) {
      const rows = this.getFieldRows(field);
      this.fieldLayouts.push({
        field,
        rect: { x: left, y, width, height: rows + 3 },
      });
      y += rows + 3;
    }

    const submitWidth = this.getButtonWidth(this.getSubmitLabel());
    const cancelWidth = this.hasCancelButton()
      ? this.getButtonWidth(this.getCancelLabel())
      : 0;
    const buttonGap = this.hasCancelButton() ? 2 : 0;
    const buttonsWidth = cancelWidth + buttonGap + submitWidth;
    const buttonsX = left + Math.floor((width - buttonsWidth) / 2);
    this.cancelRect = {
      x: buttonsX,
      y,
      width: cancelWidth,
      height: 1,
    };
    this.submitRect = {
      x: buttonsX + cancelWidth + buttonGap,
      y,
      width: submitWidth,
      height: 1,
    };
  }

  render(buffer: TuiBufferLike): void {
    if (this.tooSmall) {
      buffer.write(1, 1, "Terminal too small for this TUI.", styles.error);
      buffer.write(
        1,
        3,
        `Resize to at least ${this.options.minWidth}x${this.requiredHeight}. Press Esc to exit.`,
        styles.help,
      );
      return;
    }

    const titleX = this.headerX;
    const titleY = this.headerY;
    buffer.write(titleX, titleY, this.options.title, styles.title);
    buffer.write(
      titleX,
      titleY + 1,
      this.fit(
        this.options.help,
        this.fieldLayouts[0]?.rect.width ?? buffer.width,
      ),
      styles.help,
    );

    for (const [index, layout] of this.linkLayouts.entries()) {
      const active = this.isLinkFocused(index) || this.hoveredLinkIndex === index;
      buffer.write(
        layout.rect.x,
        layout.rect.y,
        `[${layout.link.label}]`,
        active ? styles.buttonActive : styles.button,
      );
    }

    for (const layout of this.fieldLayouts) {
      this.renderField(buffer, layout);
    }

    this.renderSubmit(buffer);

    const status = this.status || "Your message stays local until Submit.";
    buffer.write(
      titleX,
      this.submitRect.y + (this.options.compact ? 1 : 2),
      this.fit(status, this.fieldLayouts[0]?.rect.width ?? buffer.width),
      this.status.startsWith("Failed") || this.status.includes("required")
        ? styles.error
        : styles.help,
    );

    if (this.submitted) {
      buffer.write(
        titleX,
        this.submitRect.y + (this.options.compact ? 2 : 3),
        "Press any key to return to shell.",
        styles.help,
      );
    }
  }

  handleEvent(event: TuiEvent): boolean {
    if (this.submitted) {
      if (event.type === "key") this.options.onCancel?.();
      return true;
    }

    if (event.type === "key") return this.handleKey(event);
    if (event.type === "mouseMove") return this.handleMouseMove(event.x, event.y);
    if (event.type === "mouseDown") return this.handleMouseDown(event.x, event.y);
    if (event.type === "mouseUp") return this.handleMouseUp(event.x, event.y);

    return false;
  }

  getCursor(): Point | null {
    if (
      this.submitting ||
      this.submitted ||
      this.isSubmitFocused() ||
      this.isCancelFocused()
    ) {
      return null;
    }

    const layout = this.getFocusedFieldLayout();
    if (!layout) return null;

    const innerWidth = layout.rect.width - 4;
    const value = this.values[layout.field.id] ?? "";

    if (layout.field.type === "textarea") {
      const lines = this.wrapTail(value, innerWidth, this.getFieldRows(layout.field));
      const line = lines[lines.length - 1] ?? "";
      return {
        x: layout.rect.x + 2 + Math.min(line.length, innerWidth - 1),
        y: layout.rect.y + 2 + Math.max(0, lines.length - 1),
      };
    }

    const visible = this.fitTail(value, innerWidth);
    return {
      x: layout.rect.x + 2 + Math.min(visible.length, innerWidth - 1),
      y: layout.rect.y + 2,
    };
  }

  getHoverRange(): TuiHoverRange | null {
    if (this.hoveredLinkIndex >= 0) {
      const layout = this.linkLayouts[this.hoveredLinkIndex];
      if (layout) {
        return {
          row: layout.rect.y,
          startCol: layout.rect.x,
          endCol: layout.rect.x + layout.rect.width - 1,
        };
      }
    }

    if (this.hoveredCancel) {
      return {
        row: this.cancelRect.y,
        startCol: this.cancelRect.x,
        endCol: this.cancelRect.x + this.cancelRect.width - 1,
      };
    }

    if (!this.hoveredSubmit) return null;

    return {
      row: this.submitRect.y,
      startCol: this.submitRect.x,
      endCol: this.submitRect.x + this.submitRect.width - 1,
    };
  }

  getValues(): FormValues {
    return { ...this.values };
  }

  setStatus(status: string): void {
    this.status = status;
  }

  setSubmitting(submitting: boolean): void {
    this.submitting = submitting;
  }

  setSubmitted(submitted: boolean): void {
    this.submitted = submitted;
  }

  private handleKey(event: Extract<TuiEvent, { type: "key" }>): boolean {
    if (event.key === "escape") {
      this.options.onCancel?.();
      return true;
    }

    if (this.submitting) return true;

    if (event.key === "tab" || event.key === "arrowDown") {
      this.focusNext();
      return true;
    }
    if (event.key === "backtab" || event.key === "arrowUp") {
      this.focusPrevious();
      return true;
    }
    if (event.key === "enter") {
      const link = this.getFocusedLinkLayout();
      if (link) {
        this.options.onLink?.(link.link);
      } else if (this.isCancelFocused()) {
        this.options.onCancel?.();
      } else if (this.isSubmitFocused()) {
        this.options.onSubmit?.(this.getValues());
      } else {
        this.focusNext();
      }
      return true;
    }
    if (event.key === "backspace") {
      const layout = this.getFocusedFieldLayout();
      if (layout) {
        this.values[layout.field.id] = this.values[layout.field.id].slice(0, -1);
      }
      return true;
    }
    if (event.key === "char" && event.char) {
      const layout = this.getFocusedFieldLayout();
      if (layout) {
        this.values[layout.field.id] += event.char;
      }
      return true;
    }

    return false;
  }

  private handleMouseMove(x: number, y: number): boolean {
    this.hoveredLinkIndex = this.getLinkIndexAt(x, y);
    this.hoveredSubmit = this.isInsideSubmit(x, y);
    this.hoveredCancel = this.isInsideCancel(x, y);
    return this.hoveredLinkIndex >= 0 || this.hoveredSubmit || this.hoveredCancel;
  }

  private handleMouseDown(x: number, y: number): boolean {
    this.mouseDownLinkIndex = this.getLinkIndexAt(x, y);
    this.mouseDownSubmit = this.isInsideSubmit(x, y);
    this.mouseDownCancel = this.isInsideCancel(x, y);
    if (this.mouseDownLinkIndex >= 0) {
      this.focusIndex = this.mouseDownLinkIndex;
    }
    if (this.mouseDownCancel) this.focusIndex = this.getCancelFocusIndex();

    const fieldIndex = this.fieldLayouts.findIndex((layout) =>
      this.isInsideRect(x, y, layout.rect),
    );
    if (fieldIndex >= 0) this.focusIndex = this.linkLayouts.length + fieldIndex;
    return (
      this.mouseDownLinkIndex >= 0 ||
      this.mouseDownSubmit ||
      this.mouseDownCancel ||
      fieldIndex >= 0
    );
  }

  private handleMouseUp(x: number, y: number): boolean {
    const linkIndex = this.getLinkIndexAt(x, y);
    if (linkIndex >= 0 && linkIndex === this.mouseDownLinkIndex) {
      this.options.onLink?.(this.linkLayouts[linkIndex].link);
    }

    if (this.mouseDownSubmit && this.isInsideSubmit(x, y) && !this.submitting) {
      this.options.onSubmit?.(this.getValues());
    }
    if (this.mouseDownCancel && this.isInsideCancel(x, y)) {
      this.options.onCancel?.();
    }
    this.mouseDownLinkIndex = -1;
    this.mouseDownSubmit = false;
    this.mouseDownCancel = false;
    return true;
  }

  private renderField(buffer: TuiBufferLike, layout: FieldLayout): void {
    const focused = this.getFocusedFieldLayout() === layout;
    const style = focused ? styles.labelFocused : styles.label;
    const innerWidth = layout.rect.width - 2;

    buffer.write(layout.rect.x, layout.rect.y, layout.field.label, style);
    buffer.drawBox(
      {
        x: layout.rect.x,
        y: layout.rect.y + 1,
        width: layout.rect.width,
        height: layout.rect.height - 1,
      },
      style,
    );

    const rows = this.getFieldRows(layout.field);
    const value = this.values[layout.field.id] ?? "";
    const lines =
      layout.field.type === "textarea"
        ? this.wrapTail(value, innerWidth - 2, rows)
        : [this.fitTail(value, innerWidth - 2)];

    for (let i = 0; i < rows; i++) {
      buffer.write(
        layout.rect.x + 2,
        layout.rect.y + 2 + i,
        (lines[i] ?? "").padEnd(innerWidth - 2),
      );
    }
  }

  private renderSubmit(buffer: TuiBufferLike): void {
    const active = this.isSubmitFocused() || this.hoveredSubmit;
    const disabled = this.submitting || this.submitted;
    const style = disabled ? styles.disabled : active ? styles.buttonActive : styles.button;
    this.renderCancel(buffer);
    buffer.write(
      this.submitRect.x,
      this.submitRect.y,
      this.getSubmitLabel().padEnd(this.submitRect.width),
      style,
    );
  }

  private renderCancel(buffer: TuiBufferLike): void {
    if (!this.hasCancelButton() || this.submitted) return;

    const active = this.isCancelFocused() || this.hoveredCancel;
    buffer.write(
      this.cancelRect.x,
      this.cancelRect.y,
      this.getCancelLabel().padEnd(this.cancelRect.width),
      active ? styles.cancelButtonActive : styles.cancelButton,
    );
  }

  private focusNext(): void {
    this.focusIndex = (this.focusIndex + 1) % this.getFocusCount();
  }

  private focusPrevious(): void {
    this.focusIndex = (this.focusIndex - 1 + this.getFocusCount()) % this.getFocusCount();
  }

  private getFocusCount(): number {
    return this.linkLayouts.length + this.fieldLayouts.length + 1 + (this.hasCancelButton() ? 1 : 0);
  }

  private isLinkFocused(index: number): boolean {
    return this.focusIndex === index;
  }

  private getFocusedLinkLayout(): LinkLayout | null {
    return this.linkLayouts[this.focusIndex] ?? null;
  }

  private isSubmitFocused(): boolean {
    return this.focusIndex === this.getSubmitFocusIndex();
  }

  private isCancelFocused(): boolean {
    return this.hasCancelButton() && this.focusIndex === this.getCancelFocusIndex();
  }

  private getFocusedFieldLayout(): FieldLayout | null {
    return this.fieldLayouts[this.focusIndex - this.linkLayouts.length] ?? null;
  }

  private getPreferredHeight(width: number): number {
    const chromeHeight = this.options.compact ? 4 : 6;
    const linkGap = this.options.compact ? 1 : 2;
    return (
      chromeHeight +
      (this.options.links?.length ? this.getLinkRows(width) + linkGap : 0) +
      this.options.fields.reduce(
        (height, field) => height + this.getFieldRows(field) + 3,
        0,
      )
    );
  }

  private getFieldRows(field: FormFieldDefinition): number {
    return field.type === "textarea" ? field.rows ?? 3 : 1;
  }

  private getLinkRows(width: number): number {
    if (!this.options.links?.length) return 0;

    let rows = 1;
    let lineWidth = 0;
    for (const link of this.options.links) {
      const labelWidth = link.label.length + 2;
      const nextWidth = lineWidth === 0 ? labelWidth : lineWidth + 2 + labelWidth;
      if (nextWidth > width && lineWidth > 0) {
        rows += 1;
        lineWidth = labelWidth;
      } else {
        lineWidth = nextWidth;
      }
    }

    return rows;
  }

  private getSubmitLabel(): string {
    if (this.submitted) return "[  Sent  ]";
    if (this.submitting) return "[Sending]";
    return this.options.submitLabel;
  }

  private getCancelLabel(): string {
    return this.options.cancelLabel ?? "[Cancel]";
  }

  private getButtonWidth(label: string): number {
    return Math.max(label.length, 10);
  }

  private hasCancelButton(): boolean {
    return Boolean(this.options.onCancel);
  }

  private getCancelFocusIndex(): number {
    return this.linkLayouts.length + this.fieldLayouts.length;
  }

  private getSubmitFocusIndex(): number {
    return this.getCancelFocusIndex() + (this.hasCancelButton() ? 1 : 0);
  }

  private isInsideSubmit(x: number, y: number): boolean {
    return this.isInsideRect(x, y, this.submitRect);
  }

  private isInsideCancel(x: number, y: number): boolean {
    return this.hasCancelButton() && this.isInsideRect(x, y, this.cancelRect);
  }

  private getLinkIndexAt(x: number, y: number): number {
    return this.linkLayouts.findIndex((layout) => this.isInsideRect(x, y, layout.rect));
  }

  private isInsideRect(x: number, y: number, rect: Rect): boolean {
    return (
      x >= rect.x &&
      x < rect.x + rect.width &&
      y >= rect.y &&
      y < rect.y + rect.height
    );
  }

  private fit(text: string, width: number): string {
    if (text.length <= width) return text;
    return `${text.slice(0, Math.max(0, width - 3))}...`;
  }

  private fitTail(text: string, width: number): string {
    if (text.length <= width) return text;
    return text.slice(text.length - width);
  }

  private wrapTail(text: string, width: number, height: number): string[] {
    const lines: string[] = [];
    for (let index = 0; index < text.length; index += width) {
      lines.push(text.slice(index, index + width));
    }
    return (lines.length ? lines : [""]).slice(-height);
  }
}
