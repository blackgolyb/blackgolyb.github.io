import config from "../core/config";
import { TypeCommand } from "./TypeCommand";

const TEXT = `
\x1b[32mGreetings, stranger.\x1b[0m
You’ve wandered into a land where code constructs reality, and every system tells a story

Hey! I'm \x1b[36m{{firstName}} {{lastName}}\x1b[0m, {{age}} y.o. \x1b[33m{{position}}\x1b[0m from {{location.city}}, {{location.country}}.

I build scalable backend systems with Python, FastAPI & SQLAlchemy,
fueled by a background in applied math and a love for clean architecture.
Always exploring new stacks, always shipping.

\x1b[2mType \x1b[0m\x1b[36m<help>\x1b[0m\x1b[2m to see all commands, or try \x1b[0m\x1b[36m<cv>\x1b[0m\x1b[2m to grab my resume.\x1b[0m
`;

export class HelloCommand extends TypeCommand {
  static name = "hello";
  text: string = TEXT;

  protected async getTextContext(): Promise<Record<string, unknown>> {
    try {
      const resp = await fetch(config.dataUrl);
      const data = await resp.json();

      const age = Math.floor(
        (Date.now() - new Date(data.dob).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000),
      );
      return {
        ...data,
        age,
      };
    } catch {
      return {};
    }
  }
}
