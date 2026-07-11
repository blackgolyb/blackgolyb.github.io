import { BaseProcess } from "../process/BaseProcess";
import type { ProcessContext } from "../process/IProcess";
import dataService, {
  type ProfileContact,
  type ProfileData,
  type ProfileEducation,
  type ProfileExperience,
  type ProfileSkillGroup,
} from "../services/DataService";

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const RED = "\x1b[31m";

export class AboutCommand extends BaseProcess {
  static name = "about";

  protected async run(context: ProcessContext): Promise<void> {
    try {
      const profile = await dataService.fetchData();
      this.renderProfile(profile, context.stdlib.getWindowSize().cols);
    } catch {
      this.writeLine(`${RED}Unable to load profile data.${RESET}`);
      this.writeLine(
        `${DIM}Try again later, or run <cv> for the PDF version.${RESET}`,
      );
    }
  }

  private renderProfile(profile: ProfileData, cols: number): void {
    const contentWidth = Math.min(Math.max(cols - 4, 56), 96);
    const fullName = `${profile.firstName} ${profile.lastName}`;

    this.writeLine(`${BOLD}${GREEN}${fullName}${RESET}`);
    this.writeLine(
      `${CYAN}${profile.position}${RESET} ${DIM}| ${profile.location.city}, ${profile.location.country}${RESET}`,
    );
    this.writeLine("");

    this.section("Snapshot");
    this.writeWrapped(
      "Backend developer focused on reliable APIs, payment systems, integrations, data synchronization, and pragmatic architecture that keeps production calm.",
      contentWidth,
    );
    this.writeWrapped(
      "I like systems that are boring in production, clear in logs, and pleasant enough that future-me does not file a bug report against past-me.",
      contentWidth,
    );
    this.writeLine("");

    this.section("Core Stack");
    for (const group of profile.skills) {
      this.renderSkillGroup(group, contentWidth);
    }
    this.writeLine("");

    this.section("Experience");
    for (const experience of profile.experience) {
      this.renderExperience(experience, contentWidth);
    }

    this.section("Education");
    for (const education of profile.education) {
      this.renderEducation(education, contentWidth);
    }
    this.writeLine("");

    this.section("Links");
    this.renderLinks(profile.contacts);
    this.writeLine("");
    this.writeLine(
      `${DIM}Need the formal version? Run ${CYAN}<cv>${RESET}${DIM}.${RESET}`,
    );
  }

  private renderSkillGroup(group: ProfileSkillGroup, width: number): void {
    this.writeWrapped(
      `${YELLOW}${group.name.padEnd(10)}${RESET} ${group.skills.join("  ")}`,
      width,
      "  ",
    );
  }

  private renderExperience(experience: ProfileExperience, width: number): void {
    this.writeLine(
      `${BOLD}${experience.name}${RESET} ${DIM}${this.formatPeriod(
        experience.startDate,
        experience.endDate,
      )} | ${experience.city}${RESET}`,
    );
    this.writeLine(`  ${CYAN}${experience.position}${RESET}`);

    for (const description of this.getExperienceHighlights(experience)) {
      this.writeWrapped(description, width, "  - ");
    }

    this.writeWrapped(
      `${DIM}Tech:${RESET} ${experience.technologies.join(", ")}`,
      width,
      "    ",
    );
    this.writeLine("");
  }

  private renderEducation(education: ProfileEducation, width: number): void {
    this.writeWrapped(
      `${BOLD}${education.degree}${RESET}, ${education.major}`,
      width,
      "  ",
    );
    this.writeWrapped(
      `${education.name} ${DIM}${this.formatPeriod(
        education.startDate,
        education.endDate,
      )}${RESET}`,
      width,
      "    ",
    );
  }

  private renderLinks(contacts: ProfileContact[]): void {
    for (const contact of contacts) {
      if (contact.icon === "Phone") continue;

      this.writeLine(`  ${CYAN}${contact.label}${RESET}  ${contact.link}`);
    }
  }

  private getExperienceHighlights(experience: ProfileExperience): string[] {
    const seen = new Set<string>();

    return experience.descriptions.filter((description) => {
      const normalized = description
        .toLowerCase()
        .replace(/^(led|designed and implemented) /, "")
        .replace(/[.,]/g, "")
        .trim();

      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
  }

  private section(title: string): void {
    this.writeLine(`${GREEN}${BOLD}${title}${RESET}`);
  }

  private writeWrapped(text: string, width: number, prefix: string = ""): void {
    const visibleText = this.stripAnsi(text);
    if (prefix.length + visibleText.length <= width) {
      this.writeLine(`${prefix}${text}`);
      return;
    }

    const words = text.split(" ");
    let line = "";

    for (const word of words) {
      const nextLine = line ? `${line} ${word}` : word;
      if (prefix.length + this.stripAnsi(nextLine).length > width && line) {
        this.writeLine(`${prefix}${line}`);
        line = word;
      } else {
        line = nextLine;
      }
    }

    if (line) {
      this.writeLine(`${prefix}${line}`);
    }
  }

  private formatPeriod(startDate: string, endDate: string | null): string {
    return `${this.formatDate(startDate)} - ${
      endDate ? this.formatDate(endDate) : "Present"
    }`;
  }

  private formatDate(date: string): string {
    const [year, month] = date.split("-");
    if (!month) return year;

    const monthName = new Intl.DateTimeFormat("en", { month: "short" }).format(
      new Date(Number(year), Number(month) - 1),
    );
    return `${monthName} ${year}`;
  }

  private stripAnsi(text: string): string {
    // biome-ignore lint: ANSI escape sequence pattern
    return text.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "");
  }
}
