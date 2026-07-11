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

    this.form = new Form({
      title: "Contact uplink",
      help: "Fill the form, press Tab/Shift+Tab to navigate, Esc to abort.",
      submitLabel: "[ Submit ]",
      links,
      fields: [
        { id: "name", label: "Name", type: "input" },
        { id: "email", label: "Email", type: "input" },
        { id: "message", label: "Message", type: "textarea", rows: 2 },
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
