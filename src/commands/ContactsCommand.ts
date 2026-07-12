import { BaseProcess } from "../process/BaseProcess";
import type {
  ProcessContext,
  ProcessMouseEvent,
  ProcessMouseResponse,
} from "../process/IProcess";
import dataService, { type ProfileData } from "../services/DataService";
import { sendEmail } from "../services/Email.js";
import {
  Form,
  type FormLinkDefinition,
  type FormValues,
  TerminalTuiSession,
  TuiRuntime,
} from "../tui";

export class ContactsCommand extends BaseProcess {
  static name = "contacts";

  private form: Form | null = null;
  private session: TerminalTuiSession | null = null;
  private resolveDone: (() => void) | null = null;
  private submitting = false;

  isInteractive(): boolean {
    return true;
  }

  protected async run(context: ProcessContext): Promise<void> {
    const { cols, rows } = context.stdlib.getWindowSize();
    const { links, status } = await this.loadLinks();
    const compact = this.isCompact(cols, rows);

    this.form = new Form({
      title: compact ? "Contact" : "Contact uplink",
      help: compact
        ? "Tab: next. Esc: abort."
        : "Fill the form, press Tab/Shift+Tab to navigate, Esc to abort.",
      submitLabel: "[ Submit ]",
      cancelLabel: "[ Cancel ]",
      compact,
      links: compact ? this.getCompactLinks(links, rows) : links,
      fields: [
        { id: "name", label: "Name", type: "input" },
        { id: "email", label: "Email", type: "input" },
        {
          id: "message",
          label: "Message",
          type: "textarea",
          rows: compact ? 1 : 2,
        },
      ],
      status,
      onLink: (link) => this.openLink(link),
      onSubmit: (values) => {
        void this.submit(values);
      },
      onCancel: () => this.finish(),
    });

    this.session = new TerminalTuiSession(
      context,
      new TuiRuntime(this.form, cols, rows),
    );
    this.session.start();

    try {
      await new Promise<void>((resolve) => {
        this.resolveDone = resolve;
      });
    } finally {
      this.session.dispose();
      this.session = null;
      this.form = null;
      this.resolveDone = null;
      this.moveToBottom();
    }
  }

  onInput(data: string): void {
    this.session?.handleInput(data);
  }

  onMouseEvent(event: ProcessMouseEvent): ProcessMouseResponse | void {
    return this.session?.handleMouseEvent(event);
  }

  private async submit(values: FormValues): Promise<void> {
    if (!this.form || !this.session || this.submitting) return;

    const validationError = this.validate(values);
    if (validationError) {
      this.form.setStatus(validationError);
      this.session.render();
      return;
    }

    this.submitting = true;
    this.form.setSubmitting(true);
    this.form.setStatus("Sending message through the tubes...");
    this.session.render();

    try {
      await sendEmail({
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
      });
      this.form.setSubmitted(true);
      this.form.setStatus(
        "Message sent. I will reply when the backend gods allow it.",
      );
    } catch {
      this.form.setStatus(
        "Failed to send. Check EmailJS env vars or try again later.",
      );
    } finally {
      this.submitting = false;
      this.form.setSubmitting(false);
      this.session.render();
    }
  }

  private validate(values: FormValues): string | null {
    if (!values.name.trim()) return "Name is required.";
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
      return "A valid email is required.";
    }
    if (!values.message.trim()) return "Message is required.";
    return null;
  }

  private async loadLinks(): Promise<{
    links: FormLinkDefinition[];
    status?: string;
  }> {
    try {
      const profile = await dataService.fetchData();
      return { links: this.getLinks(profile) };
    } catch {
      return {
        links: [],
        status: "Profile links unavailable; contact form still works.",
      };
    }
  }

  private getLinks(profile: ProfileData): FormLinkDefinition[] {
    const links: FormLinkDefinition[] = [];
    const seen = new Set<string>();

    const add = (id: string, label: string, value?: string) => {
      if (!value || seen.has(value)) return;
      seen.add(value);
      links.push({ id, label, value });
    };

    add("cv", "CV", profile.cvLink);
    for (const contact of profile.contacts) {
      if (contact.icon === "Phone") continue;
      add(contact.icon.toLowerCase(), contact.label, contact.link);
    }

    return links;
  }

  private isCompact(cols: number, rows: number): boolean {
    return cols < 56 || rows < 24;
  }

  private getCompactLinks(
    links: FormLinkDefinition[],
    rows: number,
  ): FormLinkDefinition[] {
    const maxLinks = rows < 20 ? 3 : 5;
    return links.slice(0, maxLinks).map((link) => ({
      ...link,
      label: this.getCompactLinkLabel(link),
    }));
  }

  private getCompactLinkLabel(link: FormLinkDefinition): string {
    const label = link.label.toLowerCase();

    if (link.id === "cv") return "CV";
    if (label.includes("github")) return "GH";
    if (label.includes("linkedin")) return "IN";
    if (label.includes("telegram")) return "TG";
    if (label.includes("email") || label.includes("mail")) return "Mail";

    return link.label.length <= 6 ? link.label : link.label.slice(0, 6);
  }

  private openLink(link: FormLinkDefinition): void {
    window.open(link.value, "_blank", "noopener,noreferrer");
  }

  private moveToBottom(): void {
    const rows = this.context?.stdlib.getWindowSize().rows || 1;
    this.write(`\x1b[${rows};1H\r\n`);
  }

  private finish(): void {
    this.resolveDone?.();
  }
}
