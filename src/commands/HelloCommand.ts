import config from "../core/config";
import { TypeCommand } from "./TypeCommand";

const TEXT = `
{{ "Greetings, stranger." | green }}
You’ve wandered into a land where code constructs reality, and every system tells a story

Hey! I'm {{ firstName | cyan }} {{ lastName | cyan }}, {{ position | yellow }} based in {{ location.city }}, {{ location.country }}.

I build scalable backend systems with Python, FastAPI & SQLAlchemy,
fueled by a background in applied math and a love for clean architecture.
Always exploring new stacks, always shipping.

{{ "Type " | dim }}{{ "<about>" | cyan }}{{ " for the full story, " | dim }}{{ "<cv>" | cyan }}{{ " for the formal PDF, or " | dim }}{{ "<help>" | cyan }}{{ " to see all commands." | dim }}
`;

export class HelloCommand extends TypeCommand {
  static name = "hello";
  text: string = TEXT;

  protected async getTextContext(): Promise<Record<string, unknown>> {
    try {
      const resp = await fetch(config.dataUrl);
      const data = await resp.json();

      return {
        ...data,
      };
    } catch {
      return {};
    }
  }
}
