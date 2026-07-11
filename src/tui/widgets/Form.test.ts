import { describe, expect, it, vi } from "vitest";
import { TuiRuntime } from "../core";
import { Form } from "./Form";

function createForm(onSubmit = vi.fn()) {
  const form = new Form({
    title: "Contact uplink",
    help: "Help text",
    submitLabel: "[ Submit ]",
    fields: [
      { id: "name", label: "Name", type: "input" },
      { id: "email", label: "Email", type: "input" },
      { id: "message", label: "Message", type: "textarea", rows: 2 },
    ],
    onSubmit,
  });

  const runtime = new TuiRuntime(form, 80, 24);
  return { form, runtime, onSubmit };
}

describe("Form", () => {
  it("writes text into the focused field", () => {
    const { form, runtime } = createForm();

    runtime.dispatch({ type: "key", key: "char", char: "A" });

    expect(form.getValues().name).toBe("A");
  });

  it("moves focus forward and backward", () => {
    const { form, runtime } = createForm();

    runtime.dispatch({ type: "key", key: "tab" });
    runtime.dispatch({ type: "key", key: "char", char: "e" });
    runtime.dispatch({ type: "key", key: "backtab" });
    runtime.dispatch({ type: "key", key: "char", char: "n" });

    expect(form.getValues()).toMatchObject({ name: "n", email: "e" });
  });

  it("submits when the submit button is clicked", () => {
    const { runtime, onSubmit } = createForm();
    const frame = runtime.render();
    const hoverRange = frame.hoverRange;

    runtime.dispatch({ type: "key", key: "tab" });
    runtime.dispatch({ type: "key", key: "tab" });
    runtime.dispatch({ type: "key", key: "tab" });
    const submitFrame = runtime.render();
    const cells = submitFrame.buffer.getCells();
    const row = cells.findIndex((line) =>
      line.map((cell) => cell.char).join("").includes("[ Submit ]"),
    );
    const col = cells[row].map((cell) => cell.char).join("").indexOf("[");

    expect(hoverRange).toBeNull();
    runtime.dispatch({ type: "mouseMove", x: col, y: row });
    runtime.dispatch({ type: "mouseDown", x: col, y: row });
    runtime.dispatch({ type: "mouseUp", x: col, y: row });

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("activates a link when it is clicked", () => {
    const onLink = vi.fn();
    const form = new Form({
      title: "Contact uplink",
      help: "Help text",
      submitLabel: "[ Submit ]",
      links: [{ id: "cv", label: "CV", value: "https://example.com/cv.pdf" }],
      fields: [{ id: "name", label: "Name", type: "input" }],
      onLink,
    });
    const runtime = new TuiRuntime(form, 80, 24);
    const frame = runtime.render();
    const cells = frame.buffer.getCells();
    const row = cells.findIndex((line) =>
      line.map((cell) => cell.char).join("").includes("[CV]"),
    );
    const col = cells[row].map((cell) => cell.char).join("").indexOf("[CV]");

    runtime.dispatch({ type: "mouseMove", x: col, y: row });
    runtime.dispatch({ type: "mouseDown", x: col, y: row });
    runtime.dispatch({ type: "mouseUp", x: col, y: row });

    expect(onLink).toHaveBeenCalledWith({
      id: "cv",
      label: "CV",
      value: "https://example.com/cv.pdf",
    });
  });

  it("keeps the header above top links", () => {
    const form = new Form({
      title: "Contact uplink",
      help: "Help text",
      submitLabel: "[ Submit ]",
      links: [{ id: "cv", label: "CV", value: "https://example.com/cv.pdf" }],
      fields: [{ id: "name", label: "Name", type: "input" }],
    });
    const runtime = new TuiRuntime(form, 80, 24);
    const lines = runtime
      .render()
      .buffer.getCells()
      .map((line) => line.map((cell) => cell.char).join(""));

    const titleRow = lines.findIndex((line) => line.includes("Contact uplink"));
    const linkRow = lines.findIndex((line) => line.includes("[CV]"));

    expect(titleRow).toBeGreaterThanOrEqual(0);
    expect(linkRow).toBeGreaterThan(titleRow);
  });

  it("recovers after resizing from too small back to normal", () => {
    const form = new Form({
      title: "Contact uplink",
      help: "Help text",
      submitLabel: "[ Submit ]",
      links: [
        { id: "cv", label: "CV", value: "https://example.com/cv.pdf" },
        { id: "github", label: "GitHub", value: "https://github.com/test" },
        { id: "linkedin", label: "LinkedIn", value: "https://linkedin.com/in/test" },
        { id: "telegram", label: "Telegram", value: "https://t.me/test" },
      ],
      fields: [
        { id: "name", label: "Name", type: "input" },
        { id: "email", label: "Email", type: "input" },
        { id: "message", label: "Message", type: "textarea", rows: 2 },
      ],
    });
    const runtime = new TuiRuntime(form, 80, 24);

    const normalFrame = runtime.render();
    expect(
      normalFrame.buffer
        .getCells()
        .map((line) => line.map((cell) => cell.char).join(""))
        .join("\n"),
    ).not.toContain("Terminal too small");

    runtime.resize(60, 18);
    expect(
      runtime
        .render()
        .buffer.getCells()
        .map((line) => line.map((cell) => cell.char).join(""))
        .join("\n"),
    ).toContain("Terminal too small");

    runtime.resize(80, 24);
    const resizedText = runtime
      .render()
      .buffer.getCells()
      .map((line) => line.map((cell) => cell.char).join(""))
      .join("\n");

    expect(resizedText).toContain("Contact uplink");
    expect(resizedText).toContain("[CV]");
    expect(resizedText).not.toContain("Terminal too small");
  });
});
